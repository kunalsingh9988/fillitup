// RLS hardening test — proves the security invariants hold for two live users.
// Run BEFORE migration 0010 → expect FAILURES (the holes exist today).
// Run AFTER  → all must PASS.
//
// Usage:  source .env && node scripts/rls-test.mjs
// Needs:  VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

const URL = process.env.VITE_SUPABASE_URL
const ANON = process.env.VITE_SUPABASE_ANON_KEY
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !ANON || !SVC) {
  console.error("missing env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY")
  process.exit(2)
}

const ts = Date.now().toString(36)
const users = {}
const results = []

function check(name, cond, detail = "") {
  results.push({ name, ok: !!cond })
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`)
}

async function signup(email, role) {
  const r = await fetch(`${URL}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "RlsTest!234", data: { role, full_name: email } }),
  })
  const d = await r.json()
  let token = d.access_token
  const id = d.user?.id ?? d.id
  if (!token) {
    await fetch(`${URL}/auth/v1/admin/users/${id}`, {
      method: "PUT",
      headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email_confirm: true }),
    })
    const t = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "RlsTest!234" }),
    }).then(r => r.json())
    token = t.access_token
  }
  return { id, token }
}

const rest = (path, token, opts = {}) =>
  fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: ANON, Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(opts.headers ?? {}) },
    ...opts,
  })

const svc = (path, opts = {}) =>
  fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json" },
    ...opts,
  })

