-- ============================================================
-- 0011 · Follow-up to 0010
-- a) seeker_profiles insert check referenced referral_code, which has a
--    non-null column default — CHECKs run after defaults, so every insert
--    was rejected. Column grants already prevent setting credits /
--    referral_code / other protected columns, so the owner check suffices.
-- b) public_profiles narrowed to the intended surface (id, name, avatar).
-- ============================================================

drop policy if exists "seeker_profiles: insert own" on public.seeker_profiles;
create policy "seeker_profiles: insert own" on public.seeker_profiles for insert
  with check (user_id = auth.uid());

drop view public.public_profiles;
create view public.public_profiles as
  select id, full_name, avatar_url from public.profiles;
grant select on public.public_profiles to anon, authenticated;
