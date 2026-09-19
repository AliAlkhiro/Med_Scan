create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  trade_name text not null,
  generic_name text,
  strength text,
  dosage_form text,
  manufacturer text,
  country_of_origin text,
  pack_description text,
  therapeutic_class text,
  indications text,
  counseling_notes text,
  warnings text,
  contraindications text,
  storage_instructions text,
  application_instructions text,
  extra_notes text,
  is_published boolean not null default false,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create index products_is_published_idx on public.products (is_published);
create index products_updated_at_idx on public.products (updated_at desc);

create table public.product_barcodes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  barcode text not null,
  barcode_type text,
  created_at timestamptz not null default now(),
  constraint product_barcodes_barcode_not_blank check (length(btrim(barcode)) > 0),
  constraint product_barcodes_barcode_unique unique (barcode)
);

create index product_barcodes_product_id_idx on public.product_barcodes (product_id);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null,
  type text not null,
  storage_path text,
  external_url text,
  size_bytes bigint,
  mime_type text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attachments_label_not_blank check (length(btrim(label)) > 0),
  constraint attachments_type_check check (type in ('pdf', 'image', 'video', 'link')),
  constraint attachments_has_location check (num_nonnulls(storage_path, external_url) >= 1),
  constraint attachments_size_bytes_non_negative check (size_bytes is null or size_bytes >= 0)
);

create trigger set_attachments_updated_at
before update on public.attachments
for each row
execute function public.set_updated_at();

create index attachments_product_id_sort_order_idx on public.attachments (product_id, sort_order, created_at);

create table public.usage_metrics (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  barcode text,
  product_id uuid references public.products (id) on delete set null,
  attachment_id uuid references public.attachments (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint usage_metrics_event_type_check check (
    event_type in ('scan_found', 'scan_not_found', 'attachment_opened')
  )
);

create index usage_metrics_created_at_idx on public.usage_metrics (created_at desc);
create index usage_metrics_event_type_created_at_idx on public.usage_metrics (event_type, created_at desc);
create index usage_metrics_product_id_created_at_idx on public.usage_metrics (product_id, created_at desc);
create index usage_metrics_barcode_created_at_idx on public.usage_metrics (barcode, created_at desc);
create index usage_metrics_attachment_id_created_at_idx on public.usage_metrics (attachment_id, created_at desc);

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  constraint admin_users_role_check check (role = 'admin')
);
