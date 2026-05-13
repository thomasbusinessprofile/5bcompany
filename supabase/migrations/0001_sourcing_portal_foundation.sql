-- Sourcing portal foundation schema for Supabase.
-- Apply in a new Supabase project after reviewing policies for the real team roles.

create extension if not exists "pgcrypto";

create schema if not exists app_private;

create type public.profile_role as enum (
  'buyer',
  'admin',
  'sales',
  'sourcing',
  'content_manager',
  'viewer'
);

create type public.business_type as enum (
  'importer',
  'distributor',
  'wholesaler',
  'retailer',
  'manufacturer',
  'sourcing_agent',
  'other'
);

create type public.request_status as enum (
  'new',
  'ai_structured',
  'admin_review',
  'need_more_info',
  'sourcing_in_progress',
  'quotation_preparing',
  'quotation_sent',
  'sample_discussion',
  'negotiating',
  'won',
  'lost',
  'closed',
  'spam'
);

create type public.request_priority as enum (
  'low',
  'medium',
  'high',
  'strategic'
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  country text,
  phone text,
  whatsapp text,
  business_type public.business_type,
  role public.profile_role not null default 'buyer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id) on delete set null,
  slug text not null unique,
  name text not null,
  short_description text,
  long_description text,
  applications jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '[]'::jsonb,
  packing_options jsonb not null default '[]'::jsonb,
  moq text,
  lead_time text,
  documents jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  company_name text,
  email text,
  phone text,
  country text,
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  quantity text,
  destination_port text,
  packing_requirement text,
  message text,
  source_page text,
  status text not null default 'new',
  priority public.request_priority not null default 'medium',
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sourcing_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  request_type text not null default 'product_sourcing',
  category_id uuid references public.product_categories(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  description text,
  target_quantity numeric,
  unit text,
  destination_country text,
  destination_port text,
  incoterm text,
  packing_requirement text,
  quality_requirement text,
  document_requirement text,
  target_price numeric,
  timeline text,
  status public.request_status not null default 'new',
  priority public.request_priority not null default 'medium',
  lead_score integer,
  ai_summary text,
  ai_missing_fields jsonb not null default '[]'::jsonb,
  ai_suggested_products jsonb not null default '[]'::jsonb,
  assigned_to uuid references public.profiles(id) on delete set null,
  source text not null default 'buyer_portal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sourcing_requests_lead_score_range check (lead_score is null or (lead_score >= 0 and lead_score <= 100))
);

create table public.request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.sourcing_requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_role public.profile_role not null,
  message text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now(),
  constraint request_messages_message_length check (char_length(message) <= 2000)
);

create table public.request_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.sourcing_requests(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default now(),
  constraint request_attachments_file_size check (file_size is null or file_size <= 10485760)
);

create table public.request_status_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.sourcing_requests(id) on delete cascade,
  old_status public.request_status,
  new_status public.request_status not null,
  changed_by uuid not null references public.profiles(id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

create index sourcing_requests_buyer_id_idx on public.sourcing_requests (buyer_id);
create index sourcing_requests_status_idx on public.sourcing_requests (status);
create index sourcing_requests_assigned_to_idx on public.sourcing_requests (assigned_to);
create index request_messages_request_id_idx on public.request_messages (request_id, created_at);
create index request_attachments_request_id_idx on public.request_attachments (request_id);
create index request_status_history_request_id_idx on public.request_status_history (request_id, created_at);

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function app_private.set_updated_at();

create trigger product_categories_set_updated_at
before update on public.product_categories
for each row execute function app_private.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function app_private.set_updated_at();

create trigger inquiries_set_updated_at
before update on public.inquiries
for each row execute function app_private.set_updated_at();

create trigger sourcing_requests_set_updated_at
before update on public.sourcing_requests
for each row execute function app_private.set_updated_at();

create or replace function app_private.prevent_self_role_change()
returns trigger
language plpgsql
security definer
set search_path = public, app_private
as $$
begin
  if auth.uid() = old.user_id and new.role is distinct from old.role then
    raise exception 'Users cannot change their own role';
  end if;

  return new;
end;
$$;

create trigger profiles_prevent_self_role_change
before update on public.profiles
for each row execute function app_private.prevent_self_role_change();

create or replace function app_private.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public, app_private
as $$
  select id from public.profiles where user_id = auth.uid()
$$;

create or replace function app_private.current_role()
returns public.profile_role
language sql
stable
security definer
set search_path = public, app_private
as $$
  select role from public.profiles where user_id = auth.uid()
$$;

create or replace function app_private.is_admin_like()
returns boolean
language sql
stable
security definer
set search_path = public, app_private
as $$
  select coalesce(app_private.current_role() in ('admin', 'sales', 'sourcing', 'viewer'), false)
$$;

alter table public.profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.inquiries enable row level security;
alter table public.sourcing_requests enable row level security;
alter table public.request_messages enable row level security;
alter table public.request_attachments enable row level security;
alter table public.request_status_history enable row level security;

grant usage on schema app_private to anon, authenticated;
grant execute on all functions in schema app_private to anon, authenticated;

grant select on public.product_categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.sourcing_requests to authenticated;
grant select, insert on public.request_messages to authenticated;
grant select, insert on public.request_attachments to authenticated;
grant select, insert on public.request_status_history to authenticated;

create policy "profiles read own or admin-like"
on public.profiles for select
using (user_id = auth.uid() or app_private.is_admin_like());

create policy "profiles update own buyer fields"
on public.profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid() and role = app_private.current_role());

