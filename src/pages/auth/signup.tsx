import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { BriefcaseBusiness, GraduationCap, UserRoundSearch } from "lucide-react"
import { toast } from "sonner"

import { useAuth, roleHome } from "@/lib/auth"
import type { Role } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Seo } from "@/components/seo"
import { OAuthButtons } from "./oauth-buttons"

const roles: { value: Role; icon: typeof UserRoundSearch; title: string; body: string }[] = [
  {
    value: "seeker",
    icon: UserRoundSearch,
    title: "Job Seeker",
    body: "Get AI-matched to roles, prep for interviews, track applications.",
  },
  {
    value: "employer",
    icon: BriefcaseBusiness,
    title: "Employer",
    body: "Post roles, screen candidates with explainable AI, hire faster.",
  },
  {
    value: "mentor",
    icon: GraduationCap,
    title: "Mentor",
    body: "Offer resume reviews, mock interviews, and coaching sessions.",
  },
]

const validRole = (v: string | null): Role | null =>
  v === "seeker" || v === "employer" || v === "mentor" ? v : null

export default function SignupPage() {
  const [params] = useSearchParams()
  const [role, setRole] = useState<Role | null>(validRole(params.get("role")))
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()

  const submit = async () => {
    const next: Record<string, string> = {}
    if (!role) next.role = "Choose how you'll use Fill-it-up"
    if (name.trim().length < 2) next.name = "Enter your name"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email"
    if (password.length < 8) next.password = "At least 8 characters"
    if (!agree) next.agree = "You must agree to continue"
    setErrors(next)
    if (Object.keys(next).length || !role) return

    setPending(true)
    const user = await signUp(email, password, name.trim(), role)
    setPending(false)
    toast.success("Account created", { description: "Welcome to Fill-it-up." })
    navigate(roleHome(user.role))
  }

  return (
    <>
      <Seo title="Sign up" />
      <Card className="w-full max-w-md p-7 sm:p-8">
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Free for job seekers. No credit card required.
        </p>

        <div className="mt-6 grid gap-3" role="radiogroup" aria-label="I am a">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={role === r.value}
              onClick={() => setRole(r.value)}
              className={cn(
                "flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                role === r.value
                  ? "border-primary bg-primary/8 shadow-[0_0_20px_-6px_var(--glow)]"
                  : "border-border bg-card hover:border-muted-foreground/40"
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                  role === r.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}
              >
                <r.icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{r.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{r.body}</span>
              </span>
            </button>
          ))}
          {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
        </div>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
              autoComplete="name"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              autoComplete="email"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="8+ characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              aria-invalid={!!errors.password}
              autoComplete="new-password"
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-muted-foreground">
            <Checkbox
              checked={agree}
              onCheckedChange={(v) => setAgree(v === true)}
              aria-invalid={!!errors.agree}
              className="mt-0.5"
            />
            <span>
              I agree to the{" "}
              <Link to="/terms" className="link-underline">Terms</Link> and{" "}
              <Link to="/privacy" className="link-underline">Privacy Policy</Link>
            </span>
          </label>
          {errors.agree && <p className="-mt-2 text-xs text-destructive">{errors.agree}</p>}

          <Button className="w-full" onClick={submit} disabled={pending}>
            Create account
          </Button>
        </div>

        <div className="mt-7">
          <OAuthButtons role={role ?? "seeker"} label="Or sign up with" />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </>
  )
}
