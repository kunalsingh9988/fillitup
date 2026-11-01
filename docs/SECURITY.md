# Fill-it-up — Security Model

How money, identity, and personal data are protected. Enforced in Postgres
(RLS + column grants + SECURITY DEFINER RPCs) — client code can be bypassed,
these cannot. Verified by `scripts/rls-test.mjs` (17 checks, run against the
live project).

## Money: credits

| Layer | Rule |
|---|---|
| `seeker_profiles.credits` | Never client-writable. Column grants on `seeker_profiles`/`profiles` only allow safe fields; `credits`, `referral_code`, `role`, `onboarding_done` are server-only. |
| `credit_transactions` | No client INSERT/UPDATE/DELETE policy at all. Rows are written only inside `spend_credits` / `grant_credits` (SECURITY DEFINER). Users can SELECT their own ledger. |
| `spend_credits(amount, reason, user_id?)` | Atomic: `UPDATE … SET credits = credits - n WHERE credits >= n` — insufficient balance raises `insufficient_credits` (402 from the API). Users may spend only their own balance; service role may charge anyone (AI function). |
| `grant_credits(amount, reason, user_id)` | Service role only. Atomic `credits + n` (floored at 0 for reversals). Called by the Razorpay webhook (purchases, refund reversals) and the AI function (degraded-call refunds). |

## Payments: Razorpay

| Function | Hardening |
|---|---|
| `razorpay-order` | Accepts `{kind, planKey \| mentorPlanId}` only — client amounts are ignored. Prices resolve from `price_items` (credit packs, seeker plans) or `mentor_plans` (must be published; self-purchase blocked). Expected amount is stored on the order row. |
| `razorpay-webhook` | HMAC-SHA256 signature verified with constant-time comparison; `payment.amount === order.amount` and currency `INR` required (mismatch → order flagged `mismatch`, nothing granted). Idempotency is atomic — `UPDATE orders SET status='paid' … WHERE status<>'paid' RETURNING` claims the order once; retries short-circuit. Credits granted via `grant_credits` (no read-modify-write). Handles `payment.failed` (order → failed) and `refund.processed` (credits reversed / subscription canceled). Every event is logged to `webhook_events` (service-role only) with processed/error state. |

`price_items` is the single source of truth for pack prices and credit
amounts — UI, order function, and webhook all read the same rows.

## AI abuse prevention (`ai` function)

- `kind` validated against a fixed allowlist; input capped at 20 KB.
- Rate limits: 5 calls/min and 40 calls/day per user (`ai_usage`, service-only).
- Credits charged via `spend_credits` **before** the Gemini call; refunded
  via `grant_credits` if all upstream models fail (`degraded` path).
- Resume text is never logged or persisted — only its character count.

## Profiles & privacy

| Policy | Protects |
|---|---|
| `profiles: read self` / `profiles: read shared` | Replaces `USING (true)`. A user can read another profile only via `shares_context()`: same conversation, an application between them, a mentor session/subscription between them, same company, or the target is a public figure (mentor, community/review author). |
| `public_profiles` view | `id, full_name, avatar_url` only — safe directory surface for community/mentor listings. |
| `profiles: update` | `full_name`, `avatar_url` only. `role` is set once at signup (`handle_new_user` trigger) or via `set-signup-role` within a 15-min grace window for OAuth signups — after that, workspace choice lives in `user_settings.data.workspace`, not `profiles`. |
| `seeker_profiles` | Owner policy split: read/insert/update own row with safe columns only; `credits`/`referral_code` excluded from grants. Employer read is row-scoped to applicants. |
| `mentor_subscriptions` | Mentee inserts must be `status='pending'` — only the webhook (service role) activates after verified payment. |

## Email (`send-email`)

- Callers must present `INTERNAL_CALL_SECRET` / a service-role key — user
  JWTs get 401.
- `to` validated as an email address; template names are allowlisted.
- Every interpolated value is HTML-escaped; links must be `http(s)`.

## What is *not* covered yet (future phases)

- Storage bucket policies for resume uploads (Phase 2).
- Captcha on signup/login, email-confirmation enforcement (Phase 3).
- Secret rotation runbook, key-scoped rate limiting on edge functions.
