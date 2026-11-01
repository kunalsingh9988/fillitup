import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { roleHome, useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase/client"
import type { Role } from "@/lib/types"

/* OAuth landing route — Supabase redirects here with ?code=…,
   the client exchanges it for a session (detectSessionInUrl),
   then we send the user to their role's home.
   ?role= is carried from the signup screen — profiles.role is not
   client-writable, so it goes through the set-signup-role function. */
export default function AuthCallbackPage() {
  const { user, loading, updateRole } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const error = params.get("error_description") || params.get("error")
  const role = params.get("role") as Role | null

  useEffect(() => {
    if (loading) return
    if (!user) {
      // no session and nothing in flight → bounced; back to login
      if (!params.get("code")) navigate("/login", { replace: true })
      return
    }
    if (role) {
      // signup path: apply the chosen role server-side (only valid for
      // brand-new accounts), then persist it as the current workspace
      supabase.functions
        .invoke("set-signup-role", { body: { role } })
        .catch(() => {})
        .finally(() => {
          updateRole(role).finally(() =>
            navigate(roleHome(role), { replace: true })
          )
        })
      return
    }
    navigate(roleHome(user.role), { replace: true })
  }, [loading, user, role, navigate, params, updateRole])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      {error ? (
        <>
          <p className="text-lg font-semibold">Sign-in failed</p>
          <p className="max-w-md text-sm text-muted-foreground">{decodeURIComponent(error)}</p>
          <a href="/login" className="text-sm underline underline-offset-4">
            Back to login
          </a>
        </>
      ) : (
        <>
          <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
          <p className="text-sm text-muted-foreground">Signing you in…</p>
        </>
      )}
    </div>
  )
}
