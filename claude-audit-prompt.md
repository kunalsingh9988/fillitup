# Claude Audit Prompt — Fill-it-up

Paste everything below the line into Claude (attach `claude-audit-bundle.md` for the backend source).

---

You are performing a **complete functional + security + quality audit** of **Fill-it-up**, an AI-powered career platform with three user roles: job seeker, employer, mentor.

## Context

- **Live site**: https://fillitup.vercel.app
- **Repo (public)**: https://github.com/kunalsingh9988/fillitup
- **Stack**: React 19 + TypeScript + Vite + Tailwind v4 + Radix UI · Supabase (Postgres + Auth + RLS + Edge Functions) · Razorpay (INR payments) · Resend (email) · Google Gemini (AI) · Vercel hosting
- **Guest mode**: every dashboard route renders with seed data when signed out (stores fall back to localStorage). You can view `/app`, `/employer`, `/mentor` without credentials. Anything requiring real persistence needs a test signup.
- Attached `claude-audit-bundle.md` contains full source for auth, all 3 stores, all 9 migrations (schema + RLS), all 4 edge functions, and deploy config. Fetch the GitHub repo for page components and anything missing.

## Access & materials provided

| What | Value | Lets you |
|---|---|---|
| Live site | https://fillitup.vercel.app | All guest-mode routes + UI QA |
| Repo (public) | https://github.com/kunalsingh9988/fillitup | Full source: pages, components, scripts |
| Attached bundle | `claude-audit-bundle.md` | Backend source: migrations, RLS, edge functions, stores, auth |
| Supabase REST | `https://qebcicrykxlrfcqtqqbk.supabase.co/rest/v1/` | Probe live API/RLS directly |
| Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlYmNpY3J5a3hscmZjcXRxcWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5ODQ5OTksImV4cCI6MjEwNzU2MDk5OX0.pmuhpnzNDPbeybjGJC1221zGcN_d2gO-T4yowea5tEY` | Auth'd API calls as `anon` role — verify RLS actually denies/allows (header: `apikey` + `Authorization: Bearer <key>`) |
| Test signups | Self-service — email confirmations are OFF, so signup returns an instant session | Create one account per role (e.g. `qa-seeker@mailinator.com`, `qa-employer@mailinator.com`, `qa-mentor@mailinator.com`) via `/signup` or `POST /auth/v1/signup`, then test authenticated flows + cross-role RLS isolation |

**Cannot be verified end-to-end** (mark `UNVERIFIED`, audit code only):

- Razorpay checkout/payment completion — needs live keys + a real/test card. Verify order creation + webhook signature logic in source instead.
- Google OAuth completion — you can verify the redirect initiates to `accounts.google.com`; completing it needs a real Google account.
- LinkedIn button — likely unconfigured (only Google is in `config.toml`); confirm + flag.
- Resend email delivery — verify `send-email` gating in code; no inbox check possible.

**Rules**: Be exhaustive — do not sample. Test every route and every interactive element. If something cannot be verified without auth/payment, mark it `UNVERIFIED` — never mark untested things as passing.

---

## Phase 1 — Public marketing site

For each of `/`, `/pricing`, `/how-it-works`, `/about`, `/contact`, `/privacy`, `/terms`:

- Page loads with zero console errors, no broken images/fonts, no layout breakage
- Every internal link resolves; no 404s; footer/nav links all work
- Forms: contact form + newsletter — required fields, email validation, submit behavior, success + error states
- SEO: unique title + meta description + og tags per page
- Responsive at 375px / 768px / 1280px
- Dark/light theme toggle works and persists across reload
- Landing specifically: resume upload widget + ideal-role input — what do they actually do? Dead ends = finding.

## Phase 2 — Authentication

- `/signup`: all 3 role selections, field validation, duplicate-email handling, post-signup state (check-email vs instant session)
- `/login`: email+password works, wrong-password error state, Google OAuth flow completes, LinkedIn button — works or dead stub?
- `/forgot-password`: full flow including redirect target after email link
- `/auth/callback`: OAuth landing handles success + error + missing code
- Role-based redirect: seeker→`/app`, employer→`/employer`, mentor→`/mentor`
- Sign-out works; session persists across reload
- Route guards: are `/app`, `/employer`, `/mentor` actually protected? Flag whether guest access is intentional demo behavior or a data-leak risk
- Regression check (`src/lib/auth.tsx`): pending OAuth role must ONLY apply to profiles <15 min old — confirm this fix is intact

## Phase 3 — Job Seeker app (every `/app` route)

- `/app` — dashboard stats, match-score rings, quick actions all render + link correctly
- `/app/jobs` — list, search, filters, save, apply buttons
- `/app/apply/:id` — full application flow incl. invalid ID handling
- `/app/ai` — AI Hub landing
- `/app/ai/interview-prep`, `/app/ai/salary-oracle`, `/app/ai/compatibility`, `/app/ai/career-path` — each: form validation → calls `ai` edge function → loading state → renders structured result → error state on failure → credits deducted correctly
- `/app/skills` — assessment flow end-to-end
- `/app/profile` — edit + save + persistence
- `/app/mentorship` + `/app/mentorship/:id` — listings render, subscribe triggers Razorpay checkout
- `/app/community` — posts, create, like, comment
- `/app/messages` — conversation list, send message
- `/app/resumes` — upload, list, analyze
- `/app/billing` — credit balance, transaction history, invoices, buy-credits → Razorpay
- `/app/refer` — referral link/code flow
- `/app/settings` — every toggle persists

## Phase 4 — Employer app (every `/employer` route)

- `/employer` — dashboard stats render
- `/employer/company` — profile edit + save
- `/employer/jobs` — job list, statuses
- `/employer/jobs/new` — post-job wizard: EVERY step validates + submits
- `/employer/candidates` — kanban pipeline, stage moves work
- `/employer/candidates/:id` — detail view + stage change + notes
- `/employer/analytics` — all charts render with data
- `/employer/team` — member list + invite flow
- `/employer/messages`, `/employer/settings`

## Phase 5 — Mentor app (every `/mentor` route)

- `/mentor` — dashboard
- `/mentor/plans` — create/edit/delete subscription plans
- `/mentor/mentees`, `/mentor/reviews`, `/mentor/sessions`, `/mentor/availability` (slot CRUD)
- `/mentor/messages`, `/mentor/resources`, `/mentor/insights`
- `/mentor/earnings` — payout ledger renders; verify 15% platform commission math is correct
- `/mentor/profile`, `/mentor/settings`

## Phase 6 — Backend & integrations (bundle source + live API probing)

Use the anon key above against `/rest/v1/<table>` to actively verify what policies say — don't just read them:

- **RLS enforcement**: as `anon`, query `profiles`, `jobs`, `applications`, `conversations`, `messages`, `credit_transactions`, `invoices`, `payout_ledger` — which return data vs. empty vs. error? Flag any user-data table readable anonymously.
- **Cross-user isolation**: with your 3 test accounts, verify a seeker can't read another user's applications/messages/credits, and can't touch employer/mentor tables.
- **Privilege escalation**: attempt `PATCH /rest/v1/profiles?id=eq.<your-id>` setting `role=employer` or `credits=99999` — must fail. Any self-serve role/credit update is Critical.
- **Migrations 0001–0009**: every table has RLS enabled; cross-check policy definitions in source against live behavior.
- **`ai` edge function**: auth enforced, input validated, Gemini key server-side only, model fallback works, cache can't leak across users
- **`razorpay-order`**: amounts computed server-side (never client-trusted), auth required
- **`razorpay-webhook`**: HMAC signature verified BEFORE any state change, idempotent on redelivery, correctly activates mentor subs / grants credits / writes payout ledger + invoices
- **`send-email`**: internal-secret gated, can't be abused as open relay
- **Vercel**: SPA rewrite doesn't shadow `/api/*`; keepalive cron valid
- **Client bundle**: no secrets beyond the Supabase anon key; no localhost URLs; no debug leftovers

## Phase 7 — Cross-cutting

- Console: zero errors/warnings on EVERY route
- Network: no failed requests, no 404s on assets
- a11y: keyboard navigation, focus rings, aria labels, contrast, image alt text
- Performance: main JS bundle is ~1.6 MB — identify lazy-loading wins; flag oversized images
- Code hygiene: TODO/FIXME, console.log, dead code, duplicated logic, missing error boundaries
- **Known pending item**: roles for existing users Kunal Singh + Srishti Aggarwal stuck as `seeker` after the old OAuth downgrade bug — needs DB repair, not code

## Output format

1. **Executive summary** — health score /10, top 3 risks
2. **Findings table**: `# | Severity (Critical/High/Medium/Low) | Area | Issue | Evidence (file:line or URL) | Suggested fix`
3. **Feature checklist** — every route/feature above marked ✅ works / ⚠️ partial / ❌ broken / ⬜ unverified
4. **Quick wins** — everything fixable in under 30 minutes
