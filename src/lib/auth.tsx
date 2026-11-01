import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"

import { assertSupabase, supabase } from "./supabase/client"
import type { Role } from "./types"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthUser>
  signUp: (email: string, password: string, name: string, role: Role) => Promise<AuthUser>
  signInWithOAuth: (provider: "google" | "linkedin", role?: Role) => Promise<void>
  signOut: () => void
  updateRole: (role: Role) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface ProfileRow {
  role: Role
  full_name: string
}

async function fetchProfile(userId: string, email: string): Promise<AuthUser> {
  const { data } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", userId)
    .maybeSingle<ProfileRow>()

  if (!data) {
    // trigger should have created it; self-heal inserts role='seeker' only
    // (profiles.role is not client-writable — signup role goes through
    // handle_new_user metadata or the set-signup-role function).
    await supabase
      .from("profiles")
      .upsert({ id: userId, full_name: email.split("@")[0] })
    return { id: userId, email, name: email.split("@")[0], role: "seeker" }
  }

  // workspace override — the role the user was last operating in
  const { data: settings } = await supabase
    .from("user_settings").select("data").eq("user_id", userId).maybeSingle()
  const workspace = (settings?.data as { workspace?: Role } | null)?.workspace

  return {
    id: userId,
    email,
    name: data.full_name || email.split("@")[0],
    role: workspace ?? data.role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (mounted && session?.user) {
        const u = await fetchProfile(session.user.id, session.user.email ?? "")
        if (mounted) setUser(u)
      }
      if (mounted) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return
        if (session?.user) {
          const u = await fetchProfile(session.user.id, session.user.email ?? "")
          setUser(u)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    assertSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (!data.user) throw new Error("Sign-in failed")
    const u = await fetchProfile(data.user.id, email)
    setUser(u)
    return u
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, name: string, role: Role) => {
      assertSupabase()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role, full_name: name } },
      })
      if (error) throw error
      if (!data.user) throw new Error("Sign-up failed")
      // email-confirm enabled → no session yet; caller routes to check-email state
      if (data.session) {
        const u = await fetchProfile(data.user.id, email)
        setUser(u)
        return u
      }
      return {
        id: data.user.id,
        email,
        name,
        role,
      }
    },
    []
  )

  const signInWithOAuth = useCallback(
    async (provider: "google" | "linkedin", role?: Role) => {
      assertSupabase()
      // the chosen signup role rides on the redirect URL and is applied
      // server-side by the set-signup-role function in the callback
      const redirectTo =
        window.location.origin + "/auth/callback" + (role ? `?role=${role}` : "")
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      })
      if (error) throw error
      // redirect in progress — session arrives via onAuthStateChange
    },
    []
  )

  const signOut = useCallback(() => {
    void supabase.auth.signOut()
    setUser(null)
  }, [])

  // Multi-role accounts: the current workspace (seeker/employer/mentor —
  // all usable from one account) is persisted in user_settings, so the
  // next login lands on the dashboard they last used. profiles.role is
  // the immutable signup role and is never written here.
  const updateRole = useCallback(
    async (role: Role) => {
      setUser(u => (u ? { ...u, role } : u))
      if (!user) return
      const { data: row } = await supabase
        .from("user_settings").select("data").eq("user_id", user.id).maybeSingle()
      await supabase.from("user_settings").upsert(
        { user_id: user.id, data: { ...((row?.data as object) ?? {}), workspace: role } },
        { onConflict: "user_id" }
      )
    },
    [user]
  )

  const requestPasswordReset = useCallback(async (email: string) => {
    assertSupabase()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    })
    if (error) throw error
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
        updateRole,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}

/** Route helper: where each role lands after auth. */
export function roleHome(role: Role) {
  switch (role) {
    case "employer":
      return "/employer"
    case "mentor":
      return "/mentor"
    default:
      return "/app"
  }
}
