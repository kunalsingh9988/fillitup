-- 0006 — let the conversation creator read their own row.
-- INSERT ... RETURNING applies the SELECT policy to the new row; a fresh
-- conversation has no participants yet, so is_conv_participant() was false
-- and inserts 42501'd. Track created_by and include it in the select policy.

alter table public.conversations
  add column if not exists created_by uuid not null default auth.uid()
    references public.profiles(id);

drop policy if exists "conversations: participants" on public.conversations;
create policy "conversations: participants" on public.conversations
  for select using (created_by = auth.uid() or is_conv_participant(id));
