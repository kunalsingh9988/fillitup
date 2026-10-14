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
