import { supabase } from "./supabase/client"

/* Razorpay checkout — creates a server-side order, then opens checkout.js.
   RAZORPAY_KEY_SECRET never touches the browser; only the key id comes back. */

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void }
  }
}

function loadCheckout(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const s = document.createElement("script")
    s.src = "https://checkout.razorpay.com/v1/checkout.js"
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("Failed to load Razorpay checkout"))
    document.body.appendChild(s)
  })
}

export interface CheckoutOpts {
  amountInr: number
  kind: "credits" | "mentor"
  mentorPlanId?: string
  description: string
  prefill?: { name?: string; email?: string }
}

export async function openCheckout(opts: CheckoutOpts): Promise<void> {
  const { data, error } = await supabase.functions.invoke("razorpay-order", {
    body: {
      kind: opts.kind,
      mentorPlanId: opts.mentorPlanId,
      amountInr: opts.amountInr,
    },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)

  await loadCheckout()
  await new Promise<void>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "Fill-it-up",
      description: opts.description,
      order_id: data.orderId,
      prefill: opts.prefill,
      theme: { color: "#0d0d0d" },
      handler: () => resolve(),          // webhook confirms server-side
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
    })
    rzp.open()
  })
}
