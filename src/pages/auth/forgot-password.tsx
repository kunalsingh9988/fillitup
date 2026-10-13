import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, MailCheck } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Seo } from "@/components/seo"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)
  const { requestPasswordReset } = useAuth()

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email")
      return
    }
    setError(null)
    setPending(true)
    await requestPasswordReset(email)
    setPending(false)
    setSent(true)
    toast.success("Reset link sent", { description: "Check your inbox (demo)." })
  }

  return (
    <>
      <Seo title="Reset password" />
      <Card className="w-full max-w-md p-7 sm:p-8">
        <Link to="/login" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to login
        </Link>
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
              <MailCheck className="size-6" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Check your inbox</h1>
            <p className="max-w-xs text-sm text-muted-foreground">
              We sent a password reset link to <span className="font-medium text-foreground">{email}</span>
            </p>
            <Button variant="outline" className="mt-3" onClick={() => { setSent(false); setEmail("") }}>
              Use a different email
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter your account email and we'll send a reset link.
            </p>
            <div className="mt-6 grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                aria-invalid={!!error}
                autoComplete="email"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <Button className="mt-5 w-full" onClick={submit} disabled={pending}>
              Send reset link
            </Button>
          </>
        )}
      </Card>
    </>
  )
}
