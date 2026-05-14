-- CMS uploads bucket: products + article hero images.
-- Public read so the website can serve images via
-- /storage/v1/object/public/cms-images/... Internal staff can upload, update,
-- and delete via the admin UI.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-images',
  'cms-images',
  true,
  10 * 1024 * 1024,
  array['image/jpeg','image/png','image/webp','image/avif','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cms_images public read" on storage.objects;
create policy "cms_images public read"
  on storage.objects for select
  using (bucket_id = 'cms-images');

drop policy if exists "cms_images staff upload" on storage.objects;
create policy "cms_images staff upload"
  on storage.objects for insert
  with check (
    bucket_id = 'cms-images'
    and app_private.current_role() in ('admin', 'sales', 'sourcing', 'content_manager')
  );

drop policy if exists "cms_images staff delete" on storage.objects;
create policy "cms_images staff delete"
  on storage.objects for delete
  using (
    bucket_id = 'cms-images'
    and app_private.current_role() in ('admin', 'sales', 'sourcing', 'content_manager')
  );

drop policy if exists "cms_images staff update" on storage.objects;
create policy "cms_images staff update"
  on storage.objects for update
  using (
    bucket_id = 'cms-images'
    and app_private.current_role() in ('admin', 'sales', 'sourcing', 'content_manager')
  )
  with check (
    bucket_id = 'cms-images'
    and app_private.current_role() in ('admin', 'sales', 'sourcing', 'content_manager')
  );
