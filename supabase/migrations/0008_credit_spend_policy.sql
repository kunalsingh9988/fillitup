-- Allow signed-in users to record their own credit *spends* (negative delta).
-- Positive deltas (grants/purchases) stay service-role-only via the webhook.
create policy "credit_txns: spend own"
  on public.credit_transactions for insert
  with check (auth.uid() = user_id and delta < 0);
