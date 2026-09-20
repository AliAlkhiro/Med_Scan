create or replace function public.get_admin_metrics_summary(p_limit integer default 5)
returns jsonb
language sql
stable
set search_path = public
as $$
  with metric_counts as (
    select
      count(*) filter (where event_type in ('scan_found', 'scan_not_found')) as total_scans,
      count(*) filter (where event_type = 'scan_found') as found_scans,
      count(*) filter (where event_type = 'scan_not_found') as not_found_scans,
      count(*) filter (where event_type = 'attachment_opened') as attachment_opens
    from public.usage_metrics
  ),
  most_scanned_products as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'productId', product_metrics.product_id,
          'tradeName', product_metrics.trade_name,
          'genericName', product_metrics.generic_name,
          'scanCount', product_metrics.scan_count,
          'lastScannedAt', product_metrics.last_scanned_at
        )
        order by product_metrics.scan_count desc, product_metrics.last_scanned_at desc
      ),
      '[]'::jsonb
    ) as items
    from (
      select
        products.id as product_id,
        products.trade_name,
        products.generic_name,
        count(*) as scan_count,
        max(usage_metrics.created_at) as last_scanned_at
      from public.usage_metrics
      join public.products on products.id = usage_metrics.product_id
      where usage_metrics.event_type = 'scan_found'
      group by products.id, products.trade_name, products.generic_name
      order by scan_count desc, last_scanned_at desc
      limit least(greatest(coalesce(p_limit, 5), 1), 25)
    ) product_metrics
  ),
  common_missing_barcodes as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'barcode', missing_metrics.barcode,
          'scanCount', missing_metrics.scan_count,
          'lastScannedAt', missing_metrics.last_scanned_at
        )
        order by missing_metrics.scan_count desc, missing_metrics.last_scanned_at desc
      ),
      '[]'::jsonb
    ) as items
    from (
      select
        usage_metrics.barcode,
        count(*) as scan_count,
        max(usage_metrics.created_at) as last_scanned_at
      from public.usage_metrics
      where usage_metrics.event_type = 'scan_not_found'
        and usage_metrics.barcode is not null
        and length(btrim(usage_metrics.barcode)) > 0
      group by usage_metrics.barcode
      order by scan_count desc, last_scanned_at desc
      limit least(greatest(coalesce(p_limit, 5), 1), 25)
    ) missing_metrics
  )
  select jsonb_build_object(
    'totalScans', coalesce(metric_counts.total_scans, 0),
    'foundScans', coalesce(metric_counts.found_scans, 0),
    'notFoundScans', coalesce(metric_counts.not_found_scans, 0),
    'attachmentOpens', coalesce(metric_counts.attachment_opens, 0),
    'mostScannedProducts', most_scanned_products.items,
    'commonMissingBarcodes', common_missing_barcodes.items
  )
  from metric_counts, most_scanned_products, common_missing_barcodes;
$$;

revoke execute on function public.get_admin_metrics_summary(integer) from public;
grant execute on function public.get_admin_metrics_summary(integer) to authenticated;
