-- Fix the contracts buyer-read RLS policy: the original `(select email from
-- auth.users where id = auth.uid())` requires SELECT on auth.users, which
-- the `authenticated` role doesn't have. PostgREST evaluates SELECT policies
-- as part of every INSERT…RETURNING, so any admin INSERT into contracts
-- failed with `permission denied for table users`.
--
-- Reading the email from the JWT claim avoids the table access entirely.

drop policy if exists "contracts buyer read own" on public.contracts;

create policy "contracts buyer read own"
  on public.contracts for select
  using (
    buyer_signer_email is not null
    and lower(buyer_signer_email) = lower(coalesce(
      (select auth.jwt() ->> 'email'),
      ''
    ))
  );