create policy "profiles insert own"
on public.profiles for insert
with check (user_id = auth.uid() and role = 'buyer');

create policy "product categories public read published"
on public.product_categories for select
using (status = 'published' or app_private.is_admin_like());

create policy "products public read published"
on public.products for select
using (status = 'published' or app_private.is_admin_like());

create policy "inquiries public insert"
on public.inquiries for insert
with check (true);

create policy "inquiries admin-like read"
on public.inquiries for select
using (app_private.is_admin_like());

create policy "inquiries admin-like update"
on public.inquiries for update
using (app_private.current_role() in ('admin', 'sales'))
with check (app_private.current_role() in ('admin', 'sales'));

create policy "sourcing requests read own or assigned"
on public.sourcing_requests for select
using (
  buyer_id = app_private.current_profile_id()
  or assigned_to = app_private.current_profile_id()
  or app_private.current_role() in ('admin', 'viewer')
);

create policy "sourcing requests buyer insert own"
on public.sourcing_requests for insert
with check (buyer_id = app_private.current_profile_id());

create policy "sourcing requests buyer update own draft fields"
on public.sourcing_requests for update
using (buyer_id = app_private.current_profile_id() and status in ('new', 'need_more_info', 'admin_review'))
with check (
  buyer_id = app_private.current_profile_id()
  and assigned_to is null
  and lead_score is null
  and status in ('new', 'need_more_info', 'admin_review')
);

create policy "sourcing requests staff update assigned"
on public.sourcing_requests for update
using (
  app_private.current_role() = 'admin'
  or assigned_to = app_private.current_profile_id()
)
with check (
  app_private.current_role() = 'admin'
  or assigned_to = app_private.current_profile_id()
);

create policy "messages read visible own or assigned"
on public.request_messages for select
using (
  exists (
    select 1
    from public.sourcing_requests sr
    where sr.id = request_messages.request_id
      and (
        (sr.buyer_id = app_private.current_profile_id() and request_messages.is_internal = false)
        or sr.assigned_to = app_private.current_profile_id()
        or app_private.current_role() in ('admin', 'viewer')
      )
  )
);

create policy "messages insert scoped"
on public.request_messages for insert
with check (
  sender_id = app_private.current_profile_id()
  and (
    (app_private.current_role() = 'buyer' and is_internal = false)
    or app_private.current_role() in ('admin', 'sales', 'sourcing')
  )
  and exists (
    select 1
    from public.sourcing_requests sr
    where sr.id = request_messages.request_id
      and (
        sr.buyer_id = app_private.current_profile_id()
        or sr.assigned_to = app_private.current_profile_id()
        or app_private.current_role() = 'admin'
      )
  )
);

create policy "attachments read scoped"
on public.request_attachments for select
using (
  exists (
    select 1
    from public.sourcing_requests sr
    where sr.id = request_attachments.request_id
      and (
        sr.buyer_id = app_private.current_profile_id()
        or sr.assigned_to = app_private.current_profile_id()
        or app_private.current_role() in ('admin', 'viewer')
      )
  )
);

create policy "attachments insert scoped"
on public.request_attachments for insert
with check (
  uploaded_by = app_private.current_profile_id()
  and exists (
    select 1
    from public.sourcing_requests sr
    where sr.id = request_attachments.request_id
      and (
        sr.buyer_id = app_private.current_profile_id()
        or sr.assigned_to = app_private.current_profile_id()
        or app_private.current_role() = 'admin'
      )
  )
);

create policy "status history read scoped"
on public.request_status_history for select
using (
  exists (
    select 1
    from public.sourcing_requests sr
    where sr.id = request_status_history.request_id
      and (
        sr.buyer_id = app_private.current_profile_id()
        or sr.assigned_to = app_private.current_profile_id()
        or app_private.current_role() in ('admin', 'viewer')
      )
  )
);

create policy "status history insert staff"
on public.request_status_history for insert
with check (
  changed_by = app_private.current_profile_id()
  and app_private.current_role() in ('admin', 'sales', 'sourcing')
);
