-- Security + perf hardening from the 2026-05-14 ECC audit.
--
--  - Profiles RLS rewritten with (select auth.uid()) so it's evaluated
--    once per query, not once per row (auth_rls_initplan advisor)
--  - sourcing_requests UPDATE: merge the two permissive policies into
--    one (multiple_permissive_policies advisor)
--  - Inquiries: cap message / email / name length to block spam payloads
--  - crm_emails: per-owner-per-hour rate limit trigger (50/h)
--  - FK covering indexes on every CRM FK column that was missing one
--    (unindexed_foreign_keys advisor)

begin;

-- ─────────────────────────────────────────────────────────────────────────
-- Profiles RLS perf — initplan optimisation
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists "profiles read own or admin-like" on public.profiles;
drop policy if exists "profiles update own buyer fields" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;

create policy "profiles read own or admin-like"
  on public.profiles for select
  using ((user_id = (select auth.uid())) or app_private.is_admin_like());

create policy "profiles update own buyer fields"
  on public.profiles for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and role = app_private.current_role());

create policy "profiles insert own"
  on public.profiles for insert
  with check (user_id = (select auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- sourcing_requests UPDATE: merge two permissive policies into one
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists "sourcing requests buyer update own draft fields" on public.sourcing_requests;
drop policy if exists "sourcing requests staff update assigned" on public.sourcing_requests;

create policy "sourcing requests update"
  on public.sourcing_requests for update
  using (
    buyer_id = app_private.current_profile_id()
    or app_private.current_role() in ('admin', 'sales', 'sourcing')
  )
  with check (
    buyer_id = app_private.current_profile_id()
    or app_private.current_role() in ('admin', 'sales', 'sourcing')
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Inquiries: input caps to block spam and oversized payloads
-- ─────────────────────────────────────────────────────────────────────────
create or replace function app_private.cap_inquiry_input()
returns trigger
language plpgsql
set search_path = public, app_private
as $$
begin
  if length(coalesce(new.message, '')) > 5000 then
    raise exception 'inquiry message too long (max 5000 chars)';
  end if;
  if length(coalesce(new.email, '')) > 254 then
    raise exception 'email too long';
  end if;
  if length(coalesce(new.full_name, '')) > 200 then
    raise exception 'full_name too long';
  end if;
  if length(coalesce(new.company_name, '')) > 200 then
    raise exception 'company_name too long';
  end if;
  if length(coalesce(new.product_name, '')) > 500 then
    raise exception 'product_name too long';
  end if;
  return new;
end;
$$;

drop trigger if exists inquiries_cap_input on public.inquiries;
create trigger inquiries_cap_input
before insert on public.inquiries
for each row execute function app_private.cap_inquiry_input();

-- ─────────────────────────────────────────────────────────────────────────
-- crm_emails: 50 outbound emails per owner per hour
-- ─────────────────────────────────────────────────────────────────────────
create or replace function app_private.rate_limit_crm_emails()
returns trigger
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_owner uuid;
  v_count integer;
begin
  v_owner := coalesce(new.owner_id, app_private.current_profile_id());
  if v_owner is null then
    return new;
  end if;
  select count(*) into v_count
    from public.crm_emails
   where coalesce(owner_id, '00000000-0000-0000-0000-000000000000'::uuid) = v_owner
     and created_at > now() - interval '1 hour';
  if v_count >= 50 then
    raise exception 'email rate limit: % sent in the last hour (max 50)', v_count;
  end if;
  return new;
end;
$$;

drop trigger if exists crm_emails_rate_limit on public.crm_emails;
create trigger crm_emails_rate_limit
before insert on public.crm_emails
for each row execute function app_private.rate_limit_crm_emails();

-- ─────────────────────────────────────────────────────────────────────────
-- FK covering indexes (unindexed_foreign_keys advisor)
-- ─────────────────────────────────────────────────────────────────────────
create index if not exists crm_activities_inquiry_idx on public.crm_activities(inquiry_id);
create index if not exists crm_companies_owner_idx on public.crm_companies(owner_id);
create index if not exists crm_contact_tags_tag_idx on public.crm_contact_tags(tag_id);
create index if not exists crm_contacts_owner_fk_idx on public.crm_contacts(owner_id);
create index if not exists crm_deals_inquiry_idx on public.crm_deals(inquiry_id);
create index if not exists crm_email_templates_owner_idx on public.crm_email_templates(owner_id);
create index if not exists crm_emails_activity_idx on public.crm_emails(activity_id);
create index if not exists crm_emails_inquiry_idx on public.crm_emails(inquiry_id);
create index if not exists crm_emails_owner_idx on public.crm_emails(owner_id);
create index if not exists crm_emails_template_idx on public.crm_emails(template_id);

commit;
