-- 0007 — employer bootstrap + team invites
--
-- 1. create_company(): first company_members row can't pass the
--    "admin write" policy (no admin exists yet). SECURITY DEFINER RPC
--    creates the company + admin member atomically.
-- 2. company_invites: invited teammates have no auth user, so they can't
--    be inserted into company_members (FK to profiles). Track them here;
--    link on signup later.

create or replace function public.create_company(p_name text)
returns uuid language plpgsql security definer
set search_path = public as $$
declare cid uuid;
begin
  insert into public.companies (name) values (p_name) returning id into cid;
  insert into public.company_members (company_id, user_id, member_role, status)
  values (cid, auth.uid(), 'admin', 'active');
  return cid;
end
$$;

create table if not exists public.company_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  role text not null default 'Recruiter',
  title text default '',
  phone text default '',
  status text not null default 'pending' check (status in ('pending','accepted','revoked')),
  invited_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (company_id, email)
);

alter table public.company_invites enable row level security;

create policy "company_invites: member read" on public.company_invites
  for select using (is_company_member(company_id));
create policy "company_invites: admin write" on public.company_invites
  for all using (is_company_admin(company_id))
  with check (is_company_admin(company_id));
