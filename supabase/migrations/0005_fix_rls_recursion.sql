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
