-- one assessment row per seeker+skill (upsert target)
create unique index if not exists skill_assessments_seeker_skill_uq
  on public.skill_assessments (seeker_id, skill);
