import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(url && anonKey)

if (!supabaseConfigured) {
  // eslint-disable-next-line no-console
  console.error(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — " +
      "set them in .env locally and in Vercel → Settings → Environment Variables for deploys"
  )
}

// localhost placeholder keeps the module importable so guest/demo pages still
// render on a misconfigured deploy — every real call is gated by
// supabaseConfigured / assertSupabase below.
export const supabase = createClient(url ?? "http://localhost", anonKey ?? "anon")

export function assertSupabase() {
  if (!supabaseConfigured)
    throw new Error("Supabase isn't configured on this deployment")
}
