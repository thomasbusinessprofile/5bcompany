-- Redirects and CMS support tables
create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  target_path text not null,
  status_code integer default 301,
  created_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size integer,
  alt_text text,
  created_at timestamptz not null default now()
);

-- RLS for Redirects
alter table public.redirects enable row level security;
create policy "anyone can read redirects" on public.redirects for select to public using (true);
create policy "admin can manage redirects" on public.redirects for all to authenticated using (app_private.current_role() = 'admin');

-- RLS for Media Assets
alter table public.media_assets enable row level security;
create policy "anyone can read media" on public.media_assets for select to public using (true);
create policy "admin can manage media" on public.media_assets for all to authenticated using (app_private.current_role() = 'admin');
