-- Mentor subscriptions must not self-activate: a mentee can only create a
-- 'pending' row; the Razorpay webhook (service role) flips it to 'active'
-- after payment is verified.

alter table public.mentor_subscriptions
  drop constraint if exists mentor_subscriptions_status_check;
alter table public.mentor_subscriptions
  add constraint mentor_subscriptions_status_check
  check (status in ('pending', 'active', 'paused', 'canceled'));

drop policy if exists "mentor_subs: mentee insert" on public.mentor_subscriptions;
create policy "mentor_subs: mentee insert"
  on public.mentor_subscriptions for insert
  with check (auth.uid() = mentee_id and status = 'pending');
