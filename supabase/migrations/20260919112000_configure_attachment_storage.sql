insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'attachments',
  'attachments',
  false,
  52428800,
  array[
    'application/pdf',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read published attachment files"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'attachments'
  and exists (
    select 1
    from public.attachments
    join public.products on products.id = attachments.product_id
    where attachments.storage_path = storage.objects.name
      and products.is_published = true
  )
);

create policy "Admins can manage attachment files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'attachments'
  and exists (
    select 1
    from public.admin_users
    where admin_users.auth_user_id = auth.uid()
  )
)
with check (
  bucket_id = 'attachments'
  and exists (
    select 1
    from public.admin_users
    where admin_users.auth_user_id = auth.uid()
  )
);
