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