const rpc = (fn, body, token) =>
  fetch(`${URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: ANON, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

async function main() {
  console.log("creating test users…")
  users.a = await signup(`rls-a-${ts}@test.dev`, "seeker")
  users.b = await signup(`rls-b-${ts}@test.dev`, "seeker")
  // anchor row for A
  await svc(`seeker_profiles`, {
    method: "POST",
    body: JSON.stringify({ user_id: users.a.id }),
    headers: { Prefer: "resolution=merge-duplicates" },
  })
  await svc(`seeker_profiles`, {
    method: "POST",
    body: JSON.stringify({ user_id: users.b.id }),
    headers: { Prefer: "resolution=merge-duplicates" },
  })

  // 1. self credit escalation — THE money hole
  const patch = await rest(`seeker_profiles?user_id=eq.${users.a.id}`, users.a.token, {
    method: "PATCH", body: JSON.stringify({ credits: 99999 }),
  })
  const balance = await svc(`seeker_profiles?user_id=eq.${users.a.id}&select=credits`).then(r => r.json())
  check("cannot PATCH own credits", !(patch.ok && balance[0]?.credits === 99999), `patch ${patch.status}`)

  // 2. role self-assignment
  const rolePatch = await rest(`profiles?id=eq.${users.a.id}`, users.a.token, {
    method: "PATCH", body: JSON.stringify({ role: "employer" }),
  })
  const roleNow = await svc(`profiles?id=eq.${users.a.id}&select=role`).then(r => r.json())
  check("cannot PATCH own role", !(rolePatch.ok && roleNow[0]?.role === "employer"), `patch ${rolePatch.status}`)

  // 3. onboarding_done self-write
  const obPatch = await rest(`profiles?id=eq.${users.a.id}`, users.a.token, {
    method: "PATCH", body: JSON.stringify({ onboarding_done: true }),
  })
  const obNow = await svc(`profiles?id=eq.${users.a.id}&select=onboarding_done`).then(r => r.json())
  check("cannot PATCH onboarding_done", !(obPatch.ok && obNow[0]?.onboarding_done === true), `patch ${obPatch.status}`)

  // 4. insert credit ledger rows directly (mint or fake spends)
  const mint = await rest("credit_transactions", users.a.token, {
    method: "POST", body: JSON.stringify({ user_id: users.a.id, delta: 500, reason: "self-mint" }),
  })
  check("cannot INSERT credit_transactions", !mint.ok, `insert ${mint.status}`)
  const spend = await rest("credit_transactions", users.a.token, {
    method: "POST", body: JSON.stringify({ user_id: users.a.id, delta: -1, reason: "fake spend" }),
  })
  check("cannot INSERT fake spends either", !spend.ok, `insert ${spend.status}`)

  // 5. cross-user private reads
  const bSp = await rest(`seeker_profiles?user_id=eq.${users.b.id}`, users.a.token).then(r => r.json())
  check("cannot read other seeker_profiles", bSp.length === 0, `got ${bSp.length}`)
  await svc(`notifications`, { method: "POST", body: JSON.stringify({ user_id: users.b.id, text: "hi" }) })
  const bNotifRead = await rest(`notifications?user_id=eq.${users.b.id}`, users.a.token).then(r => r.json())
  check("cannot read other notifications", bNotifRead.length === 0, `got ${bNotifRead.length}`)
  const bCredits = await rest(`credit_transactions?user_id=eq.${users.b.id}`, users.a.token).then(r => r.json())
  check("cannot read other credit ledger", bCredits.length === 0, `got ${bCredits.length}`)

  // 6. profiles directory visibility — non-shared user must be invisible
  const bProfile = await rest(`profiles?id=eq.${users.b.id}&select=id`, users.a.token).then(r => r.json())
  check("cannot read unrelated profile", bProfile.length === 0, `got ${bProfile.length}`)

  // 7. mentor subscription self-activation
  const sub = await rest("mentor_subscriptions", users.a.token, {
    method: "POST",
    body: JSON.stringify({ mentee_id: users.a.id, mentor_id: users.b.id, plan_id: crypto.randomUUID(), status: "active" }),
  })
  check("cannot self-activate mentor sub", !sub.ok, `insert ${sub.status}`)

  // 8. credit economics via RPC — grant 5, spend 3 ok, overspend rejected
  const grant = await fetch(`${URL}/rest/v1/rpc/grant_credits`, {
    method: "POST",
    headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_user_id: users.a.id, p_amount: 5, p_reason: "rls test grant" }),
  })
  check("service grant_credits works", grant.ok, `grant ${grant.status}`)
  const bal1 = await rpc("spend_credits", { p_amount: 3, p_reason: "test spend" }, users.a.token)
  check("spend_credits succeeds", bal1.ok && (await bal1.json()) === 2, `spend ${bal1.status}`)
  const over = await rpc("spend_credits", { p_amount: 99, p_reason: "overspend" }, users.a.token)
  check("overspend rejected", !over.ok, `spend ${over.status}`)
  const bal2 = await svc(`seeker_profiles?user_id=eq.${users.a.id}&select=credits`).then(r => r.json())
  check("balance is server-truth (2)", bal2[0]?.credits === 2, `got ${bal2[0]?.credits}`)
  const negGrant = await rpc("grant_credits", { p_amount: 10, p_reason: "user grant attempt", p_user_id: users.a.id }, users.a.token)
  check("user cannot grant_credits", !negGrant.ok, `grant ${negGrant.status}`)

  // 9. safe columns still writable
  const safePatch = await rest(`seeker_profiles?user_id=eq.${users.a.id}`, users.a.token, {
    method: "PATCH", body: JSON.stringify({ title: "Still works" }),
  })
  check("safe columns still writable", safePatch.ok, `patch ${safePatch.status}`)

  // 10. no insert-with-credits shortcut
  const spInsert = await rest("seeker_profiles", users.a.token, {
    method: "POST",
    body: JSON.stringify({ user_id: users.a.id, credits: 5000 }),
  })
  const creditsNow = await svc(`seeker_profiles?user_id=eq.${users.a.id}&select=credits`).then(r => r.json())
  check("insert cannot set credits", !(spInsert.ok && creditsNow[0]?.credits === 5000), `insert ${spInsert.status}`)
}

async function cleanup() {
  for (const key of Object.keys(users)) {
    const u = users[key]
    await svc(`credit_transactions?user_id=eq.${u.id}`, { method: "DELETE" }).catch(() => {})
    await svc(`seeker_profiles?user_id=eq.${u.id}`, { method: "DELETE" }).catch(() => {})
    await svc(`notifications?user_id=eq.${u.id}`, { method: "DELETE" }).catch(() => {})
    await svc(`profiles?id=eq.${u.id}`, { method: "DELETE" }).catch(() => {})
    await fetch(`${URL}/auth/v1/admin/users/${u.id}`, {
      method: "DELETE", headers: { apikey: SVC, Authorization: `Bearer ${SVC}` },
    }).catch(() => {})
  }
}

main()
  .catch(e => { console.error("test error:", e.message); results.push({ name: "run", ok: false }) })
  .finally(async () => {
    await cleanup()
    const failed = results.filter(r => !r.ok)
    console.log(`\n${results.length - failed.length}/${results.length} passed`)
    process.exit(failed.length ? 1 : 0)
  })
