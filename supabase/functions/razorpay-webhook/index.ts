// Razorpay webhook — verifies signature (constant-time), validates the paid
// amount against the stored order, grants entitlements atomically, logs every
// event, and handles failures + refunds.
// Configure in Razorpay dashboard: payment.captured, payment.failed, refund.processed
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2"

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } })

async function hmacHex(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  )
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
  return [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, "0")).join("")
}

// XOR-scan comparison — never short-circuits on content (fixed 64-hex shape).
function timingSafeEq(a: string, b: string): boolean {
  const ba = new TextEncoder().encode(a)
  const bb = new TextEncoder().encode(b)
  if (ba.length !== bb.length) return false
  let diff = 0
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i]
  return diff === 0
}

const COMMISSION_PCT = Number(Deno.env.get("PLATFORM_COMMISSION_PCT") ?? 15)

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405)

  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")
  if (!secret) return json({ error: "Webhook secret not configured" }, 500)

  const body = await req.text()
  const signature = req.headers.get("x-razorpay-signature") ?? ""
  const expected = await hmacHex(body, secret)
  if (!timingSafeEq(expected, signature)) return json({ error: "Invalid signature" }, 401)

  const event = JSON.parse(body)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // log every event first — nothing is silently dropped
  const payment = event.payload?.payment?.entity
  const refund = event.payload?.refund?.entity
  const { data: logRow } = await supabase.from("webhook_events").insert({
    event: event.event,
    razorpay_order_id: payment?.order_id ?? null,
    razorpay_payment_id: payment?.id ?? refund?.payment_id ?? null,
    payload: event,
  }).select("id").single()
  const markProcessed = async (error?: string) => {
    if (logRow?.id)
      await supabase.from("webhook_events").update({ processed: !error, error: error ?? null }).eq("id", logRow.id)
  }

  try {
    switch (event.event) {
      case "payment.captured": {
        const rzpOrderId = payment?.order_id
        if (!rzpOrderId) { await markProcessed("no order id"); return json({ error: "No order id" }, 400) }

        const { data: order } = await supabase
          .from("orders").select("*").eq("razorpay_order_id", rzpOrderId).maybeSingle()
        if (!order) { await markProcessed("unknown order"); return json({ error: "Unknown order" }, 404) }

        // amount + currency must match what we issued — never trust the callback
        if (payment.amount !== order.amount || payment.currency !== order.currency) {
          await supabase.from("orders").update({ status: "mismatch" }).eq("id", order.id)
          await markProcessed(`amount mismatch ${payment.amount}!=${order.amount}`)
          return json({ error: "Amount mismatch" }, 400)
        }

        // atomic idempotency — claim the order exactly once
        const { data: claimed } = await supabase
          .from("orders")
          .update({ status: "paid", razorpay_payment_id: payment.id })
          .eq("id", order.id).neq("status", "paid")
          .select("id")
        if (!claimed?.length) { await markProcessed(); return json({ ok: true, duplicate: true }) }

        /* ---- entitlements ---- */
        if (order.purpose === "mentor_subscription") {
          const planId = order.reference_id
          const { data: plan } = await supabase
            .from("mentor_plans").select("mentor_id, name").eq("id", planId).single()
          if (plan) {
            const periodEnd = new Date()
            periodEnd.setMonth(periodEnd.getMonth() + 1)
            // activates the pending row the client created, or inserts fresh
            const { data: existing } = await supabase.from("mentor_subscriptions")
              .select("id").eq("mentor_id", plan.mentor_id).eq("mentee_id", order.user_id)
              .maybeSingle()
            if (existing) {
              await supabase.from("mentor_subscriptions").update({
                status: "active", plan_id: planId,
                razorpay_payment_id: payment.id,
                current_period_end: periodEnd.toISOString(),
              }).eq("id", existing.id)
            } else {
              await supabase.from("mentor_subscriptions").insert({
                mentor_id: plan.mentor_id, mentee_id: order.user_id, plan_id: planId,
                status: "active", razorpay_payment_id: payment.id,
                current_period_end: periodEnd.toISOString(),
              })
            }
            const amountInr = order.amount / 100
            const commission = Math.round(amountInr * COMMISSION_PCT / 100)
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
        } else if (order.purpose === "credits") {
          const credits = Number(order.meta?.credits ?? 0)
          if (credits <= 0) throw new Error(`order ${order.id} has no credits in meta`)
          await supabase.rpc("grant_credits", {
            p_user_id: order.user_id, p_amount: credits, p_reason: "Credit purchase",
          })
        }
        // seeker_plan: entitlement flag can be added when plans ship

        await supabase.from("invoices").insert({
          user_id: order.user_id,
          label: order.purpose === "mentor_subscription" ? "Mentor subscription" : "Credit purchase",
          amount: order.amount, status: "paid",
        })
        await markProcessed()
        return json({ ok: true })
      }

      case "payment.failed": {
        const rzpOrderId = payment?.order_id
        if (rzpOrderId)
          await supabase.from("orders").update({ status: "failed" })
            .eq("razorpay_order_id", rzpOrderId).eq("status", "created")
        await markProcessed()
        return json({ ok: true })
      }

      case "refund.processed": {
        // refunds arrive keyed by payment id, not order id
        const paymentId = refund?.payment_id
        const { data: order } = paymentId
          ? await supabase.from("orders").select("*").eq("razorpay_payment_id", paymentId).maybeSingle()
          : { data: null }
        if (!order) { await markProcessed("refund for unknown payment"); return json({ ok: true, unmatched: true }) }
        if (order.status === "refunded") { await markProcessed(); return json({ ok: true, duplicate: true }) }
        await supabase.from("orders").update({ status: "refunded" }).eq("id", order.id)

        if (order.purpose === "mentor_subscription") {
          await supabase.from("mentor_subscriptions")
            .update({ status: "canceled" })
            .eq("razorpay_payment_id", paymentId).eq("status", "active")
        } else if (order.purpose === "credits") {
          const credits = Number(order.meta?.credits ?? 0)
          if (credits > 0)
            await supabase.rpc("grant_credits", {
              p_user_id: order.user_id, p_amount: -credits, p_reason: "Refund reversal",
            })
        }
        await markProcessed()
        return json({ ok: true })
      }

      default:
        await markProcessed()
        return json({ ok: true, ignored: event.event })
    }
  } catch (e) {
    await markProcessed(String(e))
    return json({ error: "Processing failed" }, 500)
  }
})
