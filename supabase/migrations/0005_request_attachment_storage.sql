insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'request-attachments',
  'request-attachments',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "buyers read own request attachment objects"
on storage.objects for select
using (
  bucket_id = 'request-attachments'
  and exists (
    select 1
    from public.sourcing_requests sr
    where sr.id::text = (storage.foldername(name))[1]
      and (
        sr.buyer_id = app_private.current_profile_id()
        or sr.assigned_to = app_private.current_profile_id()
        or app_private.current_role() in ('admin', 'viewer')
      )
  )
);

create policy "buyers upload own request attachment objects"
on storage.objects for insert
with check (
  bucket_id = 'request-attachments'
  and exists (
    select 1
    from public.sourcing_requests sr
    where sr.id::text = (storage.foldername(name))[1]
      and (
        sr.buyer_id = app_private.current_profile_id()
        or sr.assigned_to = app_private.current_profile_id()
        or app_private.current_role() = 'admin'
      )
  )
);
