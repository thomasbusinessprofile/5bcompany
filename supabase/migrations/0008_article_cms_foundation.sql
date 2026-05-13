create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  keyword text,
  seo_title text,
  seo_description text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index articles_status_idx on public.articles (status);
create index articles_published_at_idx on public.articles (published_at desc);

create trigger articles_set_updated_at
before update on public.articles
for each row execute function app_private.set_updated_at();

alter table public.articles enable row level security;

grant select on public.articles to anon, authenticated;
grant insert, update on public.articles to authenticated;

create policy "articles public read published"
on public.articles for select
using (status = 'published' or app_private.current_role() in ('admin', 'content_manager'));

create policy "articles cms insert"
on public.articles for insert
with check (app_private.current_role() in ('admin', 'content_manager'));

create policy "articles cms update"
on public.articles for update
using (app_private.current_role() in ('admin', 'content_manager'))
with check (app_private.current_role() in ('admin', 'content_manager'));

insert into public.articles (
  slug,
  title,
  excerpt,
  body,
  keyword,
  seo_title,
  seo_description,
  status,
  published_at
)
values
  (
    'how-to-source-bamboo-fence-from-vietnam',
    'How to source bamboo fence from Vietnam',
    'Prepare roll size, quantity, destination port, packing label needs, and timeline before requesting a quotation.',
    'Confirm roll height, roll length, finish, packing, retail label requirements, destination port, and target timeline before admin prepares quotation.',
    'Vietnam bamboo fence supplier',
    'How to source bamboo fence from Vietnam',
    'Buyer guide for sourcing bamboo fence from Vietnam with structured request inputs.',
    'published',
    now()
  ),
  (
    'stretch-film-sourcing-checklist',
    'Stretch film sourcing checklist',
    'Clarify thickness, width, length, roll type, color, and monthly quantity before quote preparation.',
    'Prepare thickness, width, roll weight or length, hand roll or machine roll type, color, packing, monthly quantity, and destination port before quotation.',
    'Stretch film supplier Vietnam',
    'Stretch film sourcing checklist',
    'Checklist for buyers preparing stretch film sourcing requests from Vietnam.',
    'published',
    now()
  )
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  keyword = excluded.keyword,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  status = excluded.status,
  published_at = excluded.published_at;
