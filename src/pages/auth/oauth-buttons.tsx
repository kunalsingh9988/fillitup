import { useNavigate } from "react-router-dom"
import { useState } from "react"

import { useAuth, roleHome } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import type { Role } from "@/lib/types"

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.46 1.8 14.96.72 12 .72 7.44.72 3.56 3.36 1.76 7.24l3.66 2.84C6.32 7.08 8.92 5.04 12 5.04z" />
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.55-.21-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.68 2.85c2.15-1.99 3.75-4.92 3.75-8.67z" />
      <path fill="#FBBC05" d="M5.42 14.29c-.25-.73-.39-1.5-.39-2.29s.14-1.56.38-2.29L1.76 6.87C.99 8.39.5 10.14.5 12s.5 3.61 1.26 5.13l3.66-2.84z" />
      <path fill="#34A853" d="M12 23.28c3.04 0 5.6-1 7.46-2.72l-3.68-2.85c-1.02.68-2.32 1.09-3.78 1.09-3.08 0-5.68-2.04-6.58-4.9l-3.66 2.83c1.8 3.88 5.68 6.55 10.24 6.55z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

export function OAuthButtons({ role, label }: { role?: Role; label?: string }) {
  const { signInWithOAuth } = useAuth()
  const navigate = useNavigate()
  const [pending, setPending] = useState<string | null>(null)

  const go = async (provider: "google" | "linkedin") => {
    setPending(provider)
    try {
      const user = await signInWithOAuth(provider, role)
      navigate(roleHome(user.role))
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[13px] text-muted-foreground">{label ?? "More ways to log in"}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => go("google")}
          disabled={pending !== null}
        >
          <GoogleIcon />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => go("linkedin")}
          disabled={pending !== null}
        >
          <LinkedInIcon />
          LinkedIn
        </Button>
      </div>
    </div>
  )
}
