create type public.quotation_status as enum (
  'draft',
  'internal_review',
  'approved',
  'sent',
  'accepted',
  'rejected',
  'expired',
  'cancelled'
);

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.sourcing_requests(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  quote_number text not null unique,
  status public.quotation_status not null default 'draft',
  currency text not null default 'USD',
  incoterm text,
  payment_terms text,
  validity_days integer not null default 7,
  lead_time text,
  notes text,
  subtotal numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  product_name text not null,
  description text,
  quantity numeric,
  unit text,
  unit_price numeric,
  amount numeric generated always as (
    coalesce(quantity, 0) * coalesce(unit_price, 0)
  ) stored,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index quotations_request_id_idx on public.quotations (request_id);
create index quotations_buyer_id_idx on public.quotations (buyer_id);
create index quotations_status_idx on public.quotations (status);
create index quotation_items_quotation_id_idx on public.quotation_items (quotation_id);

create trigger quotations_set_updated_at
before update on public.quotations
for each row execute function app_private.set_updated_at();

alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;

grant select, insert, update on public.quotations to authenticated;
grant select, insert, update, delete on public.quotation_items to authenticated;

create policy "quotations read scoped"
on public.quotations for select
using (
  buyer_id = app_private.current_profile_id()
  or created_by = app_private.current_profile_id()
  or app_private.current_role() in ('admin', 'sales', 'sourcing', 'viewer')
);

create policy "quotations staff insert"
on public.quotations for insert
with check (
  created_by = app_private.current_profile_id()
  and app_private.current_role() in ('admin', 'sales', 'sourcing')
);

create policy "quotations staff update"
on public.quotations for update
using (
  app_private.current_role() = 'admin'
  or created_by = app_private.current_profile_id()
)
with check (
  app_private.current_role() = 'admin'
  or created_by = app_private.current_profile_id()
);

create policy "quotation items read scoped"
on public.quotation_items for select
using (
  exists (
    select 1
    from public.quotations q
    where q.id = quotation_items.quotation_id
      and (
        q.buyer_id = app_private.current_profile_id()
        or q.created_by = app_private.current_profile_id()
        or app_private.current_role() in ('admin', 'sales', 'sourcing', 'viewer')
      )
  )
);

create policy "quotation items staff insert"
on public.quotation_items for insert
with check (
  exists (
    select 1
    from public.quotations q
    where q.id = quotation_items.quotation_id
      and (
        app_private.current_role() = 'admin'
        or q.created_by = app_private.current_profile_id()
      )
  )
);

create policy "quotation items staff update"
on public.quotation_items for update
using (
  exists (
    select 1
    from public.quotations q
    where q.id = quotation_items.quotation_id
      and (
        app_private.current_role() = 'admin'
        or q.created_by = app_private.current_profile_id()
      )
  )
)
with check (
  exists (
    select 1
    from public.quotations q
    where q.id = quotation_items.quotation_id
      and (
        app_private.current_role() = 'admin'
        or q.created_by = app_private.current_profile_id()
      )
  )
);

create policy "quotation items staff delete"
on public.quotation_items for delete
using (
  exists (
    select 1
    from public.quotations q
    where q.id = quotation_items.quotation_id
      and (
        app_private.current_role() = 'admin'
        or q.created_by = app_private.current_profile_id()
      )
  )
);
