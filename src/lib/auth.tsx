import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"

import type { Role } from "./types"

/**
 * Mock auth provider — frontend-only implementation backed by
 * localStorage. The interface mirrors what Supabase auth will
 * provide (user object, role, sign in/out/up) so the swap is
 * a drop-in replacement in Phase: backend wiring.
 */

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, _password: string) => Promise<AuthUser>
  signUp: (email: string, _password: string, name: string, role: Role) => Promise<AuthUser>
  signInWithOAuth: (provider: "google" | "linkedin", role?: Role) => Promise<AuthUser>
  signOut: () => void
  requestPasswordReset: (email: string) => Promise<void>
  requestOtp: (phone: string) => Promise<void>
  verifyOtp: (phone: string, code: string) => Promise<AuthUser>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = "fillitup-user"

function persist(user: AuthUser | null) {
  if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  else window.localStorage.removeItem(STORAGE_KEY)
}

function makeUser(email: string, role: Role, name?: string): AuthUser {
  return {
    id: `demo-${Math.random().toString(36).slice(2, 10)}`,
    email,
    name: name || email.split("@")[0],
    role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {
      /* corrupted storage — start logged out */
    }
    setLoading(false)
  }, [])

  const login = useCallback((u: AuthUser) => {
    setUser(u)
    persist(u)
  }, [])

  const signIn = useCallback(
    async (email: string) => {
      const u = makeUser(email, "seeker")
      login(u)
      return u
    },
    [login]
  )

  const signUp = useCallback(
    async (email: string, _password: string, name: string, role: Role) => {
      const u = makeUser(email, role, name)
      login(u)
      return u
    },
    [login]
  )

  const signInWithOAuth = useCallback(
    async (provider: "google" | "linkedin", role: Role = "seeker") => {
      const u = makeUser(`${provider}.user@fillitup.demo`, role, `${provider === "google" ? "Google" : "LinkedIn"} User`)
      login(u)
      return u
    },
    [login]
  )

  const signOut = useCallback(() => {
    setUser(null)
    persist(null)
  }, [])

  const requestPasswordReset = useCallback(async (_email: string) => {
    // Supabase: supabase.auth.resetPasswordForEmail(email)
  }, [])

  const requestOtp = useCallback(async (_phone: string) => {
    // Supabase: supabase.auth.signInWithOtp({ phone })
  }, [])

  const verifyOtp = useCallback(
    async (phone: string, _code: string) => {
      const u = makeUser(`${phone.replace(/\D/g, "")}@phone.fillitup.demo`, "seeker")
      login(u)
      return u
    },
    [login]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
        requestPasswordReset,
        requestOtp,
        verifyOtp,
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
