# Fill-it-up — Claude Audit Context Bundle

Everything needed for a full audit of the app. Full source (public): https://github.com/kunalsingh9988/fillitup

## Live URLs

| Area | URL |
|---|---|
| Landing | https://fillitup.vercel.app/ |
| Pricing | https://fillitup.vercel.app/pricing |
| How it works | https://fillitup.vercel.app/how-it-works |
| About | https://fillitup.vercel.app/about |
| Contact | https://fillitup.vercel.app/contact |
| Privacy | https://fillitup.vercel.app/privacy |
| Terms | https://fillitup.vercel.app/terms |
| Login | https://fillitup.vercel.app/login |
| Signup | https://fillitup.vercel.app/signup |
| Seeker app | https://fillitup.vercel.app/app |
| Employer app | https://fillitup.vercel.app/employer |
| Mentor app | https://fillitup.vercel.app/mentor |
| Keepalive API | https://fillitup.vercel.app/api/keepalive |
| Supabase project | https://qebcicrykxlrfcqtqqbk.supabase.co |

Dashboards render for guests with seed data (stores fall back to localStorage when signed out), so every route above is directly viewable.

## Suggested audit prompt

> Audit this codebase (Fill-it-up — AI job platform, React 19 + Vite + Supabase + Razorpay + Gemini edge functions, deployed at fillitup.vercel.app). Review: (1) RLS policies & privilege escalation paths in supabase/migrations, (2) edge-function auth/signature verification in supabase/functions, (3) client-side auth & role handling in src/lib/auth.tsx, (4) store write-through patterns for data leaks between users, (5) payment flow integrity (razorpay-order → webhook → activation), (6) general React/TS code quality, dead code, and UX gaps. Rank findings by severity; cite file + line.

---


## FILE: README.md

```markdown
# Fill-it-up

AI-powered career & hiring platform — connects **job seekers**, **employers**, and **mentors** in one graph.

**Live:** https://fillitup.vercel.app · **Repo:** https://github.com/kunalsingh9988/fillitup

## What it does

| Role | Features |
|---|---|
| **Job Seeker** | Job tracker, AI match scores, resume analysis, interview prep, salary oracle, career path planner, mentor subscriptions, community, referrals, billing |
| **Employer** | Company profile, job posting, candidate pipeline (kanban), team + invites, analytics, messaging |
| **Mentor** | Instant onboarding, plans & pricing, availability, sessions, mentees, reviews, resources, earnings (15% platform commission) |

## Stack

- **Frontend** — React 19, TypeScript, Vite, Tailwind CSS, Radix UI, TanStack Query, React Router
- **Backend** — Supabase (Postgres + RLS + Auth + Storage + Edge Functions)
- **AI** — Google Gemini via a consolidated `ai` edge function
- **Payments** — Razorpay (INR) — orders, checkout, webhook-verified activation, payout ledger
- **Email** — Resend via `send-email` edge function
- **Hosting** — Vercel (auto-deploys on push to `main`)

## Quick start

```bash
git clone https://github.com/kunalsingh9988/fillitup.git
cd fillitup
npm install
cp .env.example .env        # fill in your values
npm run dev                 # http://localhost:5173
```

## Environment variables

| Variable | Where used |
|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Frontend (baked at build) — also required on Vercel |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Scripts & edge functions |
| `SUPABASE_DB_PASSWORD` | `supabase link` / migrations |
| `GEMINI_API_KEY` | `ai` edge function |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | Payment functions |
| `RESEND_API_KEY` / `EMAIL_FROM` | `send-email` function |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (Supabase provider config) |

Full list in `.env.example`. Function secrets are set via `supabase secrets set`, **never** committed.

## Backend setup

```bash
npm run db:link          # supabase link --project-ref <ref>
npm run migrate          # apply supabase/migrations/*.sql via the pooler
npm run deploy           # deploy all 4 edge functions
```

Edge functions (`supabase/functions/`):

- **`ai`** — authenticated Gemini gateway: `match-score`, `resume-analyze`, `interview-prep`, `salary-oracle`, `career-path`, `compatibility`, `skill-quiz` (model fallback chain + result caching)
- **`razorpay-order`** — server-side order creation
- **`razorpay-webhook`** — HMAC signature verification → activates mentor subscriptions / grants seeker credits / writes payout ledger + invoices
- **`send-email`** — internal-secret-gated Resend templates (welcome, application status, session reminder, payout)

Razorpay webhook → dashboard → URL `https://<project-ref>.supabase.co/functions/v1/razorpay-webhook`, event `payment.captured`, secret = `RAZORPAY_WEBHOOK_SECRET`.

## Project structure

```
src/
  pages/           auth/, seeker/, employer/, mentor/, seo/, marketing
  components/      ui/ (radix primitives), seeker/, employer/, mentor/, shell/
  lib/             auth.tsx, ai.ts, razorpay.ts
    supabase/      client.ts, data.ts (row→UI mappers)
  stores           seeker-store, employer-store, mentor-store — hydrate from
                   Supabase + write-through on every mutation (guests get seeds)
supabase/
  migrations/      0001–0007: schema, RLS policies, helpers, company bootstrap
  functions/       ai/, razorpay-order/, razorpay-webhook/, send-email/
  config.toml      auth URLs, redirect allowlist, Google provider (env-referenced)
scripts/           migrate.mjs, deploy-functions.mjs, db-push.mjs
```

## Verification

```bash
npm run lint     # oxlint — 0 errors
npm run build    # tsc -b && vite build
```

## Status

Working live: signup → role dashboards → Supabase persistence (RLS-verified) → AI tools → order creation → email delivery. In progress: wiring AI/Razorpay clients into every page, route guards, employer paid plans.

```

## FILE: package.json

```json
{
  "name": "fill-it-up",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@fontsource-variable/inter": "^5.3.0",
    "@fontsource-variable/jetbrains-mono": "^5.3.0",
    "@hookform/resolvers": "^5.9.1",
    "@radix-ui/react-accordion": "^1.3.0",
    "@radix-ui/react-avatar": "^1.3.0",
    "@radix-ui/react-checkbox": "^1.4.0",
    "@radix-ui/react-dialog": "^1.3.0",
    "@radix-ui/react-dropdown-menu": "^2.2.0",
    "@radix-ui/react-label": "^2.1.17",
    "@radix-ui/react-navigation-menu": "^1.4.0",
    "@radix-ui/react-popover": "^1.3.0",
    "@radix-ui/react-progress": "^1.2.0",
    "@radix-ui/react-radio-group": "^1.5.0",
    "@radix-ui/react-scroll-area": "^1.4.0",
    "@radix-ui/react-select": "^2.4.0",
    "@radix-ui/react-separator": "^1.2.0",
    "@radix-ui/react-slider": "^1.6.0",
    "@radix-ui/react-slot": "^1.5.0",
    "@radix-ui/react-switch": "^1.4.0",
    "@radix-ui/react-tabs": "^1.2.0",
    "@radix-ui/react-toggle": "^1.2.0",
    "@radix-ui/react-toggle-group": "^1.2.0",
    "@radix-ui/react-tooltip": "^1.4.0",
    "@supabase/supabase-js": "^2.117.3",
    "@tailwindcss/vite": "^4.3.3",
    "@tanstack/react-query": "^5.104.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.55.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-hook-form": "^7.90.0",
    "react-router-dom": "^7.18.4",
    "recharts": "^3.10.1",
    "sonner": "^2.0.8",
    "tailwind-merge": "^3.7.0",
    "tailwindcss": "^4.3.3",
    "tw-animate-css": "^1.4.0",
    "zod": "^4.6.7"
  },
  "devDependencies": {
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.7",
    "@vitejs/plugin-react": "^6.1.1",
    "oxlint": "^1.81.0",
    "postgres": "^3.4.9",
    "typescript": "~6.0.2",
    "vite": "^8.3.0"
  }
}

```

## FILE: vercel.json

```json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }],
  "crons": [{ "path": "/api/keepalive", "schedule": "0 6 * * *" }]
}

```

## FILE: .env.example

```
# ─── Fill-it-up environment ─────────────────────────────────
# Copy to .env (gitignored) — never commit real values.

# Supabase (Settings → API)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # backend/migrations only — never VITE_*

# Browser (Vite embeds these — anon key only)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# AI — aistudio.google.com
GEMINI_API_KEY=

# Payments — dashboard.razorpay.com (test keys start rzp_test_)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=            # set when you create the webhook

# Email — resend.com
RESEND_API_KEY=
EMAIL_FROM="Fill-it-up <onboarding@resend.dev>"

# Google OAuth — console.cloud.google.com (not used in code; Supabase holds them)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Migrations runner
SUPABASE_DB_PASSWORD=               # db password from project creation

```

## FILE: src/App.tsx

```typescript
import { Route, Routes } from "react-router-dom"

import { AuthLayout } from "@/components/layout/auth-layout"
import { PublicLayout } from "@/components/layout/public-layout"
import LandingPage from "@/pages/landing"
import PricingPage from "@/pages/pricing"
import HowItWorksPage from "@/pages/how-it-works"
import AboutPage from "@/pages/about"
import ContactPage from "@/pages/contact"
import PrivacyPage from "@/pages/privacy"
import TermsPage from "@/pages/terms"
import LoginPage from "@/pages/auth/login"
import SignupPage from "@/pages/auth/signup"
import ForgotPasswordPage from "@/pages/auth/forgot-password"
import AuthCallbackPage from "@/pages/auth/callback"
import EmployerLayout from "@/components/employer/employer-layout"
import EmployerDashboard from "@/pages/employer/dashboard"
import EmployerCompanyProfile from "@/pages/employer/company-profile"
import EmployerJobs from "@/pages/employer/jobs"
import PostJobWizard from "@/pages/employer/post-job"
import EmployerCandidates from "@/pages/employer/candidates"
import CandidateDetail from "@/pages/employer/candidate-detail"
import EmployerAnalytics from "@/pages/employer/analytics"
import EmployerTeam from "@/pages/employer/team"
import EmployerMessages from "@/pages/employer/messages"
import EmployerSettings from "@/pages/employer/settings"
import SeekerLayout from "@/components/seeker/seeker-layout"
import SeekerDashboard from "@/pages/seeker/dashboard"
import SeekerJobs from "@/pages/seeker/jobs"
import SeekerApply from "@/pages/seeker/apply"
import SeekerProfile from "@/pages/seeker/profile"
import SeekerAiHub from "@/pages/seeker/ai-hub"
import SeekerInterviewPrep from "@/pages/seeker/interview-prep"
import SeekerSalaryOracle from "@/pages/seeker/salary-oracle"
import SeekerCompatibility from "@/pages/seeker/compatibility"
import SeekerCareerPath from "@/pages/seeker/career-path"
import SeekerSkills from "@/pages/seeker/skills"
import SeekerMentorship from "@/pages/seeker/mentorship"
import SeekerMentorDetail from "@/pages/seeker/mentor-detail"
import SeekerCommunity from "@/pages/seeker/community"
import SeekerMessages from "@/pages/seeker/messages"
import SeekerResumes from "@/pages/seeker/resumes"
import SeekerBilling from "@/pages/seeker/billing"
import SeekerRefer from "@/pages/seeker/refer"
import SeekerSettings from "@/pages/seeker/settings"
import MentorLayout from "@/components/mentor/mentor-layout"
import MentorDashboard from "@/pages/mentor/dashboard"
import MentorPlans from "@/pages/mentor/plans"
import MentorMentees from "@/pages/mentor/mentees"
import MentorReviews from "@/pages/mentor/reviews"
import MentorSessions from "@/pages/mentor/sessions"
import MentorAvailability from "@/pages/mentor/availability"
import MentorMessages from "@/pages/mentor/messages"
import MentorResources from "@/pages/mentor/resources"
import MentorInsights from "@/pages/mentor/insights"
import MentorEarnings from "@/pages/mentor/earnings"
import MentorProfile from "@/pages/mentor/profile"
import MentorSettings from "@/pages/mentor/settings"
import NotFoundPage from "@/pages/not-found"

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route path="auth/callback" element={<AuthCallbackPage />} />

      {/* employer app */}
      <Route path="employer" element={<EmployerLayout />}>
        <Route index element={<EmployerDashboard />} />
        <Route path="company" element={<EmployerCompanyProfile />} />
        <Route path="jobs" element={<EmployerJobs />} />
        <Route path="jobs/new" element={<PostJobWizard />} />
        <Route path="candidates" element={<EmployerCandidates />} />
        <Route path="candidates/:id" element={<CandidateDetail />} />
        <Route path="analytics" element={<EmployerAnalytics />} />
        <Route path="team" element={<EmployerTeam />} />
        <Route path="messages" element={<EmployerMessages />} />
        <Route path="settings" element={<EmployerSettings />} />
      </Route>

      {/* job seeker app */}
      <Route path="app" element={<SeekerLayout />}>
        <Route index element={<SeekerDashboard />} />
        <Route path="ai" element={<SeekerAiHub />} />
        <Route path="ai/interview-prep" element={<SeekerInterviewPrep />} />
        <Route path="ai/salary-oracle" element={<SeekerSalaryOracle />} />
        <Route path="ai/compatibility" element={<SeekerCompatibility />} />
        <Route path="ai/career-path" element={<SeekerCareerPath />} />
        <Route path="skills" element={<SeekerSkills />} />
        <Route path="jobs" element={<SeekerJobs />} />
        <Route path="apply/:id" element={<SeekerApply />} />
        <Route path="profile" element={<SeekerProfile />} />
        <Route path="mentorship" element={<SeekerMentorship />} />
        <Route path="mentorship/:id" element={<SeekerMentorDetail />} />
        <Route path="community" element={<SeekerCommunity />} />
        <Route path="messages" element={<SeekerMessages />} />
        <Route path="resumes" element={<SeekerResumes />} />
        <Route path="billing" element={<SeekerBilling />} />
        <Route path="refer" element={<SeekerRefer />} />
        <Route path="settings" element={<SeekerSettings />} />
      </Route>

      {/* mentor app */}
      <Route path="mentor" element={<MentorLayout />}>
        <Route index element={<MentorDashboard />} />
        <Route path="plans" element={<MentorPlans />} />
        <Route path="mentees" element={<MentorMentees />} />
        <Route path="reviews" element={<MentorReviews />} />
        <Route path="sessions" element={<MentorSessions />} />
        <Route path="availability" element={<MentorAvailability />} />
        <Route path="messages" element={<MentorMessages />} />
        <Route path="resources" element={<MentorResources />} />
        <Route path="insights" element={<MentorInsights />} />
        <Route path="earnings" element={<MentorEarnings />} />
        <Route path="profile" element={<MentorProfile />} />
        <Route path="settings" element={<MentorSettings />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

```

## FILE: src/main.tsx

```typescript
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)

```

## FILE: src/lib/auth.tsx

```typescript
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
  requestPasswordReset: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const PENDING_ROLE_KEY = "fillitup-oauth-role"

interface ProfileRow {
  role: Role
  full_name: string
  created_at: string
}

async function fetchProfile(userId: string, email: string): Promise<AuthUser> {
  const { data } = await supabase
    .from("profiles")
    .select("role, full_name, created_at")
    .eq("id", userId)
    .maybeSingle<ProfileRow>()

  if (!data) {
    // first sign-in edge case — trigger should have created it; self-heal
    const pendingRole = (window.localStorage.getItem(PENDING_ROLE_KEY) as Role) || "seeker"
    await supabase
      .from("profiles")
      .upsert({ id: userId, role: pendingRole, full_name: email.split("@")[0] })
    window.localStorage.removeItem(PENDING_ROLE_KEY)
    return { id: userId, email, name: email.split("@")[0], role: pendingRole }
  }

  // OAuth signup: apply the role chosen on the signup screen before redirect.
  // Only for brand-new profiles — an existing employer/mentor signing in
  // again must never be downgraded by a stale pending role.
  const pendingRole = window.localStorage.getItem(PENDING_ROLE_KEY) as Role | null
  const isNewProfile = Date.now() - new Date(data.created_at).getTime() < 15 * 60 * 1000
  if (pendingRole && isNewProfile && pendingRole !== data.role) {
    await supabase.from("profiles").update({ role: pendingRole }).eq("id", userId)
    data.role = pendingRole
  }
  window.localStorage.removeItem(PENDING_ROLE_KEY)

  return {
    id: userId,
    email,
    name: data.full_name || email.split("@")[0],
    role: data.role,
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
      // role is set only when the user picked one on the signup screen —
      // plain logins must not carry a pending role (it would downgrade
      // existing employer/mentor accounts to seeker).
      if (role) window.localStorage.setItem(PENDING_ROLE_KEY, role)
      else window.localStorage.removeItem(PENDING_ROLE_KEY)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + "/auth/callback" },
      })
      if (error) {
        window.localStorage.removeItem(PENDING_ROLE_KEY)
        throw error
      }
      // redirect in progress — session arrives via onAuthStateChange
    },
    []
  )

  const signOut = useCallback(() => {
    void supabase.auth.signOut()
    setUser(null)
  }, [])

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

```

## FILE: src/lib/types.ts

```typescript
export type Role = "seeker" | "employer" | "mentor"

export interface Job {
  id: string
  title: string
  company: string
  companyInitials: string
  location: string
  type: string
  salary: string
  postedAgo: string
  tags: string[]
  hiringFor?: string
  matchScore?: number
}

export interface Testimonial {
  quote: string
  name: string
  transition: string
  initials: string
}

export interface PricingTier {
  name: string
  monthly: number
  description: string
  cta: string
  popular?: boolean
  features: string[]
}

export interface FAQ {
  q: string
  a: string
}

```

## FILE: src/lib/ai.ts

```typescript
import { supabase } from "./supabase/client"

/* Typed client for the `ai` edge function.
   Every kind is validated server-side; these wrappers just shape the call. */

async function call<T>(kind: string, input: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke("ai", {
    body: { kind, input },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)
  return data as T
}

export interface MatchScore {
  score: number
  aiSummary: string
  skillsMatched: [number, number]
  fitPoints: string[]
  gaps: string[]
  salaryContext: string
  resumeTips: string[]
  prepPoints: string[]
  growth: string
  teamSize: string
  reportsTo: string
}

export interface ResumeAnalysis {
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
  enhancedBullets: string[]
  skillsFound: string[]
  missingSkills: string[]
}

export interface SalaryEstimate {
  p25: number
  median: number
  p75: number
  estimate: number
  factors: { label: string; impact: "+" | "-"; detail: string }[]
  benchmarks: { company: string; range: string }[]
}

export interface CareerPath {
  currentRole: string
  nextRole: string
  nextTimeline: string
  milestones: { role: string; yearsFromNow: number; salaryBand: string; requirements: string[] }[]
  learningPlan: { skill: string; why: string; resource: string }[]
}

export interface Compatibility {
  overall: number
  culture: number
  workStyle: number
  values: number
  growth: number
  teamFit: number
  explanations: Record<string, string>
}

export interface QuizQuestion {
  q: string
  options: string[]
  answer: number
}

export const ai = {
  matchScore: (jobId: string) => call<MatchScore>("match-score", { jobId }),
  analyzeResume: (resumeText: string, targetRole?: string) =>
    call<ResumeAnalysis>("resume-analyze", { resumeText, targetRole }),
  interviewQuestions: (category: string, topic: string) =>
    call<{ questions: { q: string; hint: string }[] }>("interview-prep", {
      mode: "questions", category, topic,
    }),
  scoreAnswer: (question: string, answer: string) =>
    call<{ score: number; feedback: string[]; strongPoints: string[]; improvements: string[] }>(
      "interview-prep", { mode: "score", question, answer }
    ),
  salaryOracle: (role: string, location: string, years: number, skills: string[]) =>
    call<SalaryEstimate>("salary-oracle", { role, location, years, skills }),
  careerPath: () => call<CareerPath>("career-path", {}),
  compatibility: (company: string) => call<Compatibility>("compatibility", { company }),
  skillQuiz: (skill: string) => call<{ questions: QuizQuestion[] }>("skill-quiz", { skill }),
}

```

## FILE: src/lib/razorpay.ts

```typescript
import { supabase } from "./supabase/client"

/* Razorpay checkout — creates a server-side order, then opens checkout.js.
   RAZORPAY_KEY_SECRET never touches the browser; only the key id comes back. */

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void }
  }
}

