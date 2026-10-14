-- align application stages with UI vocabulary
alter table public.applications drop constraint applications_stage_check;
alter table public.applications add constraint applications_stage_check
  check (stage in ('saved','in_progress','applied','interview','offer','rejected','archived'));

-- checklist progress lives on the role profile (simple JSONB blob)
alter table public.seeker_profiles add column if not exists checklist jsonb not null default '[]';
alter table public.mentor_profiles add column if not exists checklist jsonb not null default '[]';

-- badges earned via skill verification
alter table public.seeker_profiles add column if not exists badges jsonb not null default '[]';
