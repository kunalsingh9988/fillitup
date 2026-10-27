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
