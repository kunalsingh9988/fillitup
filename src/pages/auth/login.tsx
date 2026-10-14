import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAuth, roleHome } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Seo } from "@/components/seo"
import { OAuthButtons } from "./oauth-buttons"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const submitEmail = async () => {
    if (!validEmail) {
      setError("Enter a valid email")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    setPending(true)
    try {
      const user = await signIn(email, password)
      toast.success("Welcome back")
      navigate(roleHome(user.role))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed")
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <Seo title="Log in" />
      <Card className="w-full max-w-md p-7 sm:p-8">
        <h1 className="text-2xl font-bold text-foreground">Log in or sign up</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Welcome back — sign in to continue.
        </p>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
              autoComplete="email"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitEmail()}
              autoComplete="current-password"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button className="w-full" onClick={submitEmail} disabled={pending}>
            Log in
          </Button>
        </div>

        <div className="mt-7">
          <OAuthButtons />
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="link-underline">Terms</Link> and{" "}
          <Link to="/privacy" className="link-underline">Privacy Policy</Link>
        </p>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </>
  )
}
