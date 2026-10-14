import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { roleHome, useAuth } from "@/lib/auth"

/* OAuth landing route — Supabase redirects here with ?code=…,
   the client exchanges it for a session (detectSessionInUrl),
   then we send the user to their role's home. */
export default function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const error = params.get("error_description") || params.get("error")

  useEffect(() => {
    if (!loading && user) {
      navigate(roleHome(user.role), { replace: true })
      return
    }
    // no session and nothing in flight → bounced; back to login
    if (!loading && !user && !params.get("code")) {
      navigate("/login", { replace: true })
    }
  }, [loading, user, navigate, params])

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
