-- Analytics Events Table
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  properties jsonb default '{}'::jsonb,
  session_id text,
  created_at timestamp with time zone default now() not null
);

-- RLS
alter table public.analytics_events enable row level security;

-- Public can insert events anonymously or logged in
create policy "Anyone can insert analytics events"
  on public.analytics_events
  for insert
  to public
  with check (true);

-- Only admin and higher can view events
create policy "Admins can view analytics events"
  on public.analytics_events
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
      and profiles.role in ('admin', 'sales', 'sourcing', 'viewer')
    )
  );

create index analytics_events_event_name_idx on public.analytics_events(event_name);
create index analytics_events_created_at_idx on public.analytics_events(created_at desc);
