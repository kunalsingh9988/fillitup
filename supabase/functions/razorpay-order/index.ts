// Creates a Razorpay order for seeker plans/credits or mentor subscriptions.
// POST /functions/v1/razorpay-order  { kind: "credits"|"mentor", planKey?, mentorPlanId?, amountInr }
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } })

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return json({ error: "POST only" }, 405)

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) return json({ error: "Unauthorized" }, 401)

  const keyId = Deno.env.get("RAZORPAY_KEY_ID")
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")
  if (!keyId || !keySecret) return json({ error: "Razorpay not configured" }, 500)

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )
  const { data: { user }, error: authErr } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  )
  if (authErr || !user) return json({ error: "Unauthorized" }, 401)

  const { kind, mentorPlanId, amountInr } = await req.json().catch(() => ({}))
  const amountPaise = Math.round(Number(amountInr) * 100)
  if (!amountPaise || amountPaise < 100) return json({ error: "Invalid amount" }, 400)
  if (kind === "mentor" && !mentorPlanId) return json({ error: "mentorPlanId required" }, 400)

  const receipt = `fiu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: { kind, user_id: user.id, mentor_plan_id: mentorPlanId ?? "" },
    }),
  })
  if (!rzpRes.ok) return json({ error: `Razorpay: ${await rzpRes.text()}` }, 502)
  const order = await rzpRes.json()

  await supabase.from("orders").insert({
    user_id: user.id,
    razorpay_order_id: order.id,
    purpose: kind === "mentor" ? "mentor_subscription" : "credits",
    reference_id: mentorPlanId ?? null,
    amount: amountPaise,
    currency: "INR",
    status: "created",
  })

  return json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId, // publishable — safe for checkout.js
  })
})
