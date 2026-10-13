import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { toast } from "sonner"

import { useAuth, roleHome } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Seo } from "@/components/seo"
import { OAuthButtons } from "./oauth-buttons"

type Method = "phone" | "email"

export default function LoginPage() {
  const [method, setMethod] = useState<Method>("phone")
  const [step, setStep] = useState<"enter" | "otp">("enter")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [error, setError] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(30)
  const [pending, setPending] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const { signIn, requestOtp, verifyOtp } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [step, resendIn])

  const validPhone = /^\+?\d[\d\s-]{8,14}$/.test(phone.trim())
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const sendOtp = async () => {
    if (!validPhone) {
      setError("Enter a valid phone number")
      return
    }
    setError(null)
    setPending(true)
    await requestOtp(phone)
    setPending(false)
    setStep("otp")
    setResendIn(30)
    setTimeout(() => otpRefs.current[0]?.focus(), 50)
    toast.info("Demo mode", { description: "Any 6-digit code will sign you in." })
  }

  const submitOtp = async () => {
    const code = otp.join("")
    if (code.length !== 6) {
      setError("Enter the 6-digit code")
      return
    }
    setPending(true)
    const user = await verifyOtp(phone, code)
    setPending(false)
    toast.success("Welcome back")
    navigate(roleHome(user.role))
  }

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
    const user = await signIn(email, password)
    setPending(false)
    toast.success("Welcome back")
    navigate(roleHome(user.role))
  }

  const handleOtpChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1)
    setOtp((o) => o.map((d, j) => (j === i ? digit : d)))
    if (digit && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
    if (e.key === "Enter" && otp.join("").length === 6) submitOtp()
  }

  return (
    <>
      <Seo title="Log in" />
      <Card className="w-full max-w-md p-7 sm:p-8">
        {step === "otp" ? (
          <>
            <button
              onClick={() => { setStep("enter"); setOtp(Array(6).fill("")); setError(null) }}
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <h1 className="text-2xl font-bold text-foreground">Confirm your number</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter the code we sent to <span className="font-medium text-foreground">{phone || "+91 1234567890"}</span>
            </p>
            <div className="mt-6 flex justify-between gap-2" role="group" aria-label="One-time passcode">
              {otp.map((d, i) => (
                <Input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el }}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${i + 1}`}
                  className="h-13 w-12 text-center font-mono text-lg"
                />
              ))}
            </div>
            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
            <Button className="mt-6 w-full" onClick={submitOtp} disabled={pending}>
              Continue
            </Button>
            <p className="mt-4 text-center text-[13px] text-muted-foreground">
              {resendIn > 0 ? (
                <>Resend code in <span className="font-mono">{resendIn}s</span></>
              ) : (
                <button onClick={sendOtp} className="font-medium text-primary hover:underline">
                  Resend code
                </button>
              )}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground">Log in or sign up</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {method === "phone" ? "We'll send you a one-time code." : "Welcome back — sign in to continue."}
            </p>

            {method === "phone" ? (
              <div className="mt-6 grid gap-2">
                <Label htmlFor="phone">Phone number</Label>
                <div className="flex gap-2">
                  <div className="flex h-10 items-center gap-1.5 rounded-lg border border-input bg-card px-3 text-sm text-foreground">
                    <span aria-hidden="true">🇮🇳</span>
                    <span className="font-mono">+91</span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </div>
                  <Input
                    id="phone"
                    inputMode="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                    aria-invalid={!!error}
                    className="flex-1"
                  />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <Button className="mt-2 w-full" onClick={sendOtp} disabled={pending}>
                  Continue
                </Button>
                <button
                  onClick={() => { setMethod("email"); setError(null) }}
                  className="mt-1 text-center text-[13px] font-medium text-primary hover:underline"
                >
                  Use email instead
                </button>
              </div>
            ) : (
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
                <button
                  onClick={() => { setMethod("phone"); setError(null) }}
                  className="text-center text-[13px] font-medium text-primary hover:underline"
                >
                  Use phone instead
                </button>
              </div>
            )}

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
          </>
        )}
      </Card>
    </>
  )
}
