// Razorpay webhook — verifies signature, activates entitlements.
// Configure in Razorpay dashboard: payment.captured
// Webhook URL: https://<ref>.supabase.co/functions/v1/razorpay-webhook
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2"

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } })

async function verifySignature(body: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  )
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
  const expected = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, "0")).join("")
  return expected === signature
}

// paise -> credits granted (tune to actual pack pricing)
const CREDIT_PACKS: Record<number, { credits: number; label: string }> = {
  9900: { credits: 10, label: "Starter pack" },
  24900: { credits: 30, label: "Growth pack" },
  49900: { credits: 75, label: "Pro pack" },
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405)

  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")
  if (!secret) return json({ error: "Webhook secret not configured" }, 500)

  const body = await req.text()
  const signature = req.headers.get("x-razorpay-signature") ?? ""
  if (!(await verifySignature(body, signature, secret)))
    return json({ error: "Invalid signature" }, 401)

  const event = JSON.parse(body)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  if (event.event !== "payment.captured")
    return json({ ok: true, ignored: event.event })

  const payment = event.payload?.payment?.entity
  const rzpOrderId = payment?.order_id
  if (!rzpOrderId) return json({ error: "No order id" }, 400)

  // idempotent: skip if already processed
  const { data: order } = await supabase
    .from("orders").select("*").eq("razorpay_order_id", rzpOrderId).maybeSingle()
  if (!order) return json({ error: "Unknown order" }, 404)
  if (order.status === "paid") return json({ ok: true, duplicate: true })

  await supabase.from("orders").update({
    status: "paid",
    razorpay_payment_id: payment?.id ?? null,
  }).eq("id", order.id)

  if (order.purpose === "mentor_subscription") {
    const planId = order.reference_id
    const { data: plan } = await supabase
      .from("mentor_plans").select("mentor_id, name").eq("id", planId).single()
    if (plan) {
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      const { data: existing } = await supabase.from("mentor_subscriptions")
        .select("id").eq("mentor_id", plan.mentor_id).eq("mentee_id", order.user_id)
        .maybeSingle()
      if (existing) {
        await supabase.from("mentor_subscriptions").update({
          status: "active", plan_id: planId,
          razorpay_payment_id: payment?.id ?? null,
          current_period_end: periodEnd.toISOString(),
        }).eq("id", existing.id)
      } else {
        await supabase.from("mentor_subscriptions").insert({
          mentor_id: plan.mentor_id, mentee_id: order.user_id, plan_id: planId,
          status: "active", razorpay_payment_id: payment?.id ?? null,
          current_period_end: periodEnd.toISOString(),
        })
      }

      // payout ledger — 15% platform commission (amounts in paise → stored as ₹)
      const amountInr = order.amount / 100
      const commission = Math.round(amountInr * 0.15)
      await supabase.from("payouts").insert({
        mentor_id: plan.mentor_id,
        label: `${plan.name} subscription`,
        amount: amountInr - commission,
        commission,
        status: "pending",
      })
      await supabase.from("notifications").insert({
        user_id: plan.mentor_id,
        text: `New subscriber on "${plan.name}" — ₹${amountInr - commission} after commission`,
        link: "/mentor/mentees",
      })
    }
  } else {
    const pack = CREDIT_PACKS[order.amount] ?? {
      credits: Math.round(order.amount / 990),
      label: "Credit purchase",
    }
    await supabase.from("credit_transactions").insert({
      user_id: order.user_id, delta: pack.credits, reason: pack.label,
    })
    // keep denormalized balance in sync
    const { data: p } = await supabase.from("profiles").select("credits").eq("id", order.user_id).single()
    await supabase.from("profiles")
      .update({ credits: (p?.credits ?? 0) + pack.credits })
      .eq("id", order.user_id)
  }

  await supabase.from("invoices").insert({
    user_id: order.user_id,
    label: order.purpose === "mentor_subscription" ? "Mentor subscription" : "Credit purchase",
    amount: order.amount, status: "paid",
  })

  return json({ ok: true })
})
