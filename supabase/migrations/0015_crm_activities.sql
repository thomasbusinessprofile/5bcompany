-- Round 2 of the CRM: activities (call / email / meeting / whatsapp / note / task)
-- tied to contacts (and later, deals). Tasks have due_at; notes don't.

begin;

create type public.crm_activity_type as enum (
  'call', 'email', 'meeting', 'whatsapp', 'note', 'task'
);

create table public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  type public.crm_activity_type not null,
  subject text,
  body text,
  contact_id uuid references public.crm_contacts(id) on delete cascade,
  company_id uuid references public.crm_companies(id) on delete set null,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  occurred_at timestamptz not null default now(),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_activities_contact_idx on public.crm_activities (contact_id, occurred_at desc);
create index crm_activities_company_idx on public.crm_activities (company_id, occurred_at desc);
create index crm_activities_owner_idx on public.crm_activities (owner_id);
create index crm_activities_due_idx on public.crm_activities (due_at) where due_at is not null and completed_at is null;

create trigger crm_activities_set_updated_at
before update on public.crm_activities
for each row execute function app_private.set_updated_at();

-- When an activity is created against a contact, bump last_contacted_at.
create or replace function app_private.bump_contact_last_contacted()
returns trigger
language plpgsql
security definer
set search_path = public, app_private
as $$
begin
  if new.contact_id is not null and new.type <> 'note' and new.type <> 'task' then
    update public.crm_contacts
       set last_contacted_at = greatest(coalesce(last_contacted_at, new.occurred_at), new.occurred_at)
     where id = new.contact_id;
  end if;
  return new;
end;
$$;

create trigger crm_activities_bump_contact
after insert on public.crm_activities
for each row execute function app_private.bump_contact_last_contacted();

alter table public.crm_activities enable row level security;
grant select, insert, update, delete on public.crm_activities to authenticated;

create policy "crm_activities internal access"
  on public.crm_activities for all
  using (app_private.current_role() in ('admin', 'sales', 'sourcing', 'viewer', 'content_manager'))
  with check (app_private.current_role() in ('admin', 'sales', 'sourcing', 'content_manager'));

commit;
