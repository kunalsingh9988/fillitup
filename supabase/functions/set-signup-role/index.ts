// Sets the signup role for brand-new accounts — needed because profiles.role
// is never client-writable (migration 0010). Only applies to profiles created
// within the last 15 minutes whose role is still the 'seeker' default.
// POST /functions/v1/set-signup-role  { role: "seeker"|"employer"|"mentor" }
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } })

const ROLES = new Set(["seeker", "employer", "mentor"])
const GRACE_MS = 15 * 60 * 1000

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return json({ error: "POST only" }, 405)

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) return json({ error: "Unauthorized" }, 401)

  const authed = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user }, error: authErr } = await authed.auth.getUser()
  if (authErr || !user) return json({ error: "Unauthorized" }, 401)

  const { role } = await req.json().catch(() => ({}))
  if (!ROLES.has(role)) return json({ error: "Invalid role" }, 400)

  const service = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // only within the signup grace window and only off the default role —
  // this is a signup path, not a role-switching API
  const cutoff = new Date(Date.now() - GRACE_MS).toISOString()
  const { data, error } = await service
    .from("profiles")
    .update({ role })
    .eq("id", user.id)
    .eq("role", "seeker")
    .gte("created_at", cutoff)
    .select("role")

  if (error) return json({ error: "Update failed" }, 500)
  if (!data?.length) return json({ error: "Role can only be set during signup" }, 403)
  return json({ ok: true, role })
})
