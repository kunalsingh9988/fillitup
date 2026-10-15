// Transactional email via Resend.
// POST /functions/v1/send-email  { template, to, data }
// Called from edge functions / database webhooks — service role only.
// deno-lint-ignore-file no-explicit-any
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } })

const FROM = Deno.env.get("EMAIL_FROM") ?? "Fill-it-up <onboarding@resend.dev>"

function render(template: string, d: Record<string, any>): { subject: string; html: string } {
  const wrap = (title: string, body: string) =>
    `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px">
      <h2 style="margin:0 0 16px">${title}</h2>
      <div style="color:#444;line-height:1.6">${body}</div>
      <p style="color:#999;font-size:12px;margin-top:32px">— The Fill-it-up team</p>
    </div>`
  switch (template) {
    case "welcome":
      return {
        subject: "Welcome to Fill-it-up",
        html: wrap("Welcome aboard 👋", `Hi ${d.name ?? "there"},<br><br>Your ${d.role ?? ""} account is ready. <a href="${d.url ?? "https://fillitup.vercel.app"}">Open your dashboard</a>.`),
      }
    case "application-status":
      return {
        subject: `Application update: ${d.jobTitle ?? "your application"}`,
        html: wrap("Application update", `Your application for <b>${d.jobTitle}</b> at <b>${d.company}</b> moved to <b>${d.stage}</b>.`),
      }
    case "session-reminder":
      return {
        subject: `Session reminder: ${d.title ?? "mentoring session"}`,
        html: wrap("Session reminder", `Your session <b>${d.title}</b> is on <b>${d.when}</b>. ${d.link ? `<a href="${d.link}">Join link</a>` : ""}`),
      }
    case "payout":
      return {
        subject: "Payout processed",
        html: wrap("Payout processed", `₹${d.amount} is on its way to your account.${d.period ? ` (Period: ${d.period})` : ""}`),
      }
    default:
      return { subject: d.subject ?? "Fill-it-up notification", html: wrap(d.subject ?? "Notification", d.body ?? "") }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return json({ error: "POST only" }, 405)

  const key = Deno.env.get("RESEND_API_KEY")
  if (!key) return json({ error: "RESEND_API_KEY not configured" }, 500)

  // internal callers only — dedicated secret (env SUPABASE_SERVICE_ROLE_KEY
  // uses the new key format, so equality against the legacy JWT fails)
  const allowed = [
    Deno.env.get("INTERNAL_CALL_SECRET"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    ...(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "").split(","),
  ].filter(Boolean)
  const auth = (req.headers.get("Authorization") ?? "").replace("Bearer ", "")
  if (allowed.length && !allowed.includes(auth))
    return json({ error: "Unauthorized" }, 401)

  const { template, to, data } = await req.json().catch(() => ({}))
  if (!to || !template) return json({ error: "template + to required" }, 400)

  const { subject, html } = render(template, data ?? {})
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  })
  if (!res.ok) return json({ error: `Resend: ${await res.text()}` }, 502)
  return json({ ok: true, id: (await res.json()).id })
})