function loadCheckout(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const s = document.createElement("script")
    s.src = "https://checkout.razorpay.com/v1/checkout.js"
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("Failed to load Razorpay checkout"))
    document.body.appendChild(s)
  })
}

export interface CheckoutOpts {
  amountInr: number
  kind: "credits" | "mentor"
  mentorPlanId?: string
  description: string
  prefill?: { name?: string; email?: string }
}

export async function openCheckout(opts: CheckoutOpts): Promise<void> {
  const { data, error } = await supabase.functions.invoke("razorpay-order", {
    body: {
      kind: opts.kind,
      mentorPlanId: opts.mentorPlanId,
      amountInr: opts.amountInr,
    },
  })
  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)

  await loadCheckout()
  await new Promise<void>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "Fill-it-up",
      description: opts.description,
      order_id: data.orderId,
      prefill: opts.prefill,
      theme: { color: "#0d0d0d" },
      handler: () => resolve(),          // webhook confirms server-side
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
    })
    rzp.open()
  })
}

```

## FILE: src/lib/supabase/client.ts

```typescript
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

```

## FILE: src/lib/supabase/data.ts

```typescript
// Row → UI-model mappers + loaders for all three role dashboards.
// Each loadXState() returns the same shape the old localStorage seeds produced,
// so pages don't change when the stores hydrate from Supabase.

import { supabase } from "./client"
import type {
  SeekerProfile,
  SeekerJob,
  TrackedApplication,
  ResumeDoc,
  PrepSession,
  SkillAssessment,
  MentorListing,
  CommunityPost,
  CreditTransaction,
  Invoice,
  SeekerSettings,
  ChecklistStep,
  ApplicationStage,
  Experience,
  Education,
  Project,
  Certification,
  AchievementBadge,
} from "../seeker-types"
import type { SeekerState } from "../seeker-store"
import type {
  EmployerJob,
  Candidate,
  TeamMember,
  CompanyProfile,
  EmployerSettings,
  AppNotification,
  Conversation,
  ChatMessage,
  CandidateStatus,
} from "../employer-types"
import type { EmployerState } from "../employer-store"
import type {
  MentorProfile,
  MentorPlan,
  Mentee,
  MentorSession,
  MentorReview,
  MentorResource,
  MentorPayout,
  AvailabilityState,
  MentorSettings,
  MentorChecklistStep,
} from "../mentor-types"
import type { MentorState } from "../mentor-store"
import * as seekerSeed from "../seeker-data"

/* ---------- shared helpers ---------- */

export function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`
  if (s < 86400 * 30) return `${Math.floor(s / 86400 / 7)}w ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function initials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "??"
}

const fmtSalary = (min: number | null, max: number | null, cur: string) => {
  if (!min && !max) return "Competitive"
  const f = (n: number) => (cur === "INR" ? `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L` : `$${Math.round(n / 1000)}K`)
  if (min && max) return `${f(min)} – ${f(max)}`
  return `${f((min ?? max)!)}+`
}

/* ---------- seeker ---------- */

// denormalized AI copy lives in match_scores.breakdown; fall back to sensible defaults
function jobRowToSeekerJob(r: any, match: any): SeekerJob {
  const company = r.companies?.name ?? "Company"
  const b = match?.breakdown ?? {}
  const skills: string[] = r.skills ?? []
  return {
    id: r.id,
    company,
    logoInitials: initials(company),
    title: r.title,
    location: r.location,
    type: r.type,
    salary: fmtSalary(r.comp_min, r.comp_max, r.currency),
    posted: timeAgo(r.created_at),
    matchScore: match?.score ?? 0,
    tags: skills.slice(0, 4),
    about: r.description ?? "",
    responsibilities: r.responsibilities ?? [],
    requirements: r.requirements ?? [],
    benefits: r.perks ?? [],
    applyType: "standard",
    aiSummary: b.aiSummary ?? "",
    skillsMatched: b.skillsMatched ?? [0, skills.length],
    fitPoints: b.fitPoints ?? [],
    gaps: b.gaps ?? [],
    salaryContext: b.salaryContext ?? "",
    resumeTips: b.resumeTips ?? [],
    prepPoints: b.prepPoints ?? [],
    growth: b.growth ?? "",
    teamSize: b.teamSize ?? "",
    reportsTo: b.reportsTo ?? "",
  }
}

