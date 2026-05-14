-- Round 1 of the in-house CRM: Companies + Contacts + Tags.
--
-- A contact is anyone we have a conversation with — typically a buyer or a
-- prospect — and may or may not have an auth.user / profile yet. RFQ inquiries
-- get auto-linked on insert via trigger; existing inquiries are backfilled in
-- the same migration.

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────
create table public.crm_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  website text,
  industry text,
  size_band text,
  notes text,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_companies_name_idx on public.crm_companies using gin (to_tsvector('simple', name));
create index crm_companies_country_idx on public.crm_companies (country);

create trigger crm_companies_set_updated_at
before update on public.crm_companies
for each row execute function app_private.set_updated_at();

create table public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.crm_companies(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  whatsapp text,
  role_title text,
  source text,
  notes text,
  last_contacted_at timestamptz,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index crm_contacts_email_unique on public.crm_contacts (lower(email)) where email is not null;
create index crm_contacts_company_idx on public.crm_contacts (company_id);
create index crm_contacts_profile_idx on public.crm_contacts (profile_id);
create index crm_contacts_search_idx on public.crm_contacts using gin (to_tsvector('simple', coalesce(full_name,'') || ' ' || coalesce(email,'')));

create trigger crm_contacts_set_updated_at
before update on public.crm_contacts
for each row execute function app_private.set_updated_at();

create table public.crm_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#0f6b46',
  created_at timestamptz not null default now()
);

create table public.crm_contact_tags (
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  tag_id uuid not null references public.crm_tags(id) on delete cascade,
  primary key (contact_id, tag_id)
);

-- Link inquiries to contacts for fast contact-detail rollups.
alter table public.inquiries
  add column if not exists contact_id uuid references public.crm_contacts(id) on delete set null;

create index if not exists inquiries_contact_idx on public.inquiries (contact_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-link inquiries to contacts via email.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function app_private.upsert_contact_from_inquiry()
returns trigger
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_company_id uuid;
  v_contact_id uuid;
begin
  if new.email is null or new.email = '' then
    return new;
  end if;

  -- Find or create company by exact name match.
  if new.company_name is not null and new.company_name <> '' then
    select id into v_company_id
      from public.crm_companies
     where lower(name) = lower(new.company_name)
     limit 1;

    if v_company_id is null then
      insert into public.crm_companies (name, country)
      values (new.company_name, new.country)
      returning id into v_company_id;
    end if;
  end if;

  -- Find or create contact by email.
  select id into v_contact_id
    from public.crm_contacts
   where lower(email) = lower(new.email)
   limit 1;

  if v_contact_id is null then
    insert into public.crm_contacts (
      full_name, email, phone, company_id, source, last_contacted_at
    ) values (
      coalesce(new.full_name, split_part(new.email, '@', 1)),
      new.email,
      new.phone,
      v_company_id,
      coalesce(new.source_page, 'inquiry_form'),
      new.created_at
    )
    returning id into v_contact_id;
  else
    update public.crm_contacts
       set last_contacted_at = greatest(coalesce(last_contacted_at, new.created_at), new.created_at),
           company_id = coalesce(company_id, v_company_id),
           phone = coalesce(phone, new.phone)
     where id = v_contact_id;
  end if;

  new.contact_id := v_contact_id;
  return new;
end;
$$;

drop trigger if exists inquiries_link_contact on public.inquiries;
create trigger inquiries_link_contact
before insert on public.inquiries
for each row execute function app_private.upsert_contact_from_inquiry();

-- Backfill existing inquiries.
do $$
declare
  rec record;
  v_company_id uuid;
  v_contact_id uuid;
begin
  for rec in select * from public.inquiries where contact_id is null and email is not null and email <> '' loop
    v_company_id := null;
    if rec.company_name is not null and rec.company_name <> '' then
      select id into v_company_id
        from public.crm_companies
       where lower(name) = lower(rec.company_name)
       limit 1;
      if v_company_id is null then
        insert into public.crm_companies (name, country)
        values (rec.company_name, rec.country)
        returning id into v_company_id;
      end if;
    end if;

    select id into v_contact_id
      from public.crm_contacts
     where lower(email) = lower(rec.email)
     limit 1;

    if v_contact_id is null then
      insert into public.crm_contacts (
        full_name, email, phone, company_id, source, last_contacted_at, created_at
      ) values (
        coalesce(rec.full_name, split_part(rec.email, '@', 1)),
        rec.email,
        rec.phone,
        v_company_id,
        coalesce(rec.source_page, 'inquiry_form'),
        rec.created_at,
        rec.created_at
      )
      returning id into v_contact_id;
    else
      update public.crm_contacts
         set last_contacted_at = greatest(coalesce(last_contacted_at, rec.created_at), rec.created_at),
             company_id = coalesce(company_id, v_company_id)
       where id = v_contact_id;
    end if;

    update public.inquiries set contact_id = v_contact_id where id = rec.id;
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — internal users only (admin, sales, sourcing, viewer, content_manager).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.crm_companies enable row level security;
alter table public.crm_contacts enable row level security;
alter table public.crm_tags enable row level security;
alter table public.crm_contact_tags enable row level security;

grant select, insert, update, delete on public.crm_companies to authenticated;
grant select, insert, update, delete on public.crm_contacts to authenticated;
grant select, insert, update, delete on public.crm_tags to authenticated;
grant select, insert, update, delete on public.crm_contact_tags to authenticated;

create policy "crm_companies internal access"
  on public.crm_companies for all
  using (app_private.current_role() in ('admin', 'sales', 'sourcing', 'viewer', 'content_manager'))
  with check (app_private.current_role() in ('admin', 'sales', 'sourcing', 'content_manager'));

create policy "crm_contacts internal access"
  on public.crm_contacts for all
  using (app_private.current_role() in ('admin', 'sales', 'sourcing', 'viewer', 'content_manager'))
  with check (app_private.current_role() in ('admin', 'sales', 'sourcing', 'content_manager'));

create policy "crm_tags internal access"
  on public.crm_tags for all
  using (app_private.current_role() in ('admin', 'sales', 'sourcing', 'viewer', 'content_manager'))
  with check (app_private.current_role() in ('admin', 'sales', 'sourcing', 'content_manager'));

create policy "crm_contact_tags internal access"
  on public.crm_contact_tags for all
  using (app_private.current_role() in ('admin', 'sales', 'sourcing', 'viewer', 'content_manager'))
  with check (app_private.current_role() in ('admin', 'sales', 'sourcing', 'content_manager'));

-- Seed a handful of useful tags.
insert into public.crm_tags (name, color) values
  ('VIP', '#b8860b'),
  ('Hot lead', '#c2410c'),
  ('Cold', '#475569'),
  ('Existing buyer', '#0f6b46'),
  ('Partner factory', '#1d4ed8')
on conflict (name) do nothing;

commit;
