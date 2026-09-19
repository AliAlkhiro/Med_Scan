insert into public.products (
  id,
  trade_name,
  generic_name,
  strength,
  dosage_form,
  manufacturer,
  country_of_origin,
  pack_description,
  therapeutic_class,
  indications,
  counseling_notes,
  warnings,
  contraindications,
  storage_instructions,
  application_instructions,
  extra_notes,
  is_published,
  last_reviewed_at
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'Demo Paracetamol',
    'Paracetamol',
    '500 mg',
    'Tablet',
    'Med Scan Demo Pharma',
    'Iraq',
    'Blister pack of 20 tablets',
    'Analgesic and antipyretic',
    'Demo reference record for mild pain and fever support information.',
    'Check other paracetamol-containing products to avoid duplicate dosing.',
    'Do not exceed locally approved daily dosing limits. Use clinical judgment for liver disease risk.',
    'Known hypersensitivity to paracetamol.',
    'Store below 25 C in a dry place.',
    'Use according to local labeling and pharmacist counseling.',
    'Seed product for scanner, product detail, barcode alias, and attachment UI testing.',
    true,
    '2026-09-19 00:00:00+00'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Draft Demo Antibiotic',
    'Amoxicillin',
    '250 mg/5 mL',
    'Powder for oral suspension',
    'Med Scan Demo Pharma',
    'Iraq',
    'Bottle for reconstitution',
    'Antibacterial',
    'Draft-only seed record for testing unpublished lookup behavior.',
    null,
    'Draft content should not be visible in the public pharmacist flow.',
    null,
    'Store as directed on approved product labeling.',
    'Reconstitute and use according to approved product labeling.',
    'Seed draft product. Public lookup must behave as not found.',
    false,
    null
  )
on conflict (id) do update
set
  trade_name = excluded.trade_name,
  generic_name = excluded.generic_name,
  strength = excluded.strength,
  dosage_form = excluded.dosage_form,
  manufacturer = excluded.manufacturer,
  country_of_origin = excluded.country_of_origin,
  pack_description = excluded.pack_description,
  therapeutic_class = excluded.therapeutic_class,
  indications = excluded.indications,
  counseling_notes = excluded.counseling_notes,
  warnings = excluded.warnings,
  contraindications = excluded.contraindications,
  storage_instructions = excluded.storage_instructions,
  application_instructions = excluded.application_instructions,
  extra_notes = excluded.extra_notes,
  is_published = excluded.is_published,
  last_reviewed_at = excluded.last_reviewed_at;

insert into public.product_barcodes (
  id,
  product_id,
  barcode,
  barcode_type
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '5901234123457',
    'EAN-13'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    '96385074',
    'EAN-8'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000002',
    '4006381333931',
    'EAN-13'
  )
on conflict (barcode) do update
set
  product_id = excluded.product_id,
  barcode_type = excluded.barcode_type;

insert into public.attachments (
  id,
  product_id,
  label,
  type,
  storage_path,
  external_url,
  size_bytes,
  mime_type,
  sort_order
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Demo patient leaflet',
    'pdf',
    'seed/demo-paracetamol-leaflet.pdf',
    null,
    245760,
    'application/pdf',
    10
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'Demo product image',
    'image',
    'seed/demo-paracetamol-pack.png',
    null,
    98304,
    'image/png',
    20
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    'Demo external reference',
    'link',
    null,
    'https://example.com/med-scan/demo-paracetamol',
    null,
    null,
    30
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000002',
    'Draft-only leaflet',
    'pdf',
    'seed/draft-demo-antibiotic-leaflet.pdf',
    null,
    196608,
    'application/pdf',
    10
  )
on conflict (id) do update
set
  product_id = excluded.product_id,
  label = excluded.label,
  type = excluded.type,
  storage_path = excluded.storage_path,
  external_url = excluded.external_url,
  size_bytes = excluded.size_bytes,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order;