export async function loadSeekerState(userId: string, email: string): Promise<SeekerState> {
  const [
    profileRes, seekerRes, expRes, eduRes, projRes, certRes,
    resumesRes, appsRes, jobsRes, matchRes,
    prepRes, assessRes, subsRes,
    postsRes, likesRes, commentsRes,
    txnsRes, invoicesRes, settingsRes, notifsRes, convRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("seeker_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("seeker_experience").select("*").eq("seeker_id", userId).order("sort_order"),
    supabase.from("seeker_education").select("*").eq("seeker_id", userId).order("sort_order"),
    supabase.from("seeker_projects").select("*").eq("seeker_id", userId).order("sort_order"),
    supabase.from("seeker_certifications").select("*").eq("seeker_id", userId).order("sort_order"),
    supabase.from("resumes").select("*").eq("seeker_id", userId).order("created_at", { ascending: false }),
    supabase.from("applications").select("*, jobs(*, companies(name))").eq("seeker_id", userId),
    supabase.from("jobs").select("*, companies(name)").eq("status", "active").order("created_at", { ascending: false }).limit(50),
    supabase.from("match_scores").select("*").eq("seeker_id", userId),
    supabase.from("interview_sessions").select("*").eq("seeker_id", userId).order("taken_at", { ascending: false }),
    supabase.from("skill_assessments").select("*").eq("seeker_id", userId),
    supabase.from("mentor_subscriptions").select("plan_id").eq("mentee_id", userId).eq("status", "active"),
    supabase.from("community_posts").select("*, profiles!community_posts_author_id_fkey(full_name, role)").order("created_at", { ascending: false }).limit(50),
    supabase.from("community_likes").select("post_id").eq("user_id", userId),
    supabase.from("community_comments").select("post_id"),
    supabase.from("credit_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("user_settings").select("data").eq("user_id", userId).maybeSingle(),
    supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    supabase.from("conversation_participants").select("conversation_id, last_read_at").eq("user_id", userId),
  ])

  const sp = seekerRes.data
  const name = profileRes.data?.full_name || email.split("@")[0]

  const matchByJob = new Map((matchRes.data ?? []).map((m: any) => [m.job_id, m]))
  const jobs: SeekerJob[] = (jobsRes.data ?? []).map((r: any) => jobRowToSeekerJob(r, matchByJob.get(r.id)))
  const jobsById = new Map(jobs.map(j => [j.id, j]))
  ;(appsRes.data ?? []).forEach((a: any) => {
    if (!jobsById.has(a.job_id) && a.jobs) jobsById.set(a.job_id, jobRowToSeekerJob(a.jobs, matchByJob.get(a.job_id)))
  })

  const tracker: TrackedApplication[] = (appsRes.data ?? []).map((a: any) => ({
    id: a.id,
    jobId: a.job_id,
    stage: a.stage as ApplicationStage,
    appliedOn: timeAgo(a.created_at),
  }))

  const conversations = await loadConversations(userId, convRes.data ?? [])

  const credits = (txnsRes.data ?? []).reduce((s: number, t: any) => s + t.delta, 0) + (sp?.credits ?? 0)

  const myLikes = new Set((likesRes.data ?? []).map((l: any) => l.post_id))
  const commentCounts = new Map<string, number>()
  ;(commentsRes.data ?? []).forEach((c: any) => commentCounts.set(c.post_id, (commentCounts.get(c.post_id) ?? 0) + 1))

  // mentors: visible profiles + their plans/reviews/resources
  const mentorRes = await supabase
    .from("mentor_profiles")
    .select("*, profiles!mentor_profiles_user_id_fkey(full_name)")
    .eq("visible", true)
  const mentorIds = (mentorRes.data ?? []).map((m: any) => m.user_id)
  const [plansRes, reviewsRes, resourcesRes, menteeCounts] = await Promise.all([
    supabase.from("mentor_plans").select("*").in("mentor_id", mentorIds).eq("published", true),
    supabase.from("mentor_reviews").select("*, profiles!mentor_reviews_author_id_fkey(full_name, role)").in("mentor_id", mentorIds),
    supabase.from("mentor_resources").select("*").in("mentor_id", mentorIds),
    supabase.from("mentor_subscriptions").select("mentor_id").in("mentor_id", mentorIds).eq("status", "active"),
  ])
  const menteeCountMap = new Map<string, number>()
  ;(menteeCounts.data ?? []).forEach((s: any) => menteeCountMap.set(s.mentor_id, (menteeCountMap.get(s.mentor_id) ?? 0) + 1))

  const mentors: MentorListing[] = (mentorRes.data ?? []).map((m: any) => {
    const plans = (plansRes.data ?? []).filter((p: any) => p.mentor_id === m.user_id)
    const reviews = (reviewsRes.data ?? []).filter((r: any) => r.mentor_id === m.user_id)
    const resources = (resourcesRes.data ?? []).filter((r: any) => r.mentor_id === m.user_id)
    const rating = reviews.length ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : 0
    const mName = m.profiles?.full_name ?? "Mentor"
    return {
      id: m.user_id,
      name: mName,
      initials: initials(mName),
      role: m.headline.split("—")[0]?.split(" at ")[0]?.trim() ?? "Mentor",
      company: m.company,
      rating: Math.round(rating * 10) / 10,
      mentees: menteeCountMap.get(m.user_id) ?? 0,
      responseTime: "< 24h",
      about: m.bio,
      expertise: m.expertise ?? [],
      videos: resources.filter((r: any) => r.kind === "video").map((r: any) => ({ title: r.title, duration: r.meta })),
      resources: resources.map((r: any) => ({ title: r.title, kind: r.kind })),
      plans: plans.map((p: any) => ({ id: p.id, name: p.name, price: p.price, blurb: p.blurb, features: p.features })),
      reviews: reviews.slice(0, 5).map((r: any) => ({
        name: r.profiles?.full_name ?? "Mentee",
        role: r.profiles?.role ?? "Mentee",
        ago: timeAgo(r.created_at),
        text: r.body,
        rating: r.rating,
      })),
    }
  })

  const profile: SeekerProfile = {
    name,
    initials: initials(name),
    title: sp?.title ?? "",
    location: sp?.location ?? "",
    joined: profileRes.data ? new Date(profileRes.data.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "",
    email,
    phone: "",
    availability: sp?.availability ?? "",
    about: sp?.about ?? "",
    skills: sp?.skills ?? [],
    aiSuggestedSkills: [],
    portfolio: sp?.portfolio ?? "",
    github: sp?.github ?? "",
    linkedin: sp?.linkedin ?? "",
    readiness: sp?.readiness ?? 0,
    profileStrength: sp?.readiness ?? 0,
    experience: (expRes.data ?? []).map((e: any): Experience => ({ id: e.id, role: e.role, company: e.company, initials: initials(e.company), period: e.period, description: e.description })),
    education: (eduRes.data ?? []).map((e: any): Education => ({ id: e.id, degree: e.degree, school: e.school, period: e.period })),
    projects: (projRes.data ?? []).map((p: any): Project => ({ id: p.id, name: p.name, description: p.description, link: p.link ?? undefined })),
    certifications: (certRes.data ?? []).map((c: any): Certification => ({ id: c.id, name: c.name, issuer: c.issuer, year: c.year })),
    badges: (sp?.badges ?? []) as AchievementBadge[],
  }

  // merge DB assessment status into the seed quiz catalog (questions live client-side)
  const assessBySkill = new Map((assessRes.data ?? []).map((a: any) => [a.skill, a]))
  const assessments: SkillAssessment[] = seekerSeed.skillAssessments.map(s => {
    const row = assessBySkill.get(s.skill)
    return row
      ? { ...s, status: row.status === "passed" ? "passed" : "failed", score: row.score }
      : s
  })

  const checklist: ChecklistStep[] = (sp?.checklist?.length ? sp.checklist : seekerSeed.seekerChecklist) as ChecklistStep[]

  return {
    profile,
    jobs,
    tracker,
    resumes: (resumesRes.data ?? []).map((r: any): ResumeDoc => ({
      id: r.id, name: r.name, updated: timeAgo(r.created_at),
      size: "—", primary: r.is_primary, score: r.score ?? 0,
    })),
    prepSessions: (prepRes.data ?? []).map((p: any): PrepSession => ({
      id: p.id, topic: p.detail?.topic ?? p.kind, category: p.kind,
      duration: p.detail?.duration ?? "—", date: timeAgo(p.taken_at),
      score: p.score ?? 0, feedback: p.detail?.feedback ?? [],
    })),
    assessments,
    mentors,
    subscribedPlans: (subsRes.data ?? []).map((s: any) => s.plan_id),
    posts: (postsRes.data ?? []).map((p: any): CommunityPost => ({
      id: p.id, author: p.profiles?.full_name ?? "Member",
      initials: initials(p.profiles?.full_name ?? "?"),
      role: p.profiles?.role ?? "member", ago: timeAgo(p.created_at),
      tag: p.tag, title: "", body: p.body,
      likes: 0, comments: commentCounts.get(p.id) ?? 0,
      liked: myLikes.has(p.id),
    })),
    credits,
    creditTxns: (txnsRes.data ?? []).map((t: any): CreditTransaction => ({
      id: t.id, label: t.reason, date: timeAgo(t.created_at),
      amount: t.delta, kind: t.delta >= 0 ? "earn" : "spend",
    })),
    invoices: (invoicesRes.data ?? []).map((i: any): Invoice => ({
      id: i.id, date: new Date(i.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      amount: `₹${i.amount.toLocaleString("en-IN")}`, status: i.status as "paid" | "pending", plan: i.label,
    })),
    checklist,
    settings: { ...seekerSeed.seekerSettings, ...(settingsRes.data?.data ?? {}) } as SeekerSettings,
    notifications: (notifsRes.data ?? []).map((n: any): AppNotification => ({
      id: n.id, text: n.text, ago: timeAgo(n.created_at), read: n.read,
    })),
    conversations,
    appliedJobs: (appsRes.data ?? []).map((a: any) => a.job_id),
  }
}

async function loadConversations(userId: string, parts: any[]): Promise<Conversation[]> {
  if (!parts.length) return []
  const ids = parts.map((p: any) => p.conversation_id)
  const [convRes, msgsRes, othersRes] = await Promise.all([
    supabase.from("conversations").select("*").in("id", ids),
    supabase.from("messages").select("*").in("conversation_id", ids).order("created_at"),
    supabase.from("conversation_participants").select("conversation_id, user_id, profiles(full_name, role)").in("conversation_id", ids).neq("user_id", userId),
  ])
  const convById = new Map((convRes.data ?? []).map((c: any) => [c.id, c]))
  const otherByConv = new Map<string, any>()
  ;(othersRes.data ?? []).forEach((o: any) => { if (!otherByConv.has(o.conversation_id)) otherByConv.set(o.conversation_id, o) })
  const msgsByConv = new Map<string, any[]>()
  ;(msgsRes.data ?? []).forEach((m: any) => {
    const arr = msgsByConv.get(m.conversation_id) ?? []
    arr.push(m)
    msgsByConv.set(m.conversation_id, arr)
  })
  const lastRead = new Map(parts.map((p: any) => [p.conversation_id, new Date(p.last_read_at)]))

  return ids.map((id: string): Conversation => {
    const msgs = msgsByConv.get(id) ?? []
    const last = msgs[msgs.length - 1]
    const readAt = lastRead.get(id) ?? new Date(0)
    const other = otherByConv.get(id)
    return {
      id,
      candidateId: other?.user_id ?? "",
      subject: other?.profiles?.full_name ?? convById.get(id)?.subject ?? "Conversation",
      preview: last?.body ?? "",
      ago: last ? timeAgo(last.created_at) : "",
      unread: msgs.filter(m => m.sender_id !== userId && new Date(m.created_at) > readAt).length,
      messages: msgs.map((m): ChatMessage => ({
        id: m.id, from: m.sender_id === userId ? "us" : "them",
        text: m.body, ago: timeAgo(m.created_at),
      })),
    }
  }).filter(c => c.subject || c.messages.length)
}

/* ---------- employer ---------- */

const workplaceMap: Record<string, EmployerJob["workplace"]> = {
  remote: "Remote", hybrid: "Hybrid", onsite: "On-site",
}

export async function loadEmployerState(
  userId: string
): Promise<Partial<EmployerState> & { companyId?: string }> {
  const memberRes = await supabase
    .from("company_members")
    .select("company_id, member_role, title, status")
    .eq("user_id", userId)
  const companyId = memberRes.data?.[0]?.company_id
  if (!companyId) return {}

  const jobIds = (await supabase.from("jobs").select("id").eq("company_id", companyId)).data?.map((j: any) => j.id) ?? []

  const [
    companyRes, membersRes, invitesRes, jobsRes, appsRes, notesRes, activityRes,
    notifsRes, convRes,
  ] = await Promise.all([
    supabase.from("companies").select("*").eq("id", companyId).single(),
    supabase.from("company_members").select("*, profiles(full_name)").eq("company_id", companyId),
    supabase.from("company_invites").select("*").eq("company_id", companyId).eq("status", "pending"),
    supabase.from("jobs").select("*, applications(count)").eq("company_id", companyId).order("created_at", { ascending: false }),
    jobIds.length
      ? supabase.from("applications").select("*, seeker_profiles(*, profiles!seeker_profiles_user_id_fkey(full_name)), jobs(title)").in("job_id", jobIds)
      : Promise.resolve({ data: [] }),
    jobIds.length
      ? supabase.from("application_notes").select("*, applications!inner(job_id)").in("applications.job_id", jobIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase.from("company_activity").select("*, profiles(full_name)").eq("company_id", companyId).order("created_at", { ascending: false }).limit(20),
    supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    supabase.from("conversation_participants").select("conversation_id, last_read_at").eq("user_id", userId),
  ])

  const c = companyRes.data
  const notesByApp = new Map<string, any[]>()
  ;(notesRes.data ?? []).forEach((n: any) => {
    const arr = notesByApp.get(n.application_id) ?? []
    arr.push(n)
    notesByApp.set(n.application_id, arr)
  })

  const company: CompanyProfile = {
    name: c.name,
    initials: initials(c.name),
    industry: c.industry, location: c.hq, size: c.size,
    openRoles: (jobsRes.data ?? []).filter((j: any) => j.status === "active").length,
    plan: c.plan, website: c.website, linkedin: c.linkedin, twitter: c.twitter,
    about: c.about, founded: c.founded, headquarters: c.hq, funding: c.funding, revenue: c.revenue,
    techStack: c.tech_stack ?? [], benefits: c.benefits ?? [], values: c.values ?? [],
    locations: c.locations ?? [],
  }

  const settings = (c.settings ?? {}) as EmployerSettings

  return {
    companyId,
    company,
    jobs: (jobsRes.data ?? []).map((j: any): EmployerJob => ({
      id: j.id, title: j.title, department: j.department, location: j.location,
      workplace: workplaceMap[j.workplace] ?? "Remote",
      type: j.type as EmployerJob["type"], level: j.level as EmployerJob["level"],
      status: j.status as EmployerJob["status"],
      applicants: (j.applications?.[0]?.count as number) ?? 0,
      views: j.views, shortlisted: 0, hired: 0,
      salaryMin: j.comp_min ?? undefined, salaryMax: j.comp_max ?? undefined,
      currency: j.currency, description: j.description,
      responsibilities: j.responsibilities ?? [], qualifications: j.requirements ?? [],
      skills: j.skills ?? [], screening: j.screening ?? [],
      education: j.education as EmployerJob["education"],
    })),
    candidates: (appsRes.data ?? []).map((a: any): Candidate => ({
      id: a.id,
      name: a.seeker_profiles?.profiles?.full_name ?? "Candidate",
      initials: initials(a.seeker_profiles?.profiles?.full_name ?? "?"),
      title: a.seeker_profiles?.title ?? "", location: a.seeker_profiles?.location ?? "",
      years: 0, skills: a.seeker_profiles?.skills ?? [],
      match: 0, matchBreakdown: { skills: 0, experience: 0, culture: 0 }, rationale: "",
      status: a.candidate_stage as CandidateStatus,
      appliedFor: a.job_id, appliedAgo: timeAgo(a.created_at),
      source: (a.source as Candidate["source"]) ?? "Fill-it-up",
      isAiPick: a.is_ai_pick,
      assignedTo: a.assigned_to ?? undefined,
      notes: (notesByApp.get(a.id) ?? []).map((n: any) => ({ id: n.id, text: n.body, ago: timeAgo(n.created_at) })),
    })),
    team: [
      ...(membersRes.data ?? []).map((m: any): TeamMember => ({
        id: m.user_id, name: m.profiles?.full_name ?? "Member",
        initials: initials(m.profiles?.full_name ?? "?"),
        email: m.email ?? "", phone: m.phone ?? "",
        role: (m.title || m.member_role) as TeamMember["role"],
        pending: m.status === "invited",
      })),
      ...(invitesRes.data ?? []).map((i: any): TeamMember => ({
        id: i.id, name: i.email.split("@")[0],
        initials: initials(i.email.split("@")[0]),
        email: i.email, phone: i.phone ?? "",
        role: (i.title || i.role) as TeamMember["role"],
        pending: true,
      })),
    ],
    activity: (activityRes.data ?? []).map((a: any) => ({
      id: a.id, actor: a.profiles?.full_name ?? "System", action: a.text, ago: timeAgo(a.created_at),
    })),
    settings,
    notifications: (notifsRes.data ?? []).map((n: any): AppNotification => ({
      id: n.id, text: n.text, ago: timeAgo(n.created_at), read: n.read,
    })),
    conversations: await loadConversations(userId, convRes.data ?? []),
  }
}

/* ---------- mentor ---------- */

export async function loadMentorState(userId: string, email: string): Promise<Partial<MentorState>> {
  const [
    profileRes, mpRes, plansRes, subsRes, sessionsRes, reviewsRes,
    resourcesRes, payoutsRes, avRes, blockedRes, settingsRes, notifsRes, convRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("mentor_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("mentor_plans").select("*").eq("mentor_id", userId).order("sort_order"),
    supabase.from("mentor_subscriptions").select("*, seeker_profiles(*, profiles!seeker_profiles_user_id_fkey(full_name)), mentor_plans(name, price)").eq("mentor_id", userId).eq("status", "active"),
    supabase.from("mentor_sessions").select("*").eq("mentor_id", userId).order("scheduled_at"),
    supabase.from("mentor_reviews").select("*, profiles!mentor_reviews_author_id_fkey(full_name, role)").eq("mentor_id", userId).order("created_at", { ascending: false }),
    supabase.from("mentor_resources").select("*").eq("mentor_id", userId).order("created_at", { ascending: false }),
    supabase.from("payouts").select("*").eq("mentor_id", userId).order("created_at", { ascending: false }),
    supabase.from("mentor_availability").select("*").eq("mentor_id", userId).maybeSingle(),
    supabase.from("mentor_blocked_dates").select("day").eq("mentor_id", userId),
    supabase.from("user_settings").select("data").eq("user_id", userId).maybeSingle(),
    supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    supabase.from("conversation_participants").select("conversation_id, last_read_at").eq("user_id", userId),
  ])

  const mp = mpRes.data
  const name = profileRes.data?.full_name || email.split("@")[0]

  const profile: MentorProfile = {
    name, initials: initials(name), email,
    headline: mp?.headline ?? "", bio: mp?.bio ?? "",
    expertise: mp?.expertise ?? [], company: mp?.company ?? "",
    hourlyRate: mp?.hourly_rate ?? 0, languages: mp?.languages ?? [],
    timezone: mp?.timezone ?? "", linkedin: mp?.linkedin ?? "", website: mp?.website ?? "",
  }

  const plans: MentorPlan[] = (plansRes.data ?? []).map((p: any) => ({
    id: p.id, name: p.name, price: p.price, blurb: p.blurb,
    features: p.features, published: p.published, paused: p.paused,
    menteeCount: (subsRes.data ?? []).filter((s: any) => s.plan_id === p.id).length,
  }))

  const mentees: Mentee[] = (subsRes.data ?? []).map((s: any): Mentee => ({
    id: s.mentee_id,
    name: s.seeker_profiles?.profiles?.full_name ?? "Mentee",
    initials: initials(s.seeker_profiles?.profiles?.full_name ?? "?"),
    role: s.seeker_profiles?.title ?? "",
    plan: s.mentor_plans?.name ?? "",
    since: new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    renews: s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
  }))

  const availability: AvailabilityState = {
    weekly: avRes.data?.weekly ?? {},
    sessionLength: avRes.data?.session_length ?? 30,
    buffer: avRes.data?.buffer_minutes ?? 10,
    blockedDates: (blockedRes.data ?? []).map((b: any) => b.day),
  }

  return {
    profile, plans, mentees,
    sessions: (sessionsRes.data ?? []).map((s: any): MentorSession => ({
      id: s.id, title: s.title, menteeId: s.mentee_id,
      date: s.scheduled_at.slice(0, 10),
      time: new Date(s.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      status: s.status === "scheduled" ? "upcoming" : "past",
      notes: s.notes ?? undefined,
    })),
    reviews: (reviewsRes.data ?? []).map((r: any): MentorReview => ({
      id: r.id, author: r.profiles?.full_name ?? "Mentee",
      initials: initials(r.profiles?.full_name ?? "?"),
      role: r.profiles?.role ?? "Mentee", ago: timeAgo(r.created_at),
      rating: r.rating, text: r.body, reply: r.reply ?? undefined,
    })),
    resources: (resourcesRes.data ?? []).map((r: any): MentorResource => ({
      id: r.id, title: r.title, kind: r.kind, category: r.category,
      meta: r.meta, views: r.views, downloads: r.downloads,
    })),
    payouts: (payoutsRes.data ?? []).map((p: any): MentorPayout => ({
      id: p.id, label: p.label,
      date: new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      amount: p.amount, status: p.status,
    })),
    availability,
    settings: { ...(settingsRes.data?.data ?? {}) } as MentorSettings,
    checklist: (mp?.checklist?.length ? mp.checklist : []) as MentorChecklistStep[],
    notifications: (notifsRes.data ?? []).map((n: any): AppNotification => ({
      id: n.id, text: n.text, ago: timeAgo(n.created_at), read: n.read,
    })),
    conversations: await loadConversations(userId, convRes.data ?? []),
  }
}

```

## FILE: src/lib/seeker-types.ts

```typescript
// ── Job seeker domain types (mock-data shapes; swap for Supabase later) ──────

export type ApplicationStage =
  | "saved"
  | "in_progress"
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "archived"

export const STAGE_LABEL: Record<ApplicationStage, string> = {
  saved: "Saved",
  in_progress: "In Progress",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  archived: "Archived",
}

export interface SeekerJob {
  id: string
  company: string
  logoInitials: string
  title: string
  location: string
  type: string // Full-time / Contract
  salary: string
  posted: string
  matchScore: number
  tags: string[]
  about: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  applyType: "quick" | "easy" | "standard"
  // AI match analysis
  aiSummary: string
  skillsMatched: [number, number] // matched of listed
  fitPoints: string[]
  gaps: string[]
  salaryContext: string
  resumeTips: string[]
  prepPoints: string[]
  growth: string
  teamSize: string
  reportsTo: string
}

export interface TrackedApplication {
  id: string
  jobId: string
  stage: ApplicationStage
  appliedOn?: string
  nextStep?: string
  note?: string
}

export interface ResumeDoc {
  id: string
  name: string
  updated: string
  size: string
  primary: boolean
  score: number
  enhancedFor?: string
}

export interface Experience {
  id: string
  role: string
  company: string
  initials: string
  period: string
  description: string
}

export interface Education {
  id: string
  degree: string
  school: string
  period: string
}

export interface Project {
  id: string
  name: string
  description: string
  link?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  year: string
}

export interface AchievementBadge {
  id: string
  title: string
  description: string
  earned: string
  kind: "system" | "custom"
}

export interface SeekerProfile {
  name: string
  initials: string
  title: string
  location: string
  joined: string
  email: string
  phone: string
  availability: string
  about: string
  skills: string[]
  aiSuggestedSkills: string[]
  portfolio: string
  github: string
  linkedin: string
  readiness: number
  profileStrength: number
  experience: Experience[]
  education: Education[]
  projects: Project[]
  certifications: Certification[]
  badges: AchievementBadge[]
}

export interface PrepCategory {
  id: string
  name: string
  topics: string[]
}

export interface PrepSession {
  id: string
  topic: string
  category: string
  duration: string
  date: string
  score: number
  feedback: string[]
}

export interface QuizQuestion {
  q: string
  options: string[]
  answer: number
}

export interface SkillAssessment {
  id: string
  skill: string
  questions: number
  minutes: number
  passPct: number
  status: "none" | "in_progress" | "passed" | "failed"
  score?: number
  quiz: QuizQuestion[]
}

export interface MentorPlan {
  id: string
  name: string
  price: number
  blurb: string
  features: string[]
  recommended?: boolean
}

export interface MentorListing {
  id: string
  name: string
  initials: string
  role: string
  company: string
  rating: number
  mentees: number
  responseTime: string
  about: string
  expertise: string[]
  videos: { title: string; duration: string }[]
  resources: { title: string; kind: string }[]
  plans: MentorPlan[]
  reviews: { name: string; role: string; ago: string; text: string; rating: number }[]
}

export interface CommunityPost {
  id: string
  author: string
  initials: string
  role: string
  ago: string
  tag: string
  title: string
  body: string
  likes: number
  comments: number
  liked?: boolean
}

export interface CreditTransaction {
  id: string
  label: string
  date: string
  amount: number
  kind: "spend" | "earn"
}

export interface Invoice {
  id: string
  date: string
  amount: string
  status: "paid" | "pending"
  plan: string
}

export interface SeekerSettings {
  profileVisibility: boolean
  openToWork: boolean
  jobAlerts: boolean
  aiAutoApply: boolean
  twoFactor: boolean
  notifications: {
    jobMatches: boolean
    applicationUpdates: boolean
    messages: boolean
    weeklyDigest: boolean
    productUpdates: boolean
  }
}

export interface ChecklistStep {
  id: string
  title: string
  description: string
  done: boolean
}

```

## FILE: src/lib/seeker-store.tsx

```typescript
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import * as seed from "./seeker-data"
import { supabase } from "./supabase/client"
import { loadSeekerState } from "./supabase/data"
import { useAuth } from "./auth"
import type {
  ChatMessage,
  AppNotification,
  Conversation,
} from "./employer-types"
import type {
  ApplicationStage,
  Certification,
  ChecklistStep,
  CommunityPost,
  CreditTransaction,
  Education,
  Experience,
  Invoice,
  MentorListing,
  PrepSession,
  Project,
  ResumeDoc,
  SeekerJob,
  SeekerProfile,
  SeekerSettings,
  SkillAssessment,
  TrackedApplication,
} from "./seeker-types"

/* ----------------------------------------------------------------
   Seeker store — Supabase-backed when signed in; seed + localStorage
   for guests so the open demo routes still work.
   ---------------------------------------------------------------- */

const STORAGE_KEY = "fillitup-seeker-v1"

export interface SeekerState {
  profile: SeekerProfile
  jobs: SeekerJob[]
  tracker: TrackedApplication[]
  resumes: ResumeDoc[]
  prepSessions: PrepSession[]
  assessments: SkillAssessment[]
  mentors: MentorListing[]
  subscribedPlans: string[]
  posts: CommunityPost[]
  credits: number
  creditTxns: CreditTransaction[]
  invoices: Invoice[]
  checklist: ChecklistStep[]
  settings: SeekerSettings
  notifications: AppNotification[]
  conversations: Conversation[]
  appliedJobs: string[]
}

function seedState(): SeekerState {
  return {
    profile: seed.seekerProfile,
    jobs: seed.seekerJobs,
    tracker: seed.trackedApplications,
    resumes: seed.resumes,
    prepSessions: seed.prepSessions,
    assessments: seed.skillAssessments,
    mentors: seed.mentorListings,
    subscribedPlans: [],
    posts: seed.communityPosts,
    credits: 1240,
    creditTxns: seed.creditTransactions,
    invoices: seed.invoices,
    checklist: seed.seekerChecklist,
    settings: seed.seekerSettings,
    notifications: seed.seekerNotifications,
    conversations: seed.seekerConversations,
    appliedJobs: [],
  }
}

function load(): SeekerState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...seedState(), ...JSON.parse(raw) }
  } catch {
    /* corrupted storage — reseed */
  }
  return seedState()
}

interface SeekerContextValue {
  state: SeekerState
  loading: boolean
  remote: boolean
  updateProfile: (patch: Partial<SeekerProfile>) => void
  addExperience: (e: Omit<Experience, "id">) => void
  updateExperience: (id: string, e: Omit<Experience, "id">) => void
  removeExperience: (id: string) => void
  addEducation: (e: Omit<Education, "id">) => void
  updateEducation: (id: string, e: Omit<Education, "id">) => void
  removeEducation: (id: string) => void
  addProject: (p: Omit<Project, "id">) => void
  updateProject: (id: string, p: Omit<Project, "id">) => void
  removeProject: (id: string) => void
  addCertification: (c: Omit<Certification, "id">) => void
  updateCertification: (id: string, c: Omit<Certification, "id">) => void
  removeCertification: (id: string) => void
  addSkill: (skill: string) => void
  removeSkill: (skill: string) => void
  trackJob: (jobId: string, stage: ApplicationStage) => void
  setStage: (trackId: string, stage: ApplicationStage) => void
  removeTracked: (trackId: string) => void
  applyToJob: (jobId: string) => void
  addResume: (r: Omit<ResumeDoc, "id">) => void
  setPrimaryResume: (id: string) => void
  removeResume: (id: string) => void
  enhanceResume: (id: string, forJob: string) => void
  addPrepSession: (s: Omit<PrepSession, "id">) => void
  setAssessmentStatus: (id: string, status: SkillAssessment["status"], score?: number) => void
  subscribePlan: (planId: string) => void
  addPost: (p: Omit<CommunityPost, "id" | "likes" | "comments">) => void
  toggleLike: (id: string) => void
  spendCredits: (amount: number, label: string) => boolean
  updateSettings: (patch: Partial<SeekerSettings>) => void
  markAllRead: () => void
  markRead: (id: string) => void
  sendMessage: (conversationId: string, text: string) => void
  markConversationRead: (conversationId: string) => void
  setStepDone: (id: string, done: boolean) => void
  resetDemo: () => void
}

const SeekerContext = createContext<SeekerContextValue | null>(null)
const uid = () => crypto.randomUUID()

export function SeekerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<SeekerState>(load)
  const [loading, setLoading] = useState(false)
  const remoteRef = useRef(false)

  /* hydrate from Supabase when signed in */
  useEffect(() => {
    if (!user) {
      remoteRef.current = false
      return
    }
    let alive = true
    setLoading(true)
    loadSeekerState(user.id, user.email)
      .then(s => {
        if (alive) {
          remoteRef.current = true
          setState(s)
        }
      })
      .catch(err => console.error("seeker load failed", err))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [user])

  /* guest-mode persistence */
  useEffect(() => {
    if (remoteRef.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* non-fatal */ }
  }, [state])

  const uidRef = useRef<string | null>(null)
  uidRef.current = user?.id ?? null

  /* FK anchor — most seeker tables reference seeker_profiles(user_id),
     which only exists after the profile row is created. Ensure it before
     every write so inserts never hit a dangling FK and profile-column
     updates never silently no-op on a missing row. */
  const seekerReady = useCallback(async (id: string) => {
    await supabase
      .from("seeker_profiles")
      .upsert({ user_id: id }, { onConflict: "user_id" })
  }, [])

  const db = useCallback(
    (fn: (uid: string) => PromiseLike<unknown>) => {
      const id = uidRef.current
      if (id && remoteRef.current)
        void (async () => {
          await seekerReady(id)
          await fn(id)
        })().catch((e: unknown) => console.error("db write failed", e))
    },
    [seekerReady]
  )

  /* ---------- profile ---------- */
  const SEEKER_COLS: Partial<Record<keyof SeekerProfile, string>> = {
    title: "title", location: "location", availability: "availability",
    about: "about", linkedin: "linkedin", github: "github", portfolio: "portfolio",
    skills: "skills", readiness: "readiness",
  }

  const updateProfile = useCallback((patch: Partial<SeekerProfile>) => {
    setState(s => ({ ...s, profile: { ...s.profile, ...patch } }))
    db(async id => {
      if (patch.name) await supabase.from("profiles").update({ full_name: patch.name }).eq("id", id)
      const cols: Record<string, unknown> = {}
      for (const [k, col] of Object.entries(SEEKER_COLS))
        if (patch[k as keyof SeekerProfile] !== undefined) cols[col] = patch[k as keyof SeekerProfile]
      if (Object.keys(cols).length)
        await supabase.from("seeker_profiles").upsert({ user_id: id, ...cols })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const listPatch = <T extends { id: string }>(
    key: "experience" | "education" | "projects" | "certifications",
    table: string
  ) => ({
    add: (item: Omit<T, "id">) => {
      const tempId = uid()
      setState(s => ({
        ...s,
        profile: {
          ...s.profile,
          [key]: [{ ...item, id: tempId } as T, ...(s.profile[key] as unknown as T[])],
        },
      }))
      db(async me => {
        const { data } = await supabase
          .from(table)
          .insert({ seeker_id: me, ...rowFor(table, item) })
          .select("id").single()
        if (data?.id)
          setState(s => ({
            ...s,
            profile: {
              ...s.profile,
              [key]: (s.profile[key] as unknown as T[]).map(x => (x.id === tempId ? { ...x, id: data.id } : x)),
            },
          }))
      })
    },
    update: (id: string, item: Omit<T, "id">) => {
      setState(s => ({
        ...s,
        profile: {
          ...s.profile,
          [key]: (s.profile[key] as unknown as T[]).map(x => (x.id === id ? ({ ...item, id } as T) : x)),
        },
      }))
      db(() => supabase.from(table).update(rowFor(table, item)).eq("id", id))
    },
    remove: (id: string) => {
      setState(s => ({
        ...s,
        profile: {
          ...s.profile,
          [key]: (s.profile[key] as unknown as T[]).filter(x => x.id !== id),
        },
      }))
      db(() => supabase.from(table).delete().eq("id", id))
    },
  })

  const exp = listPatch<Experience>("experience", "seeker_experience")
  const edu = listPatch<Education>("education", "seeker_education")
  const proj = listPatch<Project>("projects", "seeker_projects")
  const cert = listPatch<Certification>("certifications", "seeker_certifications")

  const addSkill = useCallback((skill: string) => {
    setState(s => ({
      ...s,
      profile: {
        ...s.profile,
        skills: s.profile.skills.includes(skill) ? s.profile.skills : [...s.profile.skills, skill],
      },
    }))
    db(id => supabase.from("seeker_profiles").update({ skills: [...state.profile.skills, skill] }).eq("user_id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.profile.skills])

  const removeSkill = useCallback((skill: string) => {
    setState(s => ({
      ...s,
      profile: { ...s.profile, skills: s.profile.skills.filter(x => x !== skill) },
    }))
    db(id => supabase.from("seeker_profiles").update({ skills: state.profile.skills.filter(x => x !== skill) }).eq("user_id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.profile.skills])

  /* ---------- jobs & tracker ---------- */
  const trackJob = useCallback((jobId: string, stage: ApplicationStage) => {
    setState(s => {
      const existing = s.tracker.find(t => t.jobId === jobId)
      if (existing)
        return { ...s, tracker: s.tracker.map(t => (t.jobId === jobId ? { ...t, stage } : t)) }
      return { ...s, tracker: [{ id: uid(), jobId, stage }, ...s.tracker] }
    })
    db(id => supabase.from("applications").upsert(
      { job_id: jobId, seeker_id: id, stage },
      { onConflict: "job_id,seeker_id" }
    ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const setStage = useCallback((trackId: string, stage: ApplicationStage) => {
    setState(s => ({
      ...s,
      tracker: s.tracker.map(t => (t.id === trackId ? { ...t, stage } : t)),
    }))
    db(() => supabase.from("applications").update({ stage }).eq("id", trackId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const removeTracked = useCallback((trackId: string) => {
    setState(s => ({ ...s, tracker: s.tracker.filter(t => t.id !== trackId) }))
    db(() => supabase.from("applications").delete().eq("id", trackId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const applyToJob = useCallback((jobId: string) => {
    setState(s => {
      const tracked = s.tracker.find(t => t.jobId === jobId)
      return {
        ...s,
        appliedJobs: s.appliedJobs.includes(jobId) ? s.appliedJobs : [...s.appliedJobs, jobId],
        tracker: tracked
          ? s.tracker.map(t => t.jobId === jobId ? { ...t, stage: "applied", appliedOn: "just now" } : t)
          : [{ id: uid(), jobId, stage: "applied" as const, appliedOn: "just now" }, ...s.tracker],
      }
    })
    db(id => supabase.from("applications").upsert(
      { job_id: jobId, seeker_id: id, stage: "applied" },
      { onConflict: "job_id,seeker_id" }
    ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  /* ---------- resumes ---------- */
  const addResume = useCallback((r: Omit<ResumeDoc, "id">) => {
    const tempId = uid()
    setState(s => ({ ...s, resumes: [{ ...r, id: tempId }, ...s.resumes] }))
    db(async me => {
      const { data } = await supabase.from("resumes")
        .insert({ seeker_id: me, name: r.name, is_primary: r.primary, score: r.score })
        .select("id").single()
      if (data?.id)
        setState(s => ({ ...s, resumes: s.resumes.map(x => x.id === tempId ? { ...x, id: data.id } : x) }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const setPrimaryResume = useCallback((id: string) => {
    setState(s => ({ ...s, resumes: s.resumes.map(r => ({ ...r, primary: r.id === id })) }))
    db(async me => {
      await supabase.from("resumes").update({ is_primary: false }).eq("seeker_id", me)
      await supabase.from("resumes").update({ is_primary: true }).eq("id", id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const removeResume = useCallback((id: string) => {
    setState(s => ({ ...s, resumes: s.resumes.filter(r => r.id !== id) }))
    db(() => supabase.from("resumes").delete().eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const enhanceResume = useCallback((id: string, forJob: string) => {
    setState(s => ({
      ...s,
      resumes: s.resumes.map(r =>
        r.id === id ? { ...r, enhancedFor: forJob, score: Math.min(98, r.score + 12) } : r
      ),
    }))
    // real AI enhancement lands via the resume-analyze edge function later
  }, [])

  /* ---------- AI tools ---------- */
  const addPrepSession = useCallback((ps: Omit<PrepSession, "id">) => {
    const tempId = uid()
    setState(s => ({ ...s, prepSessions: [{ ...ps, id: tempId }, ...s.prepSessions] }))
    db(me => supabase.from("interview_sessions").insert({
      seeker_id: me, kind: ps.category, score: ps.score,
      detail: { topic: ps.topic, duration: ps.duration, feedback: ps.feedback },
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const setAssessmentStatus = useCallback(
    (id: string, status: SkillAssessment["status"], score?: number) => {
      const skill = state.assessments.find(a => a.id === id)?.skill
      setState(s => ({
        ...s,
        assessments: s.assessments.map(a => (a.id === id ? { ...a, status, score } : a)),
      }))
      if (skill && (status === "passed" || status === "failed"))
        db(me => supabase.from("skill_assessments").upsert(
          { seeker_id: me, skill, status, score },
          { onConflict: "seeker_id,skill" }
        ))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db, state.assessments]
  )

  const subscribePlan = useCallback((planId: string) => {
    setState(s => ({
      ...s,
      subscribedPlans: s.subscribedPlans.includes(planId) ? s.subscribedPlans : [...s.subscribedPlans, planId],
    }))
    db(async me => {
      const { data: plan } = await supabase.from("mentor_plans").select("mentor_id").eq("id", planId).single()
      if (plan)
        await supabase.from("mentor_subscriptions").insert({
          plan_id: planId, mentor_id: plan.mentor_id, mentee_id: me, status: "pending",
        })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  /* ---------- community ---------- */
  const addPost = useCallback((p: Omit<CommunityPost, "id" | "likes" | "comments">) => {
    const tempId = uid()
    setState(s => ({ ...s, posts: [{ ...p, id: tempId, likes: 0, comments: 0 }, ...s.posts] }))
    db(async me => {
      const { data } = await supabase.from("community_posts")
        .insert({ author_id: me, tag: p.tag, body: p.body })
        .select("id").single()
      if (data?.id)
        setState(s => ({ ...s, posts: s.posts.map(x => x.id === tempId ? { ...x, id: data.id } : x) }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const toggleLike = useCallback((id: string) => {
    const liked = state.posts.find(p => p.id === id)?.liked
    setState(s => ({
      ...s,
      posts: s.posts.map(p =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p
      ),
    }))
    db(me => liked
      ? supabase.from("community_likes").delete().eq("post_id", id).eq("user_id", me)
      : supabase.from("community_likes").insert({ post_id: id, user_id: me })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.posts])

  /* ---------- credits ---------- */
  const spendCredits = useCallback((amount: number, label: string) => {
    let ok = false
    setState(s => {
      if (s.credits < amount) return s
      ok = true
      return {
        ...s,
        credits: s.credits - amount,
        creditTxns: [
          { id: uid(), label, date: "just now", amount: -amount, kind: "spend" as const },
          ...s.creditTxns,
        ],
      }
    })
    if (ok) db(me => supabase.from("credit_transactions").insert({ user_id: me, delta: -amount, reason: label }))
    return ok
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  /* ---------- settings ---------- */
  const updateSettings = useCallback((patch: Partial<SeekerSettings>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }))
    db(me => supabase.from("user_settings").upsert(
      { user_id: me, data: { ...state.settings, ...patch } },
      { onConflict: "user_id" }
    ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.settings])

  /* ---------- notifications ---------- */
  const markAllRead = useCallback(() => {
    setState(s => ({ ...s, notifications: s.notifications.map(n => ({ ...n, read: true })) }))
    db(me => supabase.from("notifications").update({ read: true }).eq("user_id", me).eq("read", false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const markRead = useCallback((id: string) => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
    }))
    db(() => supabase.from("notifications").update({ read: true }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  /* ---------- messaging ---------- */
  const sendMessage = useCallback((conversationId: string, text: string) => {
    const msg: ChatMessage = { id: uid(), from: "us", text, ago: "just now" }
    setState(s => ({
      ...s,
      conversations: s.conversations.map(c =>
        c.id === conversationId
          ? { ...c, preview: text, ago: "just now", messages: [...c.messages, msg] }
          : c
      ),
    }))
    db(me => supabase.from("messages").insert({ conversation_id: conversationId, sender_id: me, body: text }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const markConversationRead = useCallback((conversationId: string) => {
    setState(s => ({
      ...s,
      conversations: s.conversations.map(c =>
        c.id === conversationId ? { ...c, unread: 0 } : c
      ),
    }))
    db(me => supabase.from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId).eq("user_id", me))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  /* ---------- checklist ---------- */
  const setStepDone = useCallback((id: string, done: boolean) => {
    setState(s => {
      const checklist = s.checklist.map(c => (c.id === id ? { ...c, done } : c))
      db(me => supabase.from("seeker_profiles").upsert({ user_id: me, checklist }))
      return { ...s, checklist }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    remoteRef.current = false
    setState(seedState())
  }, [])

  const value = useMemo<SeekerContextValue>(
    () => ({
      state, loading, remote: remoteRef.current,
      updateProfile,
      addExperience: exp.add, updateExperience: exp.update, removeExperience: exp.remove,
      addEducation: edu.add, updateEducation: edu.update, removeEducation: edu.remove,
      addProject: proj.add, updateProject: proj.update, removeProject: proj.remove,
      addCertification: cert.add, updateCertification: cert.update, removeCertification: cert.remove,
      addSkill, removeSkill,
      trackJob, setStage, removeTracked, applyToJob,
      addResume, setPrimaryResume, removeResume, enhanceResume,
      addPrepSession, setAssessmentStatus, subscribePlan,
      addPost, toggleLike, spendCredits, updateSettings,
      markAllRead, markRead, sendMessage, markConversationRead,
      setStepDone, resetDemo,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, loading]
  )

  return <SeekerContext.Provider value={value}>{children}</SeekerContext.Provider>
}

/** map UI item shapes to table columns for the four profile lists */
function rowFor(table: string, item: Record<string, unknown>) {
  switch (table) {
    case "seeker_experience":
      return { role: item.role, company: item.company, period: item.period, description: item.description }
    case "seeker_education":
      return { degree: item.degree, school: item.school, period: item.period }
    case "seeker_projects":
      return { name: item.name, description: item.description, link: item.link || null }
    case "seeker_certifications":
      return { name: item.name, issuer: item.issuer, year: item.year }
    default:
      return item
  }
}

export function useSeeker() {
  const ctx = useContext(SeekerContext)
  if (!ctx) throw new Error("useSeeker must be used inside <SeekerProvider>")
  return ctx
}

```

## FILE: src/lib/employer-types.ts

```typescript
/* ----------------------------------------------------------------
   Employer-domain types — mirror the "Job Poster" Figma page.
   All data comes from src/lib/employer-data.ts (mock, DEMO_DATA).
   ---------------------------------------------------------------- */

export type JobStatus = "active" | "draft" | "closed"
export type WorkplaceType = "Remote" | "Hybrid" | "On-site"
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship"
export type ExperienceLevel = "Entry" | "Mid" | "Senior" | "Lead" | "Executive"

export interface ScreeningQuestion {
  question: string
  mustHave: boolean
}

export interface EmployerJob {
  id: string
  title: string
  department: string
  location: string
  workplace: WorkplaceType
  type: EmploymentType
  level: ExperienceLevel
  status: JobStatus
  applicants: number
  views: number
  shortlisted: number
  hired: number
  salaryMin?: number
  salaryMax?: number
  currency: string
  description: string
  responsibilities: string[]
  qualifications: string[]
  skills: string[]
  screening: ScreeningQuestion[]
  education: "Any" | "Bachelor's" | "Master's" | "PhD"
}

export type CandidateStatus =
  | "new"
  | "screened"
  | "shortlisted"
  | "interview"
  | "offer"
  | "hired"
  | "rejected"

export interface CandidateNote {
  id: string
  text: string
  ago: string
}

export interface Candidate {
  id: string
  name: string
  initials: string
  title: string
  location: string
  years: number
  skills: string[]
  match: number
  matchBreakdown: { skills: number; experience: number; culture: number }
  rationale: string
  status: CandidateStatus
  appliedFor: string // job id
  appliedAgo: string
  source: "Fill-it-up" | "LinkedIn" | "Naukri" | "Indeed"
  isAiPick: boolean
  assignedTo?: string
  notes: CandidateNote[]
}

export type TeamRole =
  | "Super Admin"
  | "Admin"
  | "Hiring Manager"
  | "Interviewer"
  | "Vendor"

export interface TeamMember {
  id: string
  name: string
  initials: string
  email: string
  phone: string
  role: TeamRole
  pending?: boolean
}

export interface ActivityEntry {
  id: string
  actor: string
  action: string
  ago: string
}

export interface ChatMessage {
  id: string
  from: "us" | "them"
  text: string
  ago: string
}

export interface Conversation {
  id: string
  candidateId: string
  subject: string
  preview: string
  ago: string
  unread: number
  messages: ChatMessage[]
}

export interface AppNotification {
  id: string
  text: string
  ago: string
  read: boolean
}

export interface Interview {
  id: string
  candidateId: string
  round: string
  jobTitle: string
  when: string
  predictedFit: number
}

export interface CompanyProfile {
  name: string
  initials: string
  industry: string
  location: string
  size: string
  openRoles: number
  plan: string
  website: string
  linkedin: string
  twitter: string
  about: string
  founded: string
  headquarters: string
  funding: string
  revenue: string
  techStack: string[]
  benefits: string[]
  values: string[]
  locations: { name: string; hq?: boolean }[]
}

export interface EmployerSettings {
  blindHiring: boolean
  twoFactor: boolean
  integrations: { calendar: boolean; slack: boolean; ats: boolean }
  notifications: {
    newApplicants: boolean
    interviewReminders: boolean
    weeklyReport: boolean
    aiAlerts: boolean
    productUpdates: boolean
  }
  analyticsSections: Record<string, boolean>
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  done: boolean
}

export const CANDIDATE_STATUS_LABEL: Record<CandidateStatus, string> = {
  new: "New",
  screened: "Screened",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
}

export interface InviteSuggestion {
  candidateId: string
  jobId: string
}

```

## FILE: src/lib/employer-store.tsx

```typescript
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import * as seed from "./employer-data"
import { supabase } from "./supabase/client"
import { loadEmployerState } from "./supabase/data"
import { useAuth } from "./auth"
import type {
  ActivityEntry,
  AppNotification,
  Candidate,
  CandidateNote,
  CandidateStatus,
  ChatMessage,
  CompanyProfile,
  Conversation,
  EmployerJob,
  EmployerSettings,
  OnboardingStep,
  TeamMember,
} from "./employer-types"

/* ----------------------------------------------------------------
   Employer store — Supabase-backed when signed in; seed + localStorage
   for guests so the open demo routes still work.
   ---------------------------------------------------------------- */

const STORAGE_KEY = "fillitup-employer-v1"

export interface EmployerState {
  jobs: EmployerJob[]
  candidates: Candidate[]
  settings: EmployerSettings
  notifications: AppNotification[]
  conversations: Conversation[]
  team: TeamMember[]
  onboarding: OnboardingStep[]
  invited: string[]
  company: CompanyProfile
  activity: ActivityEntry[]
}

const defaultSettings: EmployerSettings = {
  blindHiring: false,
  twoFactor: false,
  integrations: { calendar: true, slack: false, ats: false },
  notifications: {
    newApplicants: true,
    interviewReminders: true,
    weeklyReport: true,
    aiAlerts: true,
    productUpdates: false,
  },
  analyticsSections: {
    insights: true,
    stats: true,
    perJob: true,
    sources: true,
    distribution: true,
    trend: true,
    funnel: true,
  },
}

function seedState(): EmployerState {
  return {
    jobs: seed.employerJobs,
    candidates: seed.candidates,
    settings: defaultSettings,
    notifications: seed.employerNotifications,
    conversations: seed.conversations,
    team: seed.teamMembers,
    onboarding: seed.onboardingSteps,
    invited: [],
    company: seed.companyProfile,
    activity: seed.activityLog,
  }
}

function load(): EmployerState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...seedState(), ...JSON.parse(raw) }
  } catch {
    /* corrupted storage — reseed */
  }
  return seedState()
}

interface EmployerContextValue {
  state: EmployerState
  loading: boolean
  remote: boolean
  // jobs
  addJob: (job: EmployerJob) => void
  updateJob: (id: string, patch: Partial<EmployerJob>) => void
  // company
  updateCompany: (patch: Partial<CompanyProfile>) => void
  // candidates
  setCandidateStatus: (id: string, status: CandidateStatus) => void
  addCandidateNote: (id: string, text: string) => void
  assignCandidate: (id: string, memberId: string | undefined) => void
  // settings
  updateSettings: (patch: Partial<EmployerSettings>) => void
  // notifications
  markAllRead: () => void
  markRead: (id: string) => void
  // messaging
  sendMessage: (conversationId: string, text: string) => void
  markConversationRead: (conversationId: string) => void
  // team
  addTeamMember: (m: TeamMember) => void
  removeTeamMember: (id: string) => void
  // onboarding
  setStepDone: (id: string, done: boolean) => void
  // invites
  inviteCandidate: (candidateId: string) => void
  resetDemo: () => void
}

const EmployerContext = createContext<EmployerContextValue | null>(null)

const uid = () => crypto.randomUUID()

const workplaceToDb: Record<string, string> = {
  Remote: "remote", Hybrid: "hybrid", "On-site": "onsite",
}

export function EmployerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<EmployerState>(load)
  const [loading, setLoading] = useState(false)
  const remoteRef = useRef(false)
  const uidRef = useRef<string | null>(null)
  const companyIdRef = useRef<string | null>(null)
  uidRef.current = user?.id ?? null

  /* hydrate from Supabase when signed in */
  useEffect(() => {
    if (!user) {
      remoteRef.current = false
      companyIdRef.current = null
      return
    }
    let alive = true
    setLoading(true)
    loadEmployerState(user.id)
      .then(s => {
        if (!alive) return
        remoteRef.current = true
        companyIdRef.current = s.companyId ?? null
        setState(prev => ({
          ...prev,
          ...s,
          company: s.company ?? prev.company,
          settings: { ...prev.settings, ...(s.settings ?? {}) },
        } as EmployerState))
      })
      .catch(err => console.error("employer load failed", err))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [user])

  /* guest-mode persistence */
  useEffect(() => {
    if (remoteRef.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* non-fatal */ }
  }, [state])

  /* Company bootstrap — an employer's first remote write may arrive before
     any company exists. create_company() (SECURITY DEFINER rpc) makes the
     company + this user as its admin member in one shot. */
  const ensureCompany = useCallback(async () => {
    if (!companyIdRef.current) {
      const { data, error } = await supabase.rpc("create_company", { p_name: "My Company" })
      if (error) throw error
      companyIdRef.current = data ?? null
    }
    return companyIdRef.current
  }, [])

  const db = useCallback(
    (fn: (uid: string, companyId: string | null) => PromiseLike<unknown>) => {
      const id = uidRef.current
      if (id && remoteRef.current)
        void (async () => {
          const cid = await ensureCompany()
          await fn(id, cid)
        })().catch((e: unknown) => console.error("db write failed", e))
    },
    [ensureCompany]
  )

  const addJob = useCallback((job: EmployerJob) => {
    const tempId = job.id || uid()
    const withId = { ...job, id: tempId }
    setState(s => ({ ...s, jobs: [withId, ...s.jobs] }))
    db(async (me, companyId) => {
      if (!companyId) return
      const { data } = await supabase.from("jobs").insert({
        company_id: companyId, posted_by: me,
        title: job.title, department: job.department, location: job.location,
        workplace: workplaceToDb[job.workplace] ?? "remote",
        type: job.type, level: job.level, status: job.status,
        comp_min: job.salaryMin ?? null, comp_max: job.salaryMax ?? null,
        currency: job.currency || "INR",
        description: job.description, responsibilities: job.responsibilities,
        requirements: job.qualifications, skills: job.skills,
        screening: job.screening, education: job.education,
      }).select("id").single()
      if (data?.id)
        setState(s => ({ ...s, jobs: s.jobs.map(j => (j.id === tempId ? { ...j, id: data.id } : j)) }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const updateJob = useCallback((id: string, patch: Partial<EmployerJob>) => {
    setState(s => ({ ...s, jobs: s.jobs.map(j => (j.id === id ? { ...j, ...patch } : j)) }))
    const cols: Record<string, unknown> = {}
    if (patch.title !== undefined) cols.title = patch.title
    if (patch.status !== undefined) cols.status = patch.status
    if (patch.location !== undefined) cols.location = patch.location
    if (patch.workplace !== undefined) cols.workplace = workplaceToDb[patch.workplace]
    if (patch.type !== undefined) cols.type = patch.type
    if (patch.level !== undefined) cols.level = patch.level
    if (patch.salaryMin !== undefined) cols.comp_min = patch.salaryMin
    if (patch.salaryMax !== undefined) cols.comp_max = patch.salaryMax
    if (patch.description !== undefined) cols.description = patch.description
    if (patch.department !== undefined) cols.department = patch.department
    if (Object.keys(cols).length)
      db(() => supabase.from("jobs").update(cols).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const COMPANY_COLS: Partial<Record<keyof CompanyProfile, string>> = {
    name: "name", industry: "industry", size: "size", website: "website",
    about: "about", founded: "founded", headquarters: "hq", funding: "funding",
    revenue: "revenue", linkedin: "linkedin", twitter: "twitter", plan: "plan",
    techStack: "tech_stack", benefits: "benefits", values: "values", locations: "locations",
  }

  const updateCompany = useCallback((patch: Partial<CompanyProfile>) => {
    setState(s => ({ ...s, company: { ...s.company, ...patch } }))
    const cols: Record<string, unknown> = {}
    for (const [k, col] of Object.entries(COMPANY_COLS))
      if (patch[k as keyof CompanyProfile] !== undefined) cols[col] = patch[k as keyof CompanyProfile]
    if (Object.keys(cols).length)
      db((_me, companyId) => companyId
        ? supabase.from("companies").update(cols).eq("id", companyId)
        : Promise.resolve())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const setCandidateStatus = useCallback((id: string, status: CandidateStatus) => {
    setState(s => ({
      ...s,
      candidates: s.candidates.map(c => (c.id === id ? { ...c, status } : c)),
    }))
    db(() => supabase.from("applications").update({ candidate_stage: status }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const addCandidateNote = useCallback((id: string, text: string) => {
    const note: CandidateNote = { id: uid(), text, ago: "just now" }
    setState(s => ({
      ...s,
      candidates: s.candidates.map(c =>
        c.id === id ? { ...c, notes: [note, ...c.notes] } : c
      ),
    }))
    db(me => supabase.from("application_notes").insert({ application_id: id, author_id: me, body: text }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const assignCandidate = useCallback((id: string, memberId: string | undefined) => {
    setState(s => ({
      ...s,
      candidates: s.candidates.map(c =>
        c.id === id ? { ...c, assignedTo: memberId } : c
      ),
    }))
    db(() => supabase.from("applications").update({ assigned_to: memberId ?? null }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const updateSettings = useCallback((patch: Partial<EmployerSettings>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }))
    db((_me, companyId) => companyId
      ? supabase.from("companies").update({ settings: { ...state.settings, ...patch } }).eq("id", companyId)
      : Promise.resolve())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.settings])

  const markAllRead = useCallback(() => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => ({ ...n, read: true })),
    }))
    db(me => supabase.from("notifications").update({ read: true }).eq("user_id", me).eq("read", false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const markRead = useCallback((id: string) => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
    }))
    db(() => supabase.from("notifications").update({ read: true }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const msg: ChatMessage = { id: uid(), from: "us", text, ago: "just now" }
    setState(s => ({
      ...s,
      conversations: s.conversations.map(c =>
        c.id === conversationId
          ? { ...c, preview: text, ago: "just now", messages: [...c.messages, msg] }
          : c
      ),
    }))
    db(me => supabase.from("messages").insert({ conversation_id: conversationId, sender_id: me, body: text }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const markConversationRead = useCallback((conversationId: string) => {
    setState(s => ({
      ...s,
      conversations: s.conversations.map(c =>
        c.id === conversationId ? { ...c, unread: 0 } : c
      ),
    }))
    db(me => supabase.from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId).eq("user_id", me))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const addTeamMember = useCallback((m: TeamMember) => {
    const withId = { ...m, id: m.id || uid() }
    setState(s => ({ ...s, team: [...s.team, withId] }))
    // Invited teammates have no auth user yet → track in company_invites
    // (company_members.user_id FK needs a real profile).
    if (m.pending) {
      db((me, companyId) => companyId
        ? supabase.from("company_invites").insert({
            company_id: companyId, invited_by: me,
            email: m.email, role: m.role, title: m.role, phone: m.phone,
          })
        : Promise.resolve())
    } else {
      db((_me, companyId) => companyId
        ? supabase.from("company_members").insert({
            company_id: companyId, user_id: withId.id,
            member_role: "recruiter", status: "active",
            title: m.role, email: m.email, phone: m.phone,
          })
        : Promise.resolve())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const removeTeamMember = useCallback((id: string) => {
    const member = state.team.find(t => t.id === id)
    setState(s => ({ ...s, team: s.team.filter(t => t.id !== id) }))
    db((_me, companyId) => {
      if (!companyId) return Promise.resolve()
      return member?.pending
        ? supabase.from("company_invites").delete().eq("company_id", companyId).eq("id", id)
        : supabase.from("company_members").delete().eq("company_id", companyId).eq("user_id", id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.team])

  const setStepDone = useCallback((id: string, done: boolean) => {
    setState(s => {
      const onboarding = s.onboarding.map(o => (o.id === id ? { ...o, done } : o))
      db(me => supabase.from("user_settings").upsert(
        { user_id: me, data: { onboarding } },
        { onConflict: "user_id" }
      ))
      return { ...s, onboarding }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const inviteCandidate = useCallback((candidateId: string) => {
    setState(s => ({
      ...s,
      invited: s.invited.includes(candidateId) ? s.invited : [...s.invited, candidateId],
    }))
  }, [])

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    remoteRef.current = false
    companyIdRef.current = null
    setState(seedState())
  }, [])

  const value = useMemo<EmployerContextValue>(
    () => ({
      state, loading, remote: remoteRef.current,
      addJob, updateJob, updateCompany,
      setCandidateStatus, addCandidateNote, assignCandidate,
      updateSettings, markAllRead, markRead,
      sendMessage, markConversationRead,
      addTeamMember, removeTeamMember, setStepDone, inviteCandidate, resetDemo,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, loading]
  )

  return <EmployerContext.Provider value={value}>{children}</EmployerContext.Provider>
}

export function useEmployer() {
  const ctx = useContext(EmployerContext)
  if (!ctx) throw new Error("useEmployer must be used inside <EmployerProvider>")
  return ctx
}

```

## FILE: src/lib/mentor-types.ts

```typescript
// ── Mentor domain types ─────────────────────────────────────────────────────

export interface MentorPlan {
  id: string
  name: string
  price: number // ₹/mo
  blurb: string
  features: string[]
  published: boolean
  menteeCount: number
  paused?: boolean
}

export interface Mentee {
  id: string
  name: string
  initials: string
  role: string
  plan: string // plan name
  since: string
  renews: string
  avatarColor?: string
}

export interface MentorSession {
  id: string
  title: string
  menteeId: string
  date: string // e.g. "2026-03-28"
  time: string // e.g. "10:00 AM"
  status: "upcoming" | "past"
  notes?: string
}

export interface MentorReview {
  id: string
  author: string
  initials: string
  role: string
  ago: string
  rating: number
  text: string
  reply?: string
}

export interface MentorResource {
  id: string
  title: string
  kind: "video" | "pdf" | "template" | "link"
  meta: string // duration or size
  category: string
  views: number
  downloads: number
}

export interface MentorPayout {
  id: string
  label: string
  date: string
  amount: number // ₹
  status: "paid" | "pending"
}

export interface AvailabilityState {
  /** map of day → array of hour slots e.g. { Mon: ["09:00","10:00"] } */
  weekly: Record<string, string[]>
  sessionLength: number
  buffer: number
  blockedDates: string[]
}

export interface MentorProfile {
  name: string
  initials: string
  email: string
  headline: string
  bio: string
  expertise: string[]
  company: string
  hourlyRate: number
  languages: string[]
  timezone: string
  linkedin: string
  website: string
}

export interface MentorSettings {
  acceptMentees: boolean
  profileVisibility: boolean
  calendarConnected: string // url or ""
  twoFactor: boolean
  notifications: {
    messages: boolean
    sessionReminders: boolean
    productUpdates: boolean
    payoutAlerts: boolean
  }
}

export interface MentorChecklistStep {
  id: string
  title: string
  done: boolean
}

```

## FILE: src/lib/mentor-store.tsx

```typescript
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import * as seed from "./mentor-data"
import { supabase } from "./supabase/client"
import { loadMentorState } from "./supabase/data"
import { useAuth } from "./auth"
import type { AppNotification, ChatMessage, Conversation } from "./employer-types"
import type {
  AvailabilityState,
  Mentee,
  MentorChecklistStep,
  MentorPayout,
  MentorPlan,
  MentorProfile,
  MentorResource,
  MentorReview,
  MentorSession,
  MentorSettings,
} from "./mentor-types"

/* ----------------------------------------------------------------
   Mentor store — Supabase-backed when signed in; seed + localStorage
   for guests so the open demo routes still work.
   ---------------------------------------------------------------- */

const STORAGE_KEY = "fillitup-mentor-v1"

export interface MentorState {
  profile: MentorProfile
  plans: MentorPlan[]
  mentees: Mentee[]
  sessions: MentorSession[]
  reviews: MentorReview[]
  resources: MentorResource[]
  payouts: MentorPayout[]
  availability: AvailabilityState
  settings: MentorSettings
  checklist: MentorChecklistStep[]
  notifications: AppNotification[]
  conversations: Conversation[]
}

function seedState(): MentorState {
  return {
    profile: seed.mentorProfile,
    plans: seed.mentorPlans,
    mentees: seed.mentees,
    sessions: seed.mentorSessions,
    reviews: seed.mentorReviews,
    resources: seed.mentorResources,
    payouts: seed.mentorPayouts,
    availability: seed.mentorAvailability,
    settings: seed.mentorSettings,
    checklist: seed.mentorChecklist,
    notifications: seed.mentorNotifications,
    conversations: seed.mentorConversations,
  }
}

function load(): MentorState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...seedState(), ...JSON.parse(raw) }
  } catch {
    /* corrupted storage — reseed */
  }
  return seedState()
}

interface MentorContextValue {
  state: MentorState
  loading: boolean
  remote: boolean
  updateProfile: (patch: Partial<MentorProfile>) => void
  addPlan: (p: Omit<MentorPlan, "id" | "menteeCount">) => void
  updatePlan: (id: string, patch: Partial<MentorPlan>) => void
  togglePlanPaused: (id: string) => void
  removeMentee: (id: string) => void
  addSession: (s: Omit<MentorSession, "id">) => void
  rescheduleSession: (id: string, date: string, time: string) => void
  cancelSession: (id: string) => void
  replyReview: (id: string, reply: string) => void
  addResource: (r: Omit<MentorResource, "id" | "views" | "downloads">) => void
  removeResource: (id: string) => void
  toggleSlot: (day: string, slot: string) => void
  setAvailability: (patch: Partial<AvailabilityState>) => void
  addBlockedDate: (d: string) => void
  removeBlockedDate: (d: string) => void
  updateSettings: (patch: Partial<MentorSettings>) => void
  markAllRead: () => void
  markRead: (id: string) => void
  sendMessage: (conversationId: string, text: string) => void
  markConversationRead: (conversationId: string) => void
  setStepDone: (id: string, done: boolean) => void
  resetDemo: () => void
}

const MentorContext = createContext<MentorContextValue | null>(null)
const uid = () => crypto.randomUUID()

function toScheduled(date: string, time: string): string {
  const d = new Date(`${date} ${time}`)
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

export function MentorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<MentorState>(load)
  const [loading, setLoading] = useState(false)
  const remoteRef = useRef(false)
  const uidRef = useRef<string | null>(null)
  uidRef.current = user?.id ?? null

  /* hydrate from Supabase when signed in */
  useEffect(() => {
    if (!user) {
      remoteRef.current = false
      return
    }
    let alive = true
    setLoading(true)
    loadMentorState(user.id, user.email)
      .then(s => {
        if (!alive) return
        remoteRef.current = true
        setState(prev => ({
          ...prev,
          ...s,
          settings: { ...prev.settings, ...(s.settings ?? {}) },
          checklist: s.checklist?.length ? s.checklist : prev.checklist,
        } as MentorState))
      })
      .catch(err => console.error("mentor load failed", err))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [user])

  /* guest-mode persistence */
  useEffect(() => {
    if (remoteRef.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* non-fatal */ }
  }, [state])

  /* FK anchor — mentor tables reference mentor_profiles(user_id), which
     only exists after the first profile save. Ensure it before writes. */
  const mentorReady = useCallback(async (id: string) => {
    await supabase
      .from("mentor_profiles")
      .upsert({ user_id: id }, { onConflict: "user_id" })
  }, [])

  const db = useCallback(
    (fn: (uid: string) => PromiseLike<unknown>) => {
      const id = uidRef.current
      if (id && remoteRef.current)
        void (async () => {
          await mentorReady(id)
          await fn(id)
        })().catch((e: unknown) => console.error("db write failed", e))
    },
    [mentorReady]
  )

  const PROFILE_COLS: Partial<Record<keyof MentorProfile, string>> = {
    headline: "headline", bio: "bio", expertise: "expertise", company: "company",
    hourlyRate: "hourly_rate", languages: "languages", timezone: "timezone",
    linkedin: "linkedin", website: "website",
  }

  const updateProfile = useCallback((patch: Partial<MentorProfile>) => {
    setState(s => ({ ...s, profile: { ...s.profile, ...patch } }))
    db(async id => {
      if (patch.name) await supabase.from("profiles").update({ full_name: patch.name }).eq("id", id)
      const cols: Record<string, unknown> = {}
      for (const [k, col] of Object.entries(PROFILE_COLS))
        if (patch[k as keyof MentorProfile] !== undefined) cols[col] = patch[k as keyof MentorProfile]
      if (Object.keys(cols).length)
        await supabase.from("mentor_profiles").upsert({ user_id: id, ...cols })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const addPlan = useCallback((p: Omit<MentorPlan, "id" | "menteeCount">) => {
    const tempId = uid()
    setState(s => ({ ...s, plans: [...s.plans, { ...p, id: tempId, menteeCount: 0 }] }))
    db(async me => {
      const { data } = await supabase.from("mentor_plans").insert({
        mentor_id: me, name: p.name, price: p.price, blurb: p.blurb,
        features: p.features, published: p.published,
      }).select("id").single()
      if (data?.id)
        setState(s => ({ ...s, plans: s.plans.map(x => (x.id === tempId ? { ...x, id: data.id } : x)) }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const updatePlan = useCallback((id: string, patch: Partial<MentorPlan>) => {
    setState(s => ({ ...s, plans: s.plans.map(p => (p.id === id ? { ...p, ...patch } : p)) }))
    const cols: Record<string, unknown> = {}
    for (const [k, col] of Object.entries({ name: "name", price: "price", blurb: "blurb", features: "features", published: "published", paused: "paused" }))
      if ((patch as Record<string, unknown>)[k] !== undefined) cols[col] = (patch as Record<string, unknown>)[k]
    if (Object.keys(cols).length)
      db(() => supabase.from("mentor_plans").update(cols).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const togglePlanPaused = useCallback((id: string) => {
    const plan = state.plans.find(p => p.id === id)
    setState(s => ({
      ...s,
      plans: s.plans.map(p => (p.id === id ? { ...p, paused: !p.paused } : p)),
    }))
    if (plan) db(() => supabase.from("mentor_plans").update({ paused: !plan.paused }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.plans])

  const removeMentee = useCallback((id: string) => {
    setState(s => ({ ...s, mentees: s.mentees.filter(m => m.id !== id) }))
    db(me => supabase.from("mentor_subscriptions")
      .update({ status: "canceled" })
      .eq("mentor_id", me).eq("mentee_id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const addSession = useCallback((sess: Omit<MentorSession, "id">) => {
    const tempId = uid()
    setState(s => ({ ...s, sessions: [{ ...sess, id: tempId }, ...s.sessions] }))
    db(async me => {
      const { data } = await supabase.from("mentor_sessions").insert({
        mentor_id: me, mentee_id: sess.menteeId, title: sess.title,
        scheduled_at: toScheduled(sess.date, sess.time),
        status: sess.status === "upcoming" ? "scheduled" : "completed",
      }).select("id").single()
      if (data?.id)
        setState(s => ({ ...s, sessions: s.sessions.map(x => (x.id === tempId ? { ...x, id: data.id } : x)) }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const rescheduleSession = useCallback((id: string, date: string, time: string) => {
    setState(s => ({
      ...s,
      sessions: s.sessions.map(x => (x.id === id ? { ...x, date, time } : x)),
    }))
    db(() => supabase.from("mentor_sessions")
      .update({ scheduled_at: toScheduled(date, time) }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const cancelSession = useCallback((id: string) => {
    setState(s => ({ ...s, sessions: s.sessions.filter(x => x.id !== id) }))
    db(() => supabase.from("mentor_sessions").update({ status: "canceled" }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const replyReview = useCallback((id: string, reply: string) => {
    setState(s => ({
      ...s,
      reviews: s.reviews.map(r => (r.id === id ? { ...r, reply } : r)),
    }))
    db(() => supabase.from("mentor_reviews").update({ reply }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const addResource = useCallback((r: Omit<MentorResource, "id" | "views" | "downloads">) => {
    const tempId = uid()
    setState(s => ({
      ...s,
      resources: [{ ...r, id: tempId, views: 0, downloads: 0 }, ...s.resources],
    }))
    db(async me => {
      const { data } = await supabase.from("mentor_resources").insert({
        mentor_id: me, title: r.title, kind: r.kind, category: r.category, meta: r.meta,
      }).select("id").single()
      if (data?.id)
        setState(s => ({ ...s, resources: s.resources.map(x => (x.id === tempId ? { ...x, id: data.id } : x)) }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const removeResource = useCallback((id: string) => {
    setState(s => ({ ...s, resources: s.resources.filter(r => r.id !== id) }))
    db(() => supabase.from("mentor_resources").delete().eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const toggleSlot = useCallback((day: string, slot: string) => {
    setState(s => {
      const cur = s.availability.weekly[day] ?? []
      const next = cur.includes(slot) ? cur.filter(x => x !== slot) : [...cur, slot].sort()
      const weekly = { ...s.availability.weekly, [day]: next }
      db(me => supabase.from("mentor_availability").upsert({ mentor_id: me, weekly }))
      return { ...s, availability: { ...s.availability, weekly } }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const setAvailability = useCallback((patch: Partial<AvailabilityState>) => {
    setState(s => ({ ...s, availability: { ...s.availability, ...patch } }))
    const cols: Record<string, unknown> = {}
    if (patch.sessionLength !== undefined) cols.session_length = patch.sessionLength
    if (patch.buffer !== undefined) cols.buffer_minutes = patch.buffer
    if (patch.weekly !== undefined) cols.weekly = patch.weekly
    if (Object.keys(cols).length)
      db(me => supabase.from("mentor_availability").upsert({ mentor_id: me, ...cols }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const addBlockedDate = useCallback((d: string) => {
    setState(s => ({
      ...s,
      availability: {
        ...s.availability,
        blockedDates: s.availability.blockedDates.includes(d)
          ? s.availability.blockedDates
          : [...s.availability.blockedDates, d],
      },
    }))
    db(me => supabase.from("mentor_blocked_dates").insert({ mentor_id: me, day: d }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const removeBlockedDate = useCallback((d: string) => {
    setState(s => ({
      ...s,
      availability: {
        ...s.availability,
        blockedDates: s.availability.blockedDates.filter(x => x !== d),
      },
    }))
    db(me => supabase.from("mentor_blocked_dates").delete().eq("mentor_id", me).eq("day", d))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const updateSettings = useCallback((patch: Partial<MentorSettings>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }))
    db(me => supabase.from("user_settings").upsert(
      { user_id: me, data: { ...state.settings, ...patch } },
      { onConflict: "user_id" }
    ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, state.settings])

  const markAllRead = useCallback(() => {
    setState(s => ({ ...s, notifications: s.notifications.map(n => ({ ...n, read: true })) }))
    db(me => supabase.from("notifications").update({ read: true }).eq("user_id", me).eq("read", false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const markRead = useCallback((id: string) => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
    }))
    db(() => supabase.from("notifications").update({ read: true }).eq("id", id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const msg: ChatMessage = { id: uid(), from: "us", text, ago: "just now" }
    setState(s => ({
      ...s,
      conversations: s.conversations.map(c =>
        c.id === conversationId
          ? { ...c, preview: text, ago: "just now", messages: [...c.messages, msg] }
          : c
      ),
    }))
    db(me => supabase.from("messages").insert({ conversation_id: conversationId, sender_id: me, body: text }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const markConversationRead = useCallback((conversationId: string) => {
    setState(s => ({
      ...s,
      conversations: s.conversations.map(c =>
        c.id === conversationId ? { ...c, unread: 0 } : c
      ),
    }))
    db(me => supabase.from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId).eq("user_id", me))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const setStepDone = useCallback((id: string, done: boolean) => {
    setState(s => {
      const checklist = s.checklist.map(c => (c.id === id ? { ...c, done } : c))
      db(me => supabase.from("mentor_profiles").upsert({ user_id: me, checklist }))
      return { ...s, checklist }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    remoteRef.current = false
    setState(seedState())
  }, [])

  const value = useMemo<MentorContextValue>(
    () => ({
      state, loading, remote: remoteRef.current,
      updateProfile, addPlan, updatePlan, togglePlanPaused, removeMentee,
      addSession, rescheduleSession, cancelSession,
      replyReview, addResource, removeResource,
      toggleSlot, setAvailability, addBlockedDate, removeBlockedDate,
      updateSettings, markAllRead, markRead,
      sendMessage, markConversationRead, setStepDone, resetDemo,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, loading]
  )

  return <MentorContext.Provider value={value}>{children}</MentorContext.Provider>
}

export function useMentor() {
  const ctx = useContext(MentorContext)
  if (!ctx) throw new Error("useMentor must be used inside <MentorProvider>")
  return ctx
}

```

## FILE: api/keepalive.ts

```typescript
// Daily keep-alive: one trivial DB read so the free-tier Supabase
// project never hits its 7-day inactivity auto-pause.
export default async function handler(_req: any, res: any) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    res.status(500).json({ ok: false, error: "Supabase env not configured" });
    return;
  }

  const r = await fetch(`${url}/rest/v1/jobs?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });

  res.status(r.ok ? 200 : 502).json({ ok: r.ok, status: r.status });
}

```

## FILE: supabase/config.toml

```toml
project_id = "qebcicrykxlrfcqtqqbk"

[auth]
site_url = "https://fillitup.vercel.app"
additional_redirect_urls = [
  "http://localhost:5173/**",
  "https://fillitup.vercel.app/**",
  "https://*.vercel.app/**",
]
jwt_expiry = 3600
enable_signup = true

[auth.email]
enable_signup = true
enable_confirmations = false

[auth.external.google]
enabled = true
client_id = "env(GOOGLE_CLIENT_ID)"
secret = "env(GOOGLE_CLIENT_SECRET)"
skip_nonce_check = true

[functions.ai]
verify_jwt = true

[functions.razorpay-order]
verify_jwt = true

[functions.razorpay-webhook]
verify_jwt = false   # Razorpay calls it — verified by x-razorpay-signature instead

[functions.send-email]
verify_jwt = false   # internal calls check the service-role key manually

```

## FILE: supabase/migrations/0001_init.sql

```sql
-- ============================================================================
-- Fill-it-up — initial schema
-- Roles: seeker | employer | mentor
-- Every table has RLS enabled; writes to payment/ledger tables are service-only.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================================
-- CORE
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'seeker' check (role in ('seeker','employer','mentor')),
  full_name text not null default '',
  avatar_url text,
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- auto-create profile on signup (role/name come from signup metadata)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'seeker'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- flexible per-user settings blob (seeker prefs, mentor notifs, etc.)
create table public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger trg_user_settings_updated before update on public.user_settings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- SEEKER
-- ============================================================================

create table public.seeker_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  title text default '',
  location text default '',
  availability text default '',
  about text default '',
  linkedin text default '',
  github text default '',
  portfolio text default '',
  skills text[] not null default '{}',
  readiness int not null default 0,
  credits int not null default 0,
  referral_code text unique default encode(gen_random_bytes(5), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_seeker_profiles_updated before update on public.seeker_profiles
  for each row execute function public.set_updated_at();

create table public.seeker_experience (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references public.seeker_profiles(user_id) on delete cascade,
  role text not null,
  company text not null,
  period text not null default '',
  description text not null default '',
  sort_order int not null default 0
);
create table public.seeker_education (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references public.seeker_profiles(user_id) on delete cascade,
  degree text not null,
  school text not null,
  period text not null default '',
  sort_order int not null default 0
);
create table public.seeker_projects (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references public.seeker_profiles(user_id) on delete cascade,
  name text not null,
  description text not null default '',
  link text,
  sort_order int not null default 0
);
create table public.seeker_certifications (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references public.seeker_profiles(user_id) on delete cascade,
  name text not null,
  issuer text not null default '',
  year text not null default '',
  sort_order int not null default 0
);

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references public.seeker_profiles(user_id) on delete cascade,
  name text not null,
  file_path text,                 -- storage object path in 'resumes' bucket
  is_primary boolean not null default false,
  parsed jsonb,                   -- AI-parsed structure
  score int,                      -- AI resume score
  created_at timestamptz not null default now()
);

create table public.skill_assessments (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references public.seeker_profiles(user_id) on delete cascade,
  skill text not null,
  score int,
  status text not null default 'pending' check (status in ('pending','passed','failed')),
  taken_at timestamptz not null default now()
);

create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references public.seeker_profiles(user_id) on delete cascade,
  kind text not null,             -- behavioral | technical | quick
  score int,
  detail jsonb,                   -- questions, answers, per-question feedback
  taken_at timestamptz not null default now()
);

-- ============================================================================
-- EMPLOYER
-- ============================================================================

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  tagline text default '',
  about text default '',
  industry text default '',
  size text default '',
  website text default '',
  logo_url text,
  hq text default '',
  locations jsonb not null default '[]',
  tech_stack text[] not null default '{}',
  benefits jsonb not null default '[]',
  values text[] not null default '{}',
  settings jsonb not null default '{}'::jsonb,   -- plan, blindHiring, integrations, sections
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_companies_updated before update on public.companies
  for each row execute function public.set_updated_at();

create table public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default 'recruiter' check (member_role in ('admin','recruiter','interviewer')),
  status text not null default 'active' check (status in ('invited','active')),
  title text default '',
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table public.company_activity (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  text text not null,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  posted_by uuid references public.profiles(id),
  title text not null,
  description text not null default '',
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  location text not null default '',
  workplace text not null default 'remote' check (workplace in ('remote','hybrid','onsite')),
  type text not null default 'full-time',
  comp_min int, comp_max int,
  currency text not null default 'INR',
  skills text[] not null default '{}',
  perks text[] not null default '{}',
  openings int not null default 1,
  status text not null default 'draft' check (status in ('draft','active','paused','closed')),
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index jobs_company_idx on public.jobs(company_id);
create index jobs_status_idx on public.jobs(status);
create trigger trg_jobs_updated before update on public.jobs
  for each row execute function public.set_updated_at();

create table public.saved_jobs (
  seeker_id uuid not null references public.seeker_profiles(user_id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (seeker_id, job_id)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  seeker_id uuid not null references public.seeker_profiles(user_id) on delete cascade,
  resume_id uuid references public.resumes(id),
  stage text not null default 'applied'
    check (stage in ('saved','applied','screening','interview','offer','rejected')),
  cover_letter text,
  answers jsonb,
  assigned_to uuid references public.profiles(id),   -- recruiter on employer side
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, seeker_id)
);
create index applications_job_idx on public.applications(job_id);
create index applications_seeker_idx on public.applications(seeker_id);
create trigger trg_applications_updated before update on public.applications
  for each row execute function public.set_updated_at();

create table public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  stage text not null,
  note text,
  actor_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- MENTOR
-- ============================================================================

create table public.mentor_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  headline text not null default '',
  bio text not null default '',
  expertise text[] not null default '{}',
  company text default '',
  hourly_rate int not null default 0,          -- ₹/hour
  languages text[] not null default '{}',
  timezone text default '',
  linkedin text default '',
  website text default '',
  accepting boolean not null default true,
  visible boolean not null default true,
  calendar_url text default '',
  payout_upi text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_mentor_profiles_updated before update on public.mentor_profiles
  for each row execute function public.set_updated_at();

create table public.mentor_availability (
  mentor_id uuid primary key references public.mentor_profiles(user_id) on delete cascade,
  weekly jsonb not null default '{}'::jsonb,   -- { "Mon": ["09:00", ...] }
  session_length int not null default 30,
  buffer_minutes int not null default 10,
  updated_at timestamptz not null default now()
);
create trigger trg_mentor_availability_updated before update on public.mentor_availability
  for each row execute function public.set_updated_at();

create table public.mentor_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentor_profiles(user_id) on delete cascade,
  day date not null,
  unique (mentor_id, day)
);

create table public.mentor_plans (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentor_profiles(user_id) on delete cascade,
  name text not null,
  price int not null,                        -- ₹/month
  blurb text default '',
  features text[] not null default '{}',
  published boolean not null default true,
  paused boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.mentor_subscriptions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.mentor_plans(id),
  mentor_id uuid not null references public.mentor_profiles(user_id),
  mentee_id uuid not null references public.seeker_profiles(user_id),
  status text not null default 'active' check (status in ('active','paused','canceled')),
  razorpay_payment_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);
create index mentor_subs_mentor_idx on public.mentor_subscriptions(mentor_id);
create index mentor_subs_mentee_idx on public.mentor_subscriptions(mentee_id);

create table public.mentor_sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentor_profiles(user_id) on delete cascade,
  mentee_id uuid not null references public.seeker_profiles(user_id),
  title text not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','completed','canceled')),
  meeting_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.mentor_reviews (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentor_profiles(user_id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  rating int not null check (rating between 1 and 5),
  body text not null default '',
  reply text,
  created_at timestamptz not null default now()
);

create table public.mentor_resources (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentor_profiles(user_id) on delete cascade,
  title text not null,
  kind text not null default 'link' check (kind in ('video','pdf','template','link')),
  category text not null default 'General',
  meta text default '',
  file_path text,
  url text,
  views int not null default 0,
  downloads int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- MESSAGING / NOTIFICATIONS / COMMUNITY
-- ============================================================================

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  subject text default '',
  created_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz not null default 'epoch',
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);
create index messages_conv_idx on public.messages(conversation_id, created_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, read);

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  tag text default 'General',
  body text not null,
  created_at timestamptz not null default now()
);
create table public.community_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);
create table public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- BILLING / AI / PLATFORM
-- ============================================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  amount int not null,                        -- paise
  currency text not null default 'INR',
  purpose text not null check (purpose in ('mentor_subscription','credits','plan')),
  reference_id uuid,                          -- plan_id or pack id
  status text not null default 'created' check (status in ('created','paid','failed','refunded')),
  created_at timestamptz not null default now()
);

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  delta int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  label text not null,
  amount int not null,
  status text not null default 'paid',
  created_at timestamptz not null default now()
);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentor_profiles(user_id),
  subscription_id uuid references public.mentor_subscriptions(id),
  label text not null,
  amount int not null,                        -- net to mentor (₹)
  commission int not null default 0,          -- platform cut (₹)
  status text not null default 'pending' check (status in ('pending','paid')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id),
  code text not null,
  referred_email text,
  status text not null default 'pending' check (status in ('pending','converted','paid')),
  reward int not null default 0,
  created_at timestamptz not null default now()
);

-- AI match scores between a seeker and a job (employer pipeline + For You)
create table public.match_scores (
  seeker_id uuid not null references public.seeker_profiles(user_id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  score int not null,
  breakdown jsonb,
  computed_at timestamptz not null default now(),
  primary key (seeker_id, job_id)
);

-- generic cache for Gemini outputs (resume analysis, salary oracle, career path…)
create table public.ai_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  kind text not null,
  input jsonb,
  output jsonb not null,
  created_at timestamptz not null default now()
);
create index ai_results_user_kind_idx on public.ai_results(user_id, kind);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.seeker_profiles enable row level security;
alter table public.seeker_experience enable row level security;
alter table public.seeker_education enable row level security;
alter table public.seeker_projects enable row level security;
alter table public.seeker_certifications enable row level security;
alter table public.resumes enable row level security;
alter table public.skill_assessments enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.company_activity enable row level security;
alter table public.jobs enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.applications enable row level security;
alter table public.application_events enable row level security;
alter table public.application_notes enable row level security;
alter table public.mentor_profiles enable row level security;
alter table public.mentor_availability enable row level security;
alter table public.mentor_blocked_dates enable row level security;
alter table public.mentor_plans enable row level security;
alter table public.mentor_subscriptions enable row level security;
alter table public.mentor_sessions enable row level security;
alter table public.mentor_reviews enable row level security;
alter table public.mentor_resources enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_likes enable row level security;
alter table public.community_comments enable row level security;
alter table public.orders enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.invoices enable row level security;
alter table public.payouts enable row level security;
alter table public.referrals enable row level security;
alter table public.match_scores enable row level security;
alter table public.ai_results enable row level security;

-- ---- profiles ----
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: read others (dir)" on public.profiles
  for select to authenticated using (true);        -- needed for names/avatars in messaging
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

create policy "settings: own only" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- seeker ----
-- seeker manages own; employers see seekers who applied to their jobs
create policy "seeker_profiles: owner" on public.seeker_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "seeker_profiles: employer read applicants" on public.seeker_profiles
  for select to authenticated using (
    exists (
      select 1 from public.applications a
      join public.jobs j on j.id = a.job_id
      join public.company_members cm on cm.company_id = j.company_id
      where a.seeker_id = seeker_profiles.user_id
        and cm.user_id = auth.uid()
    )
  );

-- experience/education/projects/certs inherit seeker visibility
do $$
declare t text;
begin
  foreach t in array array['seeker_experience','seeker_education','seeker_projects','seeker_certifications'] loop
    execute format($p$
      create policy %I on public.%I
        for all using (auth.uid() = seeker_id) with check (auth.uid() = seeker_id)
    $p$, t||': owner', t);
    execute format($p$
      create policy %I on public.%I
        for select to authenticated using (
          exists (
            select 1 from public.applications a
            join public.jobs j on j.id = a.job_id
            join public.company_members cm on cm.company_id = j.company_id
            where a.seeker_id = %I.seeker_id and cm.user_id = auth.uid()
          )
        )
    $p$, t||': employer read applicants', t, t);
  end loop;
end $$;

create policy "resumes: owner" on public.resumes
  for all using (auth.uid() = seeker_id) with check (auth.uid() = seeker_id);
create policy "resumes: employer read applicants" on public.resumes
  for select to authenticated using (
    exists (
      select 1 from public.applications a
      join public.jobs j on j.id = a.job_id
      join public.company_members cm on cm.company_id = j.company_id
      where a.seeker_id = resumes.seeker_id and cm.user_id = auth.uid()
    )
  );

create policy "skill_assessments: owner" on public.skill_assessments
  for all using (auth.uid() = seeker_id) with check (auth.uid() = seeker_id);
create policy "interview_sessions: owner" on public.interview_sessions
  for all using (auth.uid() = seeker_id) with check (auth.uid() = seeker_id);

-- ---- employer ----
create policy "companies: public read" on public.companies
  for select using (true);
create policy "companies: member update" on public.companies
  for update using (exists (
    select 1 from public.company_members cm
    where cm.company_id = companies.id and cm.user_id = auth.uid() and cm.member_role = 'admin'
  ));
create policy "companies: authed insert" on public.companies
  for insert to authenticated with check (true);   -- employer onboarding creates one

create policy "company_members: member read" on public.company_members
  for select using (exists (
    select 1 from public.company_members cm
    where cm.company_id = company_members.company_id and cm.user_id = auth.uid()
  ));
create policy "company_members: admin write" on public.company_members
  for all using (exists (
    select 1 from public.company_members cm
    where cm.company_id = company_members.company_id
      and cm.user_id = auth.uid() and cm.member_role = 'admin'
  ));

create policy "company_activity: member read" on public.company_activity
  for select using (exists (
    select 1 from public.company_members cm
    where cm.company_id = company_activity.company_id and cm.user_id = auth.uid()
  ));
create policy "company_activity: member insert" on public.company_activity
  for insert with check (exists (
    select 1 from public.company_members cm
    where cm.company_id = company_activity.company_id and cm.user_id = auth.uid()
  ));

create policy "jobs: public read active" on public.jobs
  for select using (status = 'active');
create policy "jobs: member read all" on public.jobs
  for select to authenticated using (exists (
    select 1 from public.company_members cm
    where cm.company_id = jobs.company_id and cm.user_id = auth.uid()
  ));
create policy "jobs: member write" on public.jobs
  for all to authenticated using (exists (
    select 1 from public.company_members cm
    where cm.company_id = jobs.company_id and cm.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.company_members cm
    where cm.company_id = jobs.company_id and cm.user_id = auth.uid()
  ));

create policy "saved_jobs: owner" on public.saved_jobs
  for all using (auth.uid() = seeker_id) with check (auth.uid() = seeker_id);

create policy "applications: seeker own" on public.applications
  for all using (auth.uid() = seeker_id) with check (auth.uid() = seeker_id);
create policy "applications: employer read" on public.applications
  for select to authenticated using (exists (
    select 1 from public.jobs j
    join public.company_members cm on cm.company_id = j.company_id
    where j.id = applications.job_id and cm.user_id = auth.uid()
  ));
create policy "applications: employer update" on public.applications
  for update to authenticated using (exists (
    select 1 from public.jobs j
    join public.company_members cm on cm.company_id = j.company_id
    where j.id = applications.job_id and cm.user_id = auth.uid()
  ));

create policy "application_events: participants" on public.application_events
  for select to authenticated using (exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    left join public.company_members cm on cm.company_id = j.company_id and cm.user_id = auth.uid()
    where a.id = application_events.application_id
      and (a.seeker_id = auth.uid() or cm.user_id is not null)
  ));
create policy "application_events: employer insert" on public.application_events
  for insert to authenticated with check (exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.company_members cm on cm.company_id = j.company_id and cm.user_id = auth.uid()
    where a.id = application_events.application_id
  ));

create policy "application_notes: employer only" on public.application_notes
  for all to authenticated using (exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.company_members cm on cm.company_id = j.company_id and cm.user_id = auth.uid()
    where a.id = application_notes.application_id
  )) with check (exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.company_members cm on cm.company_id = j.company_id and cm.user_id = auth.uid()
    where a.id = application_notes.application_id
  ));

-- ---- mentor ----
create policy "mentor_profiles: public read visible" on public.mentor_profiles
  for select using (visible = true);
create policy "mentor_profiles: owner" on public.mentor_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "mentor_availability: public read" on public.mentor_availability
  for select using (true);
create policy "mentor_availability: owner" on public.mentor_availability
  for all using (auth.uid() = mentor_id) with check (auth.uid() = mentor_id);

create policy "mentor_blocked_dates: owner" on public.mentor_blocked_dates
  for all using (auth.uid() = mentor_id) with check (auth.uid() = mentor_id);

create policy "mentor_plans: public read published" on public.mentor_plans
  for select using (published = true);
create policy "mentor_plans: owner" on public.mentor_plans
  for all using (auth.uid() = mentor_id) with check (auth.uid() = mentor_id);

create policy "mentor_subs: mentor or mentee" on public.mentor_subscriptions
  for select using (auth.uid() in (mentor_id, mentee_id));
create policy "mentor_subs: mentee insert" on public.mentor_subscriptions
  for insert with check (auth.uid() = mentee_id);
create policy "mentor_subs: mentor update" on public.mentor_subscriptions
  for update using (auth.uid() = mentor_id);

create policy "mentor_sessions: parties" on public.mentor_sessions
  for select using (auth.uid() in (mentor_id, mentee_id));
create policy "mentor_sessions: mentor write" on public.mentor_sessions
  for all using (auth.uid() = mentor_id) with check (auth.uid() = mentor_id);

create policy "mentor_reviews: public read" on public.mentor_reviews
  for select using (true);
create policy "mentor_reviews: author insert" on public.mentor_reviews
  for insert with check (auth.uid() = author_id);
create policy "mentor_reviews: mentor reply" on public.mentor_reviews
  for update using (auth.uid() = mentor_id);

create policy "mentor_resources: public read" on public.mentor_resources
  for select using (true);
create policy "mentor_resources: owner" on public.mentor_resources
  for all using (auth.uid() = mentor_id) with check (auth.uid() = mentor_id);

-- ---- messaging ----
create policy "conversations: participants" on public.conversations
  for select using (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversations.id and cp.user_id = auth.uid()
  ));
create policy "conversations: authed insert" on public.conversations
  for insert to authenticated with check (true);

create policy "conv_participants: members read" on public.conversation_participants
  for select using (user_id = auth.uid() or exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
  ));
create policy "conv_participants: insert self or member" on public.conversation_participants
  for insert to authenticated with check (user_id = auth.uid() or exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
  ));
create policy "conv_participants: update own read marker" on public.conversation_participants
  for update using (user_id = auth.uid());

create policy "messages: participants" on public.messages
  for select using (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
  ));
create policy "messages: participant send" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid() and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
    )
  );

create policy "notifications: own" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- community ----
create policy "community_posts: authed read" on public.community_posts
  for select to authenticated using (true);
create policy "community_posts: author write" on public.community_posts
  for all to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "community_likes: authed" on public.community_likes
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "community_likes: read" on public.community_likes
  for select to authenticated using (true);
create policy "community_comments: authed read" on public.community_comments
  for select to authenticated using (true);
create policy "community_comments: author write" on public.community_comments
  for all to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);

-- ---- billing (read own; writes via service role only) ----
create policy "orders: read own" on public.orders
  for select using (auth.uid() = user_id);
create policy "credit_txns: read own" on public.credit_transactions
  for select using (auth.uid() = user_id);
create policy "invoices: read own" on public.invoices
  for select using (auth.uid() = user_id);
create policy "payouts: mentor read own" on public.payouts
  for select using (auth.uid() = mentor_id);
create policy "referrals: own" on public.referrals
  for all using (auth.uid() = referrer_id) with check (auth.uid() = referrer_id);

-- ---- AI ----
create policy "match_scores: seeker own" on public.match_scores
  for select using (auth.uid() = seeker_id);
create policy "match_scores: employer read" on public.match_scores
  for select to authenticated using (exists (
    select 1 from public.jobs j
    join public.company_members cm on cm.company_id = j.company_id
    where j.id = match_scores.job_id and cm.user_id = auth.uid()
  ));

create policy "ai_results: owner" on public.ai_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- STORAGE
-- ============================================================================

insert into storage.buckets (id, name, public) values
  ('resumes', 'resumes', false),
  ('avatars', 'avatars', true),
  ('logos', 'logos', true),
  ('mentor-resources', 'mentor-resources', true)
on conflict (id) do nothing;

-- resumes: private, owner only (path = <seeker_id>/<file>)
create policy "resumes bucket: owner read" on storage.objects
  for select using (
    bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "resumes bucket: owner write" on storage.objects
  for insert with check (
    bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "resumes bucket: owner update/delete" on storage.objects
  for update using (
    bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- avatars/logos: public read, write under own folder
create policy "avatars: owner write" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "avatars: owner update" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "logos: authed write" on storage.objects
  for insert to authenticated with check (bucket_id = 'logos');
create policy "logos: authed update" on storage.objects
  for update to authenticated using (bucket_id = 'logos');

create policy "mentor-resources: owner write" on storage.objects
  for insert with check (
    bucket_id = 'mentor-resources' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "mentor-resources: owner update" on storage.objects
  for update using (
    bucket_id = 'mentor-resources' and auth.uid()::text = (storage.foldername(name))[1]
  );

```

## FILE: supabase/migrations/0002_stage_values.sql

```sql
-- align application stages with UI vocabulary
alter table public.applications drop constraint applications_stage_check;
alter table public.applications add constraint applications_stage_check
  check (stage in ('saved','in_progress','applied','interview','offer','rejected','archived'));

-- checklist progress lives on the role profile (simple JSONB blob)
alter table public.seeker_profiles add column if not exists checklist jsonb not null default '[]';
alter table public.mentor_profiles add column if not exists checklist jsonb not null default '[]';

-- badges earned via skill verification
alter table public.seeker_profiles add column if not exists badges jsonb not null default '[]';

```

## FILE: supabase/migrations/0003_employer_columns.sql

```sql
-- employer-side extras

-- jobs: fields the post-a-job wizard collects
alter table public.jobs
  add column if not exists department text default '',
  add column if not exists level text default 'Mid',
  add column if not exists screening jsonb not null default '[]',
  add column if not exists education text default 'Any',
  add column if not exists tagline text default '';

-- applications: employer-side pipeline (stage stays seeker-facing)
alter table public.applications
  add column if not exists candidate_stage text not null default 'new'
    check (candidate_stage in ('new','screened','shortlisted','interview','offer','hired','rejected')),
  add column if not exists source text default 'Fill-it-up',
  add column if not exists is_ai_pick boolean not null default false;

-- keep seeker-facing stage in sync when employer moves the candidate
create or replace function public.sync_candidate_stage()
returns trigger language plpgsql as $$
begin
  if new.candidate_stage is distinct from old.candidate_stage then
    new.stage := case new.candidate_stage
      when 'new' then 'applied'
      when 'screened' then 'in_progress'
      when 'shortlisted' then 'in_progress'
      when 'interview' then 'interview'
      when 'offer' then 'offer'
      when 'hired' then 'offer'
      when 'rejected' then 'rejected'
      else new.stage
    end;
  end if;
  return new;
end $$;

create trigger trg_applications_stage_sync
  before update on public.applications
  for each row execute function public.sync_candidate_stage();

-- team member contact details shown on the team page
alter table public.company_members
  add column if not exists email text default '',
  add column if not exists phone text default '';

-- richer company profile fields
alter table public.companies
  add column if not exists linkedin text default '',
  add column if not exists twitter text default '',
  add column if not exists founded text default '',
  add column if not exists funding text default '',
  add column if not exists revenue text default '',
  add column if not exists plan text default 'Growth';

```

## FILE: supabase/migrations/0004_assessment_unique.sql

```sql
-- one assessment row per seeker+skill (upsert target)
create unique index if not exists skill_assessments_seeker_skill_uq
  on public.skill_assessments (seeker_id, skill);

```

## FILE: supabase/migrations/0005_fix_rls_recursion.sql

```sql
-- ============================================================================
-- 0005 — Fix RLS infinite recursion
--
-- Policies on company_members and conversation_participants subquery their
-- own table → 42P17 infinite recursion, which also poisons every policy that
-- joins them (jobs, applications, seeker_profiles, resumes, match_scores…).
-- Fix: SECURITY DEFINER helpers (owned by postgres → bypass RLS) and rewrite
-- all affected policies to use them.
-- ============================================================================

create or replace function public.is_company_member(cid uuid)
returns boolean language sql stable security definer
set search_path = public as $$
  select exists(
    select 1 from public.company_members
    where company_id = cid and user_id = auth.uid()
  )
$$;

create or replace function public.is_company_admin(cid uuid)
returns boolean language sql stable security definer
set search_path = public as $$
  select exists(
    select 1 from public.company_members
    where company_id = cid and user_id = auth.uid() and member_role = 'admin'
  )
$$;

create or replace function public.is_conv_participant(cid uuid)
returns boolean language sql stable security definer
set search_path = public as $$
  select exists(
    select 1 from public.conversation_participants
    where conversation_id = cid and user_id = auth.uid()
  )
$$;

-- ---- company_members itself ----
drop policy if exists "company_members: member read" on public.company_members;
create policy "company_members: member read" on public.company_members
  for select using (user_id = auth.uid() or is_company_member(company_id));

drop policy if exists "company_members: admin write" on public.company_members;
create policy "company_members: admin write" on public.company_members
  for all using (is_company_admin(company_id))
  with check (is_company_admin(company_id));

-- ---- companies ----
drop policy if exists "companies: member update" on public.companies;
create policy "companies: member update" on public.companies
  for update using (is_company_admin(id));

-- ---- company_activity ----
drop policy if exists "company_activity: member read" on public.company_activity;
create policy "company_activity: member read" on public.company_activity
  for select using (is_company_member(company_id));

drop policy if exists "company_activity: member insert" on public.company_activity;
create policy "company_activity: member insert" on public.company_activity
  for insert with check (is_company_member(company_id));

-- ---- jobs ----
drop policy if exists "jobs: member read all" on public.jobs;
create policy "jobs: member read all" on public.jobs
  for select to authenticated using (is_company_member(company_id));

drop policy if exists "jobs: member write" on public.jobs;
create policy "jobs: member write" on public.jobs
  for all to authenticated using (is_company_member(company_id))
  with check (is_company_member(company_id));

-- ---- applications ----
drop policy if exists "applications: employer read" on public.applications;
create policy "applications: employer read" on public.applications
  for select to authenticated using (exists (
    select 1 from public.jobs j
    where j.id = applications.job_id and is_company_member(j.company_id)
  ));

drop policy if exists "applications: employer update" on public.applications;
create policy "applications: employer update" on public.applications
  for update to authenticated using (exists (
    select 1 from public.jobs j
    where j.id = applications.job_id and is_company_member(j.company_id)
  ));

-- ---- application_events ----
drop policy if exists "application_events: participants" on public.application_events;
create policy "application_events: participants" on public.application_events
  for select to authenticated using (exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.id = application_events.application_id
      and (a.seeker_id = auth.uid() or is_company_member(j.company_id))
  ));

drop policy if exists "application_events: employer insert" on public.application_events;
create policy "application_events: employer insert" on public.application_events
  for insert to authenticated with check (exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.id = application_events.application_id
      and is_company_member(j.company_id)
  ));

-- ---- application_notes ----
drop policy if exists "application_notes: employer only" on public.application_notes;
create policy "application_notes: employer only" on public.application_notes
  for all to authenticated using (exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.id = application_notes.application_id
      and is_company_member(j.company_id)
  )) with check (exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.id = application_notes.application_id
      and is_company_member(j.company_id)
  ));

-- ---- seeker-side "employer read applicants" policies ----
drop policy if exists "seeker_profiles: employer read applicants" on public.seeker_profiles;
create policy "seeker_profiles: employer read applicants" on public.seeker_profiles
  for select to authenticated using (exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.seeker_id = seeker_profiles.user_id
      and is_company_member(j.company_id)
  ));

do $$
declare t text;
begin
  foreach t in array array['seeker_experience','seeker_education','seeker_projects','seeker_certifications'] loop
    execute format('drop policy if exists %I on public.%I', t||': employer read applicants', t);
    execute format($p$
      create policy %I on public.%I
        for select to authenticated using (
          exists (
            select 1 from public.applications a
            join public.jobs j on j.id = a.job_id
            where a.seeker_id = %I.seeker_id
              and is_company_member(j.company_id)
          )
        )
    $p$, t||': employer read applicants', t, t);
  end loop;
end $$;

drop policy if exists "resumes: employer read applicants" on public.resumes;
create policy "resumes: employer read applicants" on public.resumes
  for select to authenticated using (exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.seeker_id = resumes.seeker_id
      and is_company_member(j.company_id)
  ));

-- ---- match_scores ----
drop policy if exists "match_scores: employer read" on public.match_scores;
create policy "match_scores: employer read" on public.match_scores
  for select to authenticated using (exists (
    select 1 from public.jobs j
    where j.id = match_scores.job_id
      and is_company_member(j.company_id)
  ));

-- ---- conversations / participants / messages ----
drop policy if exists "conversations: participants" on public.conversations;
create policy "conversations: participants" on public.conversations
  for select using (is_conv_participant(id));

drop policy if exists "conv_participants: members read" on public.conversation_participants;
create policy "conv_participants: members read" on public.conversation_participants
  for select using (user_id = auth.uid() or is_conv_participant(conversation_id));

drop policy if exists "conv_participants: insert self or member" on public.conversation_participants;
create policy "conv_participants: insert self or member" on public.conversation_participants
  for insert to authenticated with check (user_id = auth.uid() or is_conv_participant(conversation_id));

drop policy if exists "messages: participants" on public.messages;
create policy "messages: participants" on public.messages
  for select using (is_conv_participant(conversation_id));

drop policy if exists "messages: participant send" on public.messages;
create policy "messages: participant send" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid() and is_conv_participant(conversation_id)
  );

```

## FILE: supabase/migrations/0006_conversation_creator.sql

```sql
-- 0006 — let the conversation creator read their own row.
-- INSERT ... RETURNING applies the SELECT policy to the new row; a fresh
-- conversation has no participants yet, so is_conv_participant() was false
-- and inserts 42501'd. Track created_by and include it in the select policy.

alter table public.conversations
  add column if not exists created_by uuid not null default auth.uid()
    references public.profiles(id);

drop policy if exists "conversations: participants" on public.conversations;
create policy "conversations: participants" on public.conversations
  for select using (created_by = auth.uid() or is_conv_participant(id));

```

## FILE: supabase/migrations/0007_company_bootstrap_invites.sql

```sql
-- 0007 — employer bootstrap + team invites
--
-- 1. create_company(): first company_members row can't pass the
--    "admin write" policy (no admin exists yet). SECURITY DEFINER RPC
--    creates the company + admin member atomically.
-- 2. company_invites: invited teammates have no auth user, so they can't
--    be inserted into company_members (FK to profiles). Track them here;
--    link on signup later.

create or replace function public.create_company(p_name text)
returns uuid language plpgsql security definer
set search_path = public as $$
declare cid uuid;
begin
  insert into public.companies (name) values (p_name) returning id into cid;
  insert into public.company_members (company_id, user_id, member_role, status)
  values (cid, auth.uid(), 'admin', 'active');
  return cid;
end
$$;

create table if not exists public.company_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  role text not null default 'Recruiter',
  title text default '',
  phone text default '',
  status text not null default 'pending' check (status in ('pending','accepted','revoked')),
  invited_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (company_id, email)
);

alter table public.company_invites enable row level security;

create policy "company_invites: member read" on public.company_invites
  for select using (is_company_member(company_id));
create policy "company_invites: admin write" on public.company_invites
  for all using (is_company_admin(company_id))
  with check (is_company_admin(company_id));

```

## FILE: supabase/migrations/0008_credit_spend_policy.sql

```sql
-- Allow signed-in users to record their own credit *spends* (negative delta).
-- Positive deltas (grants/purchases) stay service-role-only via the webhook.
create policy "credit_txns: spend own"
  on public.credit_transactions for insert
  with check (auth.uid() = user_id and delta < 0);

```

## FILE: supabase/migrations/0009_mentor_sub_pending.sql

```sql
-- Mentor subscriptions must not self-activate: a mentee can only create a
-- 'pending' row; the Razorpay webhook (service role) flips it to 'active'
-- after payment is verified.

alter table public.mentor_subscriptions
  drop constraint if exists mentor_subscriptions_status_check;
alter table public.mentor_subscriptions
  add constraint mentor_subscriptions_status_check
  check (status in ('pending', 'active', 'paused', 'canceled'));

drop policy if exists "mentor_subs: mentee insert" on public.mentor_subscriptions;
create policy "mentor_subs: mentee insert"
  on public.mentor_subscriptions for insert
  with check (auth.uid() = mentee_id and status = 'pending');

```

## FILE: supabase/functions/ai/index.ts

```typescript
// Fill-it-up AI edge function — routes all Gemini-powered features.
// POST /functions/v1/ai  { kind, input }  (Authorization: Bearer <user jwt>)
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2"

// newest-first; each is tried in turn on 404 (not enabled for this key)
// or 429/5xx (rate limit / saturation). Free-tier models throttle often.
const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
]
const GEMINI_URL = (m: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  })

async function gemini(prompt: string, key: string): Promise<string> {
  let lastErr = "all models failed"
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(`${GEMINI_URL(model)}?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(20_000),   // never let one model stall the fn
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
          }),
        })
        if (!res.ok) {
          lastErr = `${model} ${res.status}`
          if (res.status === 404 || res.status >= 500) break // try next model
          if (res.status === 429 && attempt === 0) {
            await new Promise(r => setTimeout(r, 800))
            continue // one retry on rate limit
          }
          break
        }
        const data = await res.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
        if (text) return text
        lastErr = `${model} empty`
        break
      } catch (e) {
        lastErr = `${model} ${e}`
        break
      }
    }
  }
  throw new Error(`Gemini ${lastErr}`)
}

async function geminiJson<T>(prompt: string, key: string, fallback: T): Promise<T> {
  try {
    const text = await gemini(prompt, key)
    return JSON.parse(text.replace(/```json|```/g, "").trim()) as T
  } catch {
    return fallback
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return json({ error: "POST only" }, 405)

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) return json({ error: "Missing Authorization header" }, 401)

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const service = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return json({ error: "Unauthorized" }, 401)

  const { kind, input } = await req.json().catch(() => ({}))
  const key = Deno.env.get("GEMINI_API_KEY")
  if (!key) return json({ error: "GEMINI_API_KEY not configured" }, 500)

  switch (kind) {
    /* ---- match score: job ↔ seeker profile ---- */
    case "match-score": {
      const { jobId } = input ?? {}
      if (!jobId) return json({ error: "jobId required" }, 400)

      const [{ data: job }, { data: sp }, { data: profile }] = await Promise.all([
        service.from("jobs").select("*, companies(name)").eq("id", jobId).single(),
        service.from("seeker_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        service.from("profiles").select("full_name").eq("id", user.id).single(),
      ])
      if (!job) return json({ error: "Job not found" }, 404)

      const out = await geminiJson(
        `You are an AI job-matching engine. Score this candidate against this job.

CANDIDATE
Name: ${profile?.full_name}
Title: ${sp?.title ?? ""}
Skills: ${(sp?.skills ?? []).join(", ")}
About: ${(sp?.about ?? "").slice(0, 600)}

JOB
Title: ${job.title} at ${job.companies?.name}
Requirements: ${(job.requirements ?? []).join("; ")}
Skills: ${(job.skills ?? []).join(", ")}
Description: ${(job.description ?? "").slice(0, 800)}

Return ONLY JSON:
{"score":<0-100>,"aiSummary":"<2 sentences>","skillsMatched":[<n_matched>,<n_listed>],"fitPoints":["<point>",...3],"gaps":["<gap>",...2],"salaryContext":"<1 sentence>","resumeTips":["<tip>",...3],"prepPoints":["<point>",...3],"growth":"<1 sentence>","teamSize":"<estimate>","reportsTo":"<role>"}`,
        key,
        { score: 50, aiSummary: "", skillsMatched: [0, (job.skills ?? []).length], fitPoints: [], gaps: [], salaryContext: "", resumeTips: [], prepPoints: [], growth: "", teamSize: "", reportsTo: "" }
      )

      const { aiSummary, skillsMatched, fitPoints, gaps, salaryContext, resumeTips, prepPoints, growth, teamSize, reportsTo } = out as any
      const score = Math.max(0, Math.min(100, Math.round((out as any).score ?? 50)))
      await service.from("match_scores").upsert(
        { seeker_id: user.id, job_id: jobId, score,
          breakdown: { aiSummary, skillsMatched, fitPoints, gaps, salaryContext, resumeTips, prepPoints, growth, teamSize, reportsTo },
          computed_at: new Date().toISOString() },
        { onConflict: "seeker_id,job_id" }
      )
      return json({ score, ...((out as any) ?? {}) })
    }

    /* ---- resume analysis / enhancement ---- */
    case "resume-analyze": {
      const { resumeText, targetRole } = input ?? {}
      if (!resumeText) return json({ error: "resumeText required" }, 400)
      const out = await geminiJson(
        `Analyze this resume${targetRole ? ` for a ${targetRole} role` : ""}. Return ONLY JSON:
{"score":<0-100>,"summary":"<2 sentences>","strengths":["..."],"improvements":["..."],"enhancedBullets":["<rewritten bullet>",...5],"skillsFound":["..."],"missingSkills":["..."]}

RESUME:
${String(resumeText).slice(0, 12000)}`,
        key,
        { score: 60, summary: "", strengths: [], improvements: [], enhancedBullets: [], skillsFound: [], missingSkills: [] }
      )
      await service.from("ai_results").insert({ user_id: user.id, kind: "resume-analyze", input, output: out })
      return json(out)
    }

    /* ---- interview prep ---- */
    case "interview-prep": {
      const { mode, category, topic, question, answer } = input ?? {}
      if (mode === "questions") {
        const out = await geminiJson(
          `Generate 5 ${category ?? "behavioral"} interview questions for a ${topic ?? "software engineer"} role. Return ONLY JSON: {"questions":[{"q":"...","hint":"..."}]}`,
          key, { questions: [] }
        )
        await service.from("ai_results").insert({ user_id: user.id, kind: "interview-questions", input, output: out })
        return json(out)
      }
      const out = await geminiJson(
        `Score this interview answer 0-100. Question: "${question}" Answer: "${answer}". Return ONLY JSON: {"score":<n>,"feedback":["<point>",...3],"strongPoints":["..."],"improvements":["..."]}`,
        key, { score: 50, feedback: [], strongPoints: [], improvements: [] }
      )
      return json(out)
    }

    /* ---- salary oracle ---- */
    case "salary-oracle": {
      const { role, location, years, skills } = input ?? {}
      const out = await geminiJson(
        `Estimate market salary for ${role} in ${location ?? "India"}, ${years ?? 0} years exp, skills: ${(skills ?? []).join(", ")}. Currency INR.
Return ONLY JSON:
{"p25":<annual>,"median":<annual>,"p75":<annual>,"estimate":<annual>,"factors":[{"label":"...","impact":"+"|"-","detail":"..."}],"benchmarks":[{"company":"...","range":"..."}]}`,
        key, { p25: 0, median: 0, p75: 0, estimate: 0, factors: [], benchmarks: [] }
      )
      await service.from("ai_results").insert({ user_id: user.id, kind: "salary-oracle", input, output: out })
      return json(out)
    }

    /* ---- career path ---- */
    case "career-path": {
      const { data: sp } = await service.from("seeker_profiles").select("*").eq("user_id", user.id).maybeSingle()
      const out = await geminiJson(
        `Build a career path for a ${sp?.title ?? "professional"} with skills: ${(sp?.skills ?? []).join(", ")}. Return ONLY JSON:
{"currentRole":"...","nextRole":"...","nextTimeline":"...","milestones":[{"role":"...","yearsFromNow":<n>,"salaryBand":"...","requirements":["..."]}],"learningPlan":[{"skill":"...","why":"...","resource":"..."}]}`,
        key, { currentRole: "", nextRole: "", nextTimeline: "", milestones: [], learningPlan: [] }
      )
      await service.from("ai_results").insert({ user_id: user.id, kind: "career-path", input, output: out })
      return json(out)
    }

    /* ---- compatibility index ---- */
    case "compatibility": {
      const { company } = input ?? {}
      const { data: sp } = await service.from("seeker_profiles").select("*").eq("user_id", user.id).maybeSingle()
      const out = await geminiJson(
        `Rate fit between this candidate and ${company} (0-100 each): culture, workStyle, values, growth, teamFit. Candidate: ${sp?.title}, skills ${(sp?.skills ?? []).join(", ")}, about: ${(sp?.about ?? "").slice(0, 400)}.
Return ONLY JSON: {"overall":<n>,"culture":<n>,"workStyle":<n>,"values":<n>,"growth":<n>,"teamFit":<n>,"explanations":{"culture":"...","workStyle":"...","values":"...","growth":"...","teamFit":"..."}}`,
        key, { overall: 0, culture: 0, workStyle: 0, values: 0, growth: 0, teamFit: 0, explanations: {} }
      )
      await service.from("ai_results").insert({ user_id: user.id, kind: "compatibility", input, output: out })
      return json(out)
    }

    /* ---- skill verification quiz ---- */
    case "skill-quiz": {
      const { skill } = input ?? {}
      const out = await geminiJson(
        `Write 8 multiple-choice questions testing ${skill} proficiency (mixed difficulty). Return ONLY JSON: {"questions":[{"q":"...","options":["a","b","c","d"],"answer":<0-3>}]}`,
        key, { questions: [] }
      )
      return json(out)
    }

    default:
      return json({ error: `Unknown kind: ${kind}` }, 400)
  }
})

```

## FILE: supabase/functions/razorpay-order/index.ts

```typescript
// Creates a Razorpay order for seeker plans/credits or mentor subscriptions.
// POST /functions/v1/razorpay-order  { kind: "credits"|"mentor", planKey?, mentorPlanId?, amountInr }
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } })

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return json({ error: "POST only" }, 405)

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) return json({ error: "Unauthorized" }, 401)

  const keyId = Deno.env.get("RAZORPAY_KEY_ID")
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")
  if (!keyId || !keySecret) return json({ error: "Razorpay not configured" }, 500)

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )
  const { data: { user }, error: authErr } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  )
  if (authErr || !user) return json({ error: "Unauthorized" }, 401)

  const { kind, mentorPlanId, amountInr } = await req.json().catch(() => ({}))
  const amountPaise = Math.round(Number(amountInr) * 100)
  if (!amountPaise || amountPaise < 100) return json({ error: "Invalid amount" }, 400)
  if (kind === "mentor" && !mentorPlanId) return json({ error: "mentorPlanId required" }, 400)

  const receipt = `fiu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: { kind, user_id: user.id, mentor_plan_id: mentorPlanId ?? "" },
    }),
  })
  if (!rzpRes.ok) return json({ error: `Razorpay: ${await rzpRes.text()}` }, 502)
  const order = await rzpRes.json()

  await supabase.from("orders").insert({
    user_id: user.id,
    razorpay_order_id: order.id,
    purpose: kind === "mentor" ? "mentor_subscription" : "credits",
    reference_id: mentorPlanId ?? null,
    amount: amountPaise,
    currency: "INR",
    status: "created",
  })

  return json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId, // publishable — safe for checkout.js
  })
})

```

## FILE: supabase/functions/razorpay-webhook/index.ts

```typescript
// Razorpay webhook — verifies signature, activates entitlements.
// Configure in Razorpay dashboard: payment.captured
// Webhook URL: https://<ref>.supabase.co/functions/v1/razorpay-webhook
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2"

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } })

async function verifySignature(body: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  )
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))
  const expected = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, "0")).join("")
  return expected === signature
}

// paise -> credits granted (tune to actual pack pricing)
const CREDIT_PACKS: Record<number, { credits: number; label: string }> = {
  9900: { credits: 10, label: "Starter pack" },
  24900: { credits: 30, label: "Growth pack" },
  49900: { credits: 75, label: "Pro pack" },
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405)

  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")
  if (!secret) return json({ error: "Webhook secret not configured" }, 500)

  const body = await req.text()
  const signature = req.headers.get("x-razorpay-signature") ?? ""
  if (!(await verifySignature(body, signature, secret)))
    return json({ error: "Invalid signature" }, 401)

  const event = JSON.parse(body)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  if (event.event !== "payment.captured")
    return json({ ok: true, ignored: event.event })

  const payment = event.payload?.payment?.entity
  const rzpOrderId = payment?.order_id
  if (!rzpOrderId) return json({ error: "No order id" }, 400)

  // idempotent: skip if already processed
  const { data: order } = await supabase
    .from("orders").select("*").eq("razorpay_order_id", rzpOrderId).maybeSingle()
  if (!order) return json({ error: "Unknown order" }, 404)
  if (order.status === "paid") return json({ ok: true, duplicate: true })

  await supabase.from("orders").update({
    status: "paid",
    razorpay_payment_id: payment?.id ?? null,
  }).eq("id", order.id)

  if (order.purpose === "mentor_subscription") {
    const planId = order.reference_id
    const { data: plan } = await supabase
      .from("mentor_plans").select("mentor_id, name").eq("id", planId).single()
    if (plan) {
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      const { data: existing } = await supabase.from("mentor_subscriptions")
        .select("id").eq("mentor_id", plan.mentor_id).eq("mentee_id", order.user_id)
        .maybeSingle()
      if (existing) {
        await supabase.from("mentor_subscriptions").update({
          status: "active", plan_id: planId,
          razorpay_payment_id: payment?.id ?? null,
          current_period_end: periodEnd.toISOString(),
        }).eq("id", existing.id)
      } else {
        await supabase.from("mentor_subscriptions").insert({
          mentor_id: plan.mentor_id, mentee_id: order.user_id, plan_id: planId,
          status: "active", razorpay_payment_id: payment?.id ?? null,
          current_period_end: periodEnd.toISOString(),
        })
      }

      // payout ledger — 15% platform commission (amounts in paise → stored as ₹)
      const amountInr = order.amount / 100
      const commission = Math.round(amountInr * 0.15)
      await supabase.from("payouts").insert({
        mentor_id: plan.mentor_id,
        label: `${plan.name} subscription`,
        amount: amountInr - commission,
        commission,
        status: "pending",
      })
      await supabase.from("notifications").insert({
        user_id: plan.mentor_id,
        text: `New subscriber on "${plan.name}" — ₹${amountInr - commission} after commission`,
        link: "/mentor/mentees",
      })
    }
  } else {
    const pack = CREDIT_PACKS[order.amount] ?? {
      credits: Math.round(order.amount / 990),
      label: "Credit purchase",
    }
    await supabase.from("credit_transactions").insert({
      user_id: order.user_id, delta: pack.credits, reason: pack.label,
    })
    // keep denormalized balance in sync (credits live on seeker_profiles)
    const { data: p } = await supabase.from("seeker_profiles").select("credits").eq("user_id", order.user_id).maybeSingle()
    await supabase.from("seeker_profiles").upsert(
      { user_id: order.user_id, credits: (p?.credits ?? 0) + pack.credits },
      { onConflict: "user_id" }
    )
  }

  await supabase.from("invoices").insert({
    user_id: order.user_id,
    label: order.purpose === "mentor_subscription" ? "Mentor subscription" : "Credit purchase",
    amount: order.amount, status: "paid",
  })

  return json({ ok: true })
})

```

## FILE: supabase/functions/send-email/index.ts

```typescript
// Transactional email via Resend.
// POST /functions/v1/send-email  { template, to, data }
// Called from edge functions / database webhooks — service role only.
// deno-lint-ignore-file no-explicit-any
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } })

const FROM = Deno.env.get("EMAIL_FROM") ?? "Fill-it-up <onboarding@resend.dev>"

function render(template: string, d: Record<string, any>): { subject: string; html: string } {
  const wrap = (title: string, body: string) =>
    `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px">
      <h2 style="margin:0 0 16px">${title}</h2>
      <div style="color:#444;line-height:1.6">${body}</div>
      <p style="color:#999;font-size:12px;margin-top:32px">— The Fill-it-up team</p>
    </div>`
  switch (template) {
    case "welcome":
      return {
        subject: "Welcome to Fill-it-up",
        html: wrap("Welcome aboard 👋", `Hi ${d.name ?? "there"},<br><br>Your ${d.role ?? ""} account is ready. <a href="${d.url ?? "https://fillitup.vercel.app"}">Open your dashboard</a>.`),
      }
    case "application-status":
      return {
        subject: `Application update: ${d.jobTitle ?? "your application"}`,
        html: wrap("Application update", `Your application for <b>${d.jobTitle}</b> at <b>${d.company}</b> moved to <b>${d.stage}</b>.`),
      }
    case "session-reminder":
      return {
        subject: `Session reminder: ${d.title ?? "mentoring session"}`,
        html: wrap("Session reminder", `Your session <b>${d.title}</b> is on <b>${d.when}</b>. ${d.link ? `<a href="${d.link}">Join link</a>` : ""}`),
      }
    case "payout":
      return {
        subject: "Payout processed",
        html: wrap("Payout processed", `₹${d.amount} is on its way to your account.${d.period ? ` (Period: ${d.period})` : ""}`),
      }
    default:
      return { subject: d.subject ?? "Fill-it-up notification", html: wrap(d.subject ?? "Notification", d.body ?? "") }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return json({ error: "POST only" }, 405)

  const key = Deno.env.get("RESEND_API_KEY")
  if (!key) return json({ error: "RESEND_API_KEY not configured" }, 500)

  // internal callers only — dedicated secret (env SUPABASE_SERVICE_ROLE_KEY
  // uses the new key format, so equality against the legacy JWT fails)
  const allowed = [
    Deno.env.get("INTERNAL_CALL_SECRET"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    ...(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "").split(","),
  ].filter(Boolean)
  const auth = (req.headers.get("Authorization") ?? "").replace("Bearer ", "")
  if (allowed.length && !allowed.includes(auth))
    return json({ error: "Unauthorized" }, 401)

  const { template, to, data } = await req.json().catch(() => ({}))
  if (!to || !template) return json({ error: "template + to required" }, 400)

  const { subject, html } = render(template, data ?? {})
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  })
  if (!res.ok) return json({ error: `Resend: ${await res.text()}` }, 502)
  return json({ ok: true, id: (await res.json()).id })
})

```
