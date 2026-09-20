create or replace function public.get_published_attachment_open_target(
  p_attachment_id uuid,
  p_product_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'attachment',
    jsonb_build_object(
      'id', attachments.id,
      'productId', attachments.product_id,
      'storagePath', attachments.storage_path,
      'externalUrl', attachments.external_url
    )
  )
  from public.attachments
  join public.products on products.id = attachments.product_id
  where attachments.id = p_attachment_id
    and attachments.product_id = p_product_id
    and products.is_published = true
  limit 1;
$$;

revoke execute on function public.get_published_attachment_open_target(uuid, uuid) from public;
grant execute on function public.get_published_attachment_open_target(uuid, uuid) to anon, authenticated;
