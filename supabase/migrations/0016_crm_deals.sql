-- Round 3 of the CRM: deals + Kanban pipeline.

begin;

create table public.crm_deal_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null,
  win_probability integer not null default 0,
  is_won boolean not null default false,
  is_lost boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.crm_deal_stages (name, sort_order, win_probability, is_won, is_lost) values
  ('Lead', 1, 10, false, false),
  ('Qualified', 2, 25, false, false),
  ('Sample sent', 3, 40, false, false),
  ('Quotation sent', 4, 60, false, false),
  ('LOI / negotiating', 5, 80, false, false),
  ('Won', 6, 100, true, false),
  ('Lost', 7, 0, false, true);

create table public.crm_deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company_id uuid references public.crm_companies(id) on delete set null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  stage_id uuid not null references public.crm_deal_stages(id),
  value_usd numeric(12, 2),
  currency text default 'USD',
  product_summary text,
  expected_close_date date,
  closed_at timestamptz,
  lost_reason text,
  source text,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_deals_stage_idx on public.crm_deals (stage_id);
create index crm_deals_company_idx on public.crm_deals (company_id);
create index crm_deals_contact_idx on public.crm_deals (contact_id);
create index crm_deals_owner_idx on public.crm_deals (owner_id);

create trigger crm_deals_set_updated_at
before update on public.crm_deals
for each row execute function app_private.set_updated_at();

-- When stage flips to won/lost, stamp closed_at. When flipped back, clear it.
create or replace function app_private.stamp_deal_closed_at()
returns trigger
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_closing boolean;
begin
  select (is_won or is_lost) into v_closing from public.crm_deal_stages where id = new.stage_id;
  if v_closing and new.closed_at is null then
    new.closed_at := now();
  elsif not v_closing then
    new.closed_at := null;
  end if;
  return new;
end;
$$;

create trigger crm_deals_stamp_closed
before insert or update of stage_id on public.crm_deals
for each row execute function app_private.stamp_deal_closed_at();

-- Link activities to deals (column added retroactively so Round 2 stays small).
alter table public.crm_activities
  add column if not exists deal_id uuid references public.crm_deals(id) on delete set null;
create index if not exists crm_activities_deal_idx on public.crm_activities (deal_id, occurred_at desc);

alter table public.crm_deals enable row level security;
alter table public.crm_deal_stages enable row level security;
grant select, insert, update, delete on public.crm_deals to authenticated;
grant select on public.crm_deal_stages to authenticated;

create policy "crm_deals internal access"
  on public.crm_deals for all
  using (app_private.current_role() in ('admin', 'sales', 'sourcing', 'viewer', 'content_manager'))
  with check (app_private.current_role() in ('admin', 'sales', 'sourcing', 'content_manager'));

create policy "crm_deal_stages internal read"
  on public.crm_deal_stages for select
  using (app_private.current_role() in ('admin', 'sales', 'sourcing', 'viewer', 'content_manager'));

commit;
