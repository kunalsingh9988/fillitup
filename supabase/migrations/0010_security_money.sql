-- ============================================================
-- 0010 · Security & money hardening
-- Revokes client write access to money/identity fields, moves credit
-- economics into SECURITY DEFINER RPCs, tightens profile visibility,
-- and adds server-side pricing + abuse-prevention tables.
-- ============================================================

-- ---------- shared-context visibility ----------
-- True when `other` is a user the caller legitimately interacts with:
-- same conversation, an application between them, a mentor session or
-- subscription between them, same company, or `other` is a public
-- figure (mentor in the directory, community/review author).
create or replace function public.shares_context(other uuid)
returns boolean
language sql stable security definer
set search_path = public as
$$
  select exists (
    select 1 from conversation_participants a
    join conversation_participants b on b.conversation_id = a.conversation_id
    where a.user_id = auth.uid() and b.user_id = other
  ) or exists (
    select 1 from applications a
    join jobs j on j.id = a.job_id
    join company_members cm on cm.company_id = j.company_id
    where (a.seeker_id = auth.uid() and cm.user_id = other)
       or (a.seeker_id = other and cm.user_id = auth.uid())
  ) or exists (
    select 1 from mentor_sessions s
    where (s.mentor_id = auth.uid() and s.mentee_id = other)
       or (s.mentee_id = auth.uid() and s.mentor_id = other)
  ) or exists (
    select 1 from mentor_subscriptions s
    where (s.mentor_id = auth.uid() and s.mentee_id = other)
       or (s.mentee_id = auth.uid() and s.mentor_id = other)
  ) or exists (
    select 1 from company_members a
    join company_members b on b.company_id = a.company_id
    where a.user_id = auth.uid() and b.user_id = other
  ) or exists (
    -- public figures: mentors and community/review authors are discoverable
    select 1 from mentor_profiles mp where mp.user_id = other
  ) or exists (
    select 1 from community_posts p where p.author_id = other
  ) or exists (
    select 1 from mentor_reviews r where r.author_id = other or r.mentor_id = other
  )
$$;

-- ---------- profiles: private by default ----------
drop policy if exists "profiles: read others (dir)" on public.profiles;
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read self" on public.profiles for select
  using (auth.uid() = id);
create policy "profiles: read shared" on public.profiles for select
  using (public.shares_context(id));
create policy "profiles: insert own" on public.profiles for insert
  with check (id = auth.uid());

-- role + onboarding_done are never client-writable; role is set at signup
-- (handle_new_user) or via the set-signup-role function within 15 minutes.
revoke insert, update on public.profiles from authenticated;
grant insert (id, full_name, avatar_url) on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- safe public directory view for names/avatars (community, reviews, mentor dir)
create or replace view public.public_profiles as
  select id, full_name, avatar_url, role from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- ---------- seeker_profiles: split the FOR ALL policy ----------
drop policy if exists "seeker_profiles: owner" on public.seeker_profiles;
create policy "seeker_profiles: read own" on public.seeker_profiles for select
  using (user_id = auth.uid());
create policy "seeker_profiles: insert own" on public.seeker_profiles for insert
  with check (user_id = auth.uid() and coalesce(credits, 0) = 0 and referral_code is null);
create policy "seeker_profiles: update own" on public.seeker_profiles for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
-- "employer read applicants" policy unchanged (row-scoped, no writes)

revoke insert, update on public.seeker_profiles from authenticated;
grant insert (user_id, title, location, availability, about, linkedin, github,
              portfolio, skills, readiness, checklist, badges)
  on public.seeker_profiles to authenticated;
grant update (title, location, availability, about, linkedin, github,
              portfolio, skills, readiness, checklist, badges)
  on public.seeker_profiles to authenticated;

-- ---------- credit ledger: RPC-only writes ----------
drop policy if exists "credit_txns: spend own" on public.credit_transactions;

-- Atomic spend: decrements balance iff sufficient, writes ledger row.
-- Users spend for themselves; service role may spend for anyone (ai function).
create or replace function public.spend_credits(p_amount int, p_reason text, p_user_id uuid default null)
returns integer
language plpgsql security definer
set search_path = public as
$$
declare
  v_uid uuid := coalesce(p_user_id, auth.uid());
  v_balance int;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_user_id is not null and p_user_id <> auth.uid() and auth.role() <> 'service_role' then
    raise exception 'forbidden';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  update seeker_profiles
     set credits = credits - p_amount
   where user_id = v_uid and credits >= p_amount
  returning credits into v_balance;
  if v_balance is null then
    raise exception 'insufficient_credits';
  end if;
  insert into credit_transactions (user_id, delta, reason) values (v_uid, -p_amount, p_reason);
  return v_balance;
end;
$$;

-- Atomic grant/reversal: service role only (webhook, ai refunds).
create or replace function public.grant_credits(p_amount int, p_reason text, p_user_id uuid)
returns integer
language plpgsql security definer
set search_path = public as
$$
declare
  v_balance int;
begin
  if auth.role() <> 'service_role' then
    raise exception 'forbidden';
  end if;
  if p_user_id is null or p_amount is null or p_amount = 0 then
    raise exception 'invalid_input';
  end if;
  insert into seeker_profiles (user_id, credits) values (p_user_id, 0)
  on conflict (user_id) do nothing;
  update seeker_profiles
     set credits = greatest(0, credits + p_amount)
   where user_id = p_user_id
  returning credits into v_balance;
  insert into credit_transactions (user_id, delta, reason) values (p_user_id, p_amount, p_reason);
  return v_balance;
end;
$$;

revoke all on function public.spend_credits(int, text, uuid) from public;
grant execute on function public.spend_credits(int, text, uuid) to authenticated, service_role;
revoke all on function public.grant_credits(int, text, uuid) from public;
grant execute on function public.grant_credits(int, text, uuid) to service_role;

-- ---------- price_items: single source of truth ----------
create table public.price_items (
  key text primary key,
  kind text not null check (kind in ('credits', 'seeker_plan', 'mentor_plan')),
  label text not null,
  amount_paise integer not null check (amount_paise > 0),
  credits integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.price_items enable row level security;
create policy "price_items: public read" on public.price_items for select using (true);

insert into public.price_items (key, kind, label, amount_paise, credits) values
  ('credits_10', 'credits', 'Starter pack — 10 credits', 9900, 10),
  ('credits_30', 'credits', 'Growth pack — 30 credits', 24900, 30),
  ('credits_75', 'credits', 'Pro pack — 75 credits', 49900, 75),
  ('pro_monthly', 'seeker_plan', 'Fill-it-up Pro — monthly', 29900, null);

-- orders: remember which plan key was purchased
alter table public.orders add column if not exists meta jsonb;

-- ---------- ai usage metering ----------
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);
alter table public.ai_usage enable row level security; -- service-role only
create index ai_usage_user_time_idx on public.ai_usage (user_id, created_at);

-- ---------- webhook event log ----------
create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  payload jsonb,
  processed boolean not null default false,
  error text,
  created_at timestamptz not null default now()
);
alter table public.webhook_events enable row level security; -- service-role only
create index webhook_events_order_idx on public.webhook_events (razorpay_order_id);
