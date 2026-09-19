create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.auth_user_id = auth.uid()
  );
$$;

create or replace function public.can_read_attachment_object(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.attachments
    join public.products on products.id = attachments.product_id
    where attachments.storage_path = object_name
      and products.is_published = true
  );
$$;

create or replace function public.is_published_product(p_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.products
    where products.id = p_product_id
      and products.is_published = true
  );
$$;

create or replace function public.is_published_attachment(p_attachment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.attachments
    join public.products on products.id = attachments.product_id
    where attachments.id = p_attachment_id
      and products.is_published = true
  );
$$;

create or replace function public.lookup_published_product_by_barcode(lookup_barcode text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'product',
    jsonb_build_object(
      'id', products.id,
      'tradeName', products.trade_name,
      'genericName', products.generic_name,
      'strength', products.strength,
      'dosageForm', products.dosage_form,
      'manufacturer', products.manufacturer,
      'countryOfOrigin', products.country_of_origin,
      'packDescription', products.pack_description,
      'therapeuticClass', products.therapeutic_class,
      'indications', products.indications,
      'counselingNotes', products.counseling_notes,
      'warnings', products.warnings,
      'contraindications', products.contraindications,
      'storageInstructions', products.storage_instructions,
      'applicationInstructions', products.application_instructions,
      'extraNotes', products.extra_notes,
      'lastReviewedAt', products.last_reviewed_at,
      'attachments', coalesce(attachments.items, '[]'::jsonb)
    )
  )
  from public.product_barcodes
  join public.products on products.id = product_barcodes.product_id
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', attachments.id,
        'label', attachments.label,
        'type', attachments.type,
        'externalUrl', attachments.external_url,
        'sizeBytes', attachments.size_bytes,
        'mimeType', attachments.mime_type
      )
      order by attachments.sort_order, attachments.created_at
    ) as items
    from public.attachments
    where attachments.product_id = products.id
  ) attachments on true
  where product_barcodes.barcode = lookup_barcode
    and products.is_published = true
  limit 1;
$$;

alter table public.products enable row level security;
alter table public.product_barcodes enable row level security;
alter table public.attachments enable row level security;
alter table public.usage_metrics enable row level security;
alter table public.admin_users enable row level security;

revoke all on public.products from anon, authenticated;
revoke all on public.product_barcodes from anon, authenticated;
revoke all on public.attachments from anon, authenticated;
revoke all on public.usage_metrics from anon, authenticated;
revoke all on public.admin_users from anon, authenticated;

revoke execute on function public.is_admin() from public;
revoke execute on function public.can_read_attachment_object(text) from public;
revoke execute on function public.is_published_product(uuid) from public;
revoke execute on function public.is_published_attachment(uuid) from public;
revoke execute on function public.lookup_published_product_by_barcode(text) from public;

grant usage on schema public to anon, authenticated;
grant execute on function public.lookup_published_product_by_barcode(text) to anon, authenticated;
grant execute on function public.can_read_attachment_object(text) to anon, authenticated;
grant execute on function public.is_published_product(uuid) to anon, authenticated;
grant execute on function public.is_published_attachment(uuid) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;

grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.product_barcodes to authenticated;
grant select, insert, update, delete on public.attachments to authenticated;
grant select on public.usage_metrics to authenticated;
grant insert on public.usage_metrics to anon, authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;

create policy "Admins can manage products"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage product barcodes"
on public.product_barcodes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage attachments"
on public.attachments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can view usage metrics"
on public.usage_metrics
for select
to authenticated
using (public.is_admin());

create policy "Public can insert anonymous usage metrics"
on public.usage_metrics
for insert
to anon, authenticated
with check (
  (product_id is null or public.is_published_product(product_id))
  and (attachment_id is null or public.is_published_attachment(attachment_id))
);

create policy "Admins can manage admin users"
on public.admin_users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published attachment files" on storage.objects;
drop policy if exists "Admins can manage attachment files" on storage.objects;

create policy "Public can read published attachment files"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'attachments'
  and public.can_read_attachment_object(name)
);

create policy "Admins can manage attachment files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'attachments'
  and public.is_admin()
)
with check (
  bucket_id = 'attachments'
  and public.is_admin()
);
