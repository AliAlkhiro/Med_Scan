import { getSupabaseClient } from '../../../lib/supabase';

export type AdminProductListItem = {
  genericName: string | null;
  id: string;
  isPublished: boolean;
  lastReviewedAt: string | null;
  tradeName: string;
  updatedAt: string;
};

export type AdminProductBarcodeValues = {
  barcode: string;
  barcodeType: string;
  id?: string;
};

export type AdminProductAttachmentValues = {
  externalUrl: string;
  id?: string;
  label: string;
  mimeType: string;
  sizeBytes: string;
  storagePath: string;
  type: string;
};

export type AdminProductFormValues = {
  applicationInstructions: string;
  attachments: AdminProductAttachmentValues[];
  barcodes: AdminProductBarcodeValues[];
  contraindications: string;
  counselingNotes: string;
  countryOfOrigin: string;
  dosageForm: string;
  extraNotes: string;
  genericName: string;
  indications: string;
  isPublished: boolean;
  lastReviewedAt: string;
  manufacturer: string;
  packDescription: string;
  storageInstructions: string;
  strength: string;
  therapeuticClass: string;
  tradeName: string;
  warnings: string;
};

export type AdminProductDetails = AdminProductFormValues & {
  id: string;
  updatedAt: string;
};

type ProductRow = {
  application_instructions?: string | null;
  contraindications?: string | null;
  counseling_notes?: string | null;
  country_of_origin?: string | null;
  dosage_form?: string | null;
  extra_notes?: string | null;
  generic_name: string | null;
  id: string;
  indications?: string | null;
  is_published: boolean;
  last_reviewed_at: string | null;
  manufacturer?: string | null;
  pack_description?: string | null;
  storage_instructions?: string | null;
  strength?: string | null;
  therapeutic_class?: string | null;
  trade_name: string;
  updated_at: string;
  warnings?: string | null;
};

type BarcodeRow = {
  barcode: string;
  barcode_type: string | null;
  id: string;
};

type AttachmentRow = {
  external_url: string | null;
  id: string;
  label: string;
  mime_type: string | null;
  size_bytes: number | null;
  storage_path: string | null;
  type: string;
};

type ProductMutation = {
  application_instructions: string | null;
  contraindications: string | null;
  counseling_notes: string | null;
  country_of_origin: string | null;
  dosage_form: string | null;
  extra_notes: string | null;
  generic_name: string | null;
  indications: string | null;
  is_published: boolean;
  last_reviewed_at: string | null;
  manufacturer: string | null;
  pack_description: string | null;
  storage_instructions: string | null;
  strength: string | null;
  therapeutic_class: string | null;
  trade_name: string;
  warnings: string | null;
};

export async function listAdminProducts(): Promise<AdminProductListItem[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select('id, trade_name, generic_name, is_published, last_reviewed_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as ProductRow[]).map((product) => ({
    genericName: product.generic_name,
    id: product.id,
    isPublished: product.is_published,
    lastReviewedAt: product.last_reviewed_at,
    tradeName: product.trade_name,
    updatedAt: product.updated_at,
  }));
}

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeDate(value: string) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function normalizeOptionalNumber(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? Number(trimmed) : null;
}

function toDateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : '';
}

function toProductMutation(values: AdminProductFormValues): ProductMutation {
  return {
    application_instructions: normalizeOptional(values.applicationInstructions),
    contraindications: normalizeOptional(values.contraindications),
    counseling_notes: normalizeOptional(values.counselingNotes),
    country_of_origin: normalizeOptional(values.countryOfOrigin),
    dosage_form: normalizeOptional(values.dosageForm),
    extra_notes: normalizeOptional(values.extraNotes),
    generic_name: normalizeOptional(values.genericName),
    indications: normalizeOptional(values.indications),
    is_published: values.isPublished,
    last_reviewed_at: normalizeDate(values.lastReviewedAt),
    manufacturer: normalizeOptional(values.manufacturer),
    pack_description: normalizeOptional(values.packDescription),
    storage_instructions: normalizeOptional(values.storageInstructions),
    strength: normalizeOptional(values.strength),
    therapeutic_class: normalizeOptional(values.therapeuticClass),
    trade_name: values.tradeName.trim(),
    warnings: normalizeOptional(values.warnings),
  };
}

function getDuplicateBarcodeMessage(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
    return 'That barcode is already assigned to another product.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Product could not be saved.';
}

export function createEmptyBarcode(): AdminProductBarcodeValues {
  return {
    barcode: '',
    barcodeType: '',
  };
}

export function createEmptyAttachment(): AdminProductAttachmentValues {
  return {
    externalUrl: '',
    label: '',
    mimeType: '',
    sizeBytes: '',
    storagePath: '',
    type: 'pdf',
  };
}

export function createEmptyProductFormValues(): AdminProductFormValues {
  return {
    applicationInstructions: '',
    attachments: [],
    barcodes: [createEmptyBarcode()],
    contraindications: '',
    counselingNotes: '',
    countryOfOrigin: '',
    dosageForm: '',
    extraNotes: '',
    genericName: '',
    indications: '',
    isPublished: false,
    lastReviewedAt: '',
    manufacturer: '',
    packDescription: '',
    storageInstructions: '',
    strength: '',
    therapeuticClass: '',
    tradeName: '',
    warnings: '',
  };
}

export async function getAdminProduct(productId: string): Promise<AdminProductDetails> {
  const supabase = getSupabaseClient();

  const { data: product, error } = await supabase
    .from('products')
    .select(
      `
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
        last_reviewed_at,
        updated_at
      `,
    )
    .eq('id', productId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data: barcodes, error: barcodeError } = await supabase
    .from('product_barcodes')
    .select('id, barcode, barcode_type')
    .eq('product_id', productId)
    .order('created_at', { ascending: true });

  if (barcodeError) {
    throw new Error(barcodeError.message);
  }

  const { data: attachments, error: attachmentError } = await supabase
    .from('attachments')
    .select('id, label, type, storage_path, external_url, size_bytes, mime_type')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (attachmentError) {
    throw new Error(attachmentError.message);
  }

  const productRow = product as ProductRow;
  const productBarcodes = ((barcodes ?? []) as BarcodeRow[]).map((barcode) => ({
    barcode: barcode.barcode,
    barcodeType: barcode.barcode_type ?? '',
    id: barcode.id,
  }));
  const productAttachments = ((attachments ?? []) as AttachmentRow[]).map((attachment) => ({
    externalUrl: attachment.external_url ?? '',
    id: attachment.id,
    label: attachment.label,
    mimeType: attachment.mime_type ?? '',
    sizeBytes: attachment.size_bytes === null ? '' : String(attachment.size_bytes),
    storagePath: attachment.storage_path ?? '',
    type: attachment.type,
  }));

  return {
    applicationInstructions: productRow.application_instructions ?? '',
    attachments: productAttachments,
    barcodes: productBarcodes.length > 0 ? productBarcodes : [createEmptyBarcode()],
    contraindications: productRow.contraindications ?? '',
    counselingNotes: productRow.counseling_notes ?? '',
    countryOfOrigin: productRow.country_of_origin ?? '',
    dosageForm: productRow.dosage_form ?? '',
    extraNotes: productRow.extra_notes ?? '',
    genericName: productRow.generic_name ?? '',
    id: productRow.id,
    indications: productRow.indications ?? '',
    isPublished: productRow.is_published,
    lastReviewedAt: toDateInputValue(productRow.last_reviewed_at),
    manufacturer: productRow.manufacturer ?? '',
    packDescription: productRow.pack_description ?? '',
    storageInstructions: productRow.storage_instructions ?? '',
    strength: productRow.strength ?? '',
    therapeuticClass: productRow.therapeutic_class ?? '',
    tradeName: productRow.trade_name,
    updatedAt: productRow.updated_at,
    warnings: productRow.warnings ?? '',
  };
}

function toBarcodeMutations(productId: string, values: AdminProductFormValues) {
  return values.barcodes
    .map((barcode) => ({
      barcode: barcode.barcode.trim(),
      barcode_type: normalizeOptional(barcode.barcodeType),
      id: barcode.id,
      product_id: productId,
    }))
    .filter((barcode) => barcode.barcode.length > 0);
}

function toAttachmentMutations(productId: string, values: AdminProductFormValues) {
  return values.attachments.map((attachment, index) => ({
    external_url: normalizeOptional(attachment.externalUrl),
    id: attachment.id,
    label: attachment.label.trim(),
    mime_type: normalizeOptional(attachment.mimeType),
    product_id: productId,
    size_bytes: normalizeOptionalNumber(attachment.sizeBytes),
    sort_order: index,
    storage_path: normalizeOptional(attachment.storagePath),
    type: attachment.type,
  }));
}

export async function createAdminProduct(values: AdminProductFormValues): Promise<string> {
  const supabase = getSupabaseClient();

  const { data: product, error } = await supabase
    .from('products')
    .insert(toProductMutation(values))
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const productId = (product as { id: string }).id;
  const barcodes = toBarcodeMutations(productId, values).map((barcode) => ({
    barcode: barcode.barcode,
    barcode_type: barcode.barcode_type,
    product_id: barcode.product_id,
  }));

  if (barcodes.length > 0) {
    const { error: barcodeError } = await supabase.from('product_barcodes').insert(barcodes);

    if (barcodeError) {
      await supabase.from('products').delete().eq('id', productId);
      throw new Error(getDuplicateBarcodeMessage(barcodeError));
    }
  }

  const attachments = toAttachmentMutations(productId, values).map((attachment) => ({
    external_url: attachment.external_url,
    label: attachment.label,
    mime_type: attachment.mime_type,
    product_id: attachment.product_id,
    size_bytes: attachment.size_bytes,
    sort_order: attachment.sort_order,
    storage_path: attachment.storage_path,
    type: attachment.type,
  }));

  if (attachments.length > 0) {
    const { error: attachmentError } = await supabase.from('attachments').insert(attachments);

    if (attachmentError) {
      await supabase.from('products').delete().eq('id', productId);
      throw new Error(attachmentError.message);
    }
  }

  return productId;
}

export async function updateAdminProduct(productId: string, values: AdminProductFormValues): Promise<void> {
  const supabase = getSupabaseClient();

  const { data: existingBarcodes, error: loadBarcodeError } = await supabase
    .from('product_barcodes')
    .select('id, barcode, barcode_type')
    .eq('product_id', productId)
    .order('created_at', { ascending: true });

  if (loadBarcodeError) {
    throw new Error(loadBarcodeError.message);
  }

  const existingBarcodeRows = (existingBarcodes ?? []) as BarcodeRow[];
  const nextBarcodes = toBarcodeMutations(productId, values);
  const nextBarcodeIds = new Set(nextBarcodes.map((barcode) => barcode.id).filter(Boolean));
  const removedBarcodeIds = existingBarcodeRows
    .map((barcode) => barcode.id)
    .filter((barcodeId) => !nextBarcodeIds.has(barcodeId));

  if (removedBarcodeIds.length > 0) {
    const { error: deleteError } = await supabase.from('product_barcodes').delete().in('id', removedBarcodeIds);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  for (const barcode of nextBarcodes) {
    if (barcode.id) {
      const { error: updateBarcodeError } = await supabase
        .from('product_barcodes')
        .update({
          barcode: barcode.barcode,
          barcode_type: barcode.barcode_type,
        })
        .eq('id', barcode.id);

      if (updateBarcodeError) {
        throw new Error(getDuplicateBarcodeMessage(updateBarcodeError));
      }

      continue;
    }

    const { error: insertBarcodeError } = await supabase.from('product_barcodes').insert({
      barcode: barcode.barcode,
      barcode_type: barcode.barcode_type,
      product_id: productId,
    });

    if (insertBarcodeError) {
      throw new Error(getDuplicateBarcodeMessage(insertBarcodeError));
    }
  }

  const { data: existingAttachments, error: loadAttachmentError } = await supabase
    .from('attachments')
    .select('id, label, type, storage_path, external_url, size_bytes, mime_type')
    .eq('product_id', productId);

  if (loadAttachmentError) {
    throw new Error(loadAttachmentError.message);
  }

  const existingAttachmentRows = (existingAttachments ?? []) as AttachmentRow[];
  const nextAttachments = toAttachmentMutations(productId, values);
  const nextAttachmentIds = new Set(nextAttachments.map((attachment) => attachment.id).filter(Boolean));
  const removedAttachmentIds = existingAttachmentRows
    .map((attachment) => attachment.id)
    .filter((attachmentId) => !nextAttachmentIds.has(attachmentId));

  if (removedAttachmentIds.length > 0) {
    const { error: deleteAttachmentError } = await supabase.from('attachments').delete().in('id', removedAttachmentIds);

    if (deleteAttachmentError) {
      throw new Error(deleteAttachmentError.message);
    }
  }

  for (const attachment of nextAttachments) {
    const mutation = {
      external_url: attachment.external_url,
      label: attachment.label,
      mime_type: attachment.mime_type,
      size_bytes: attachment.size_bytes,
      sort_order: attachment.sort_order,
      storage_path: attachment.storage_path,
      type: attachment.type,
    };

    if (attachment.id) {
      const { error: updateAttachmentError } = await supabase.from('attachments').update(mutation).eq('id', attachment.id);

      if (updateAttachmentError) {
        throw new Error(updateAttachmentError.message);
      }

      continue;
    }

    const { error: insertAttachmentError } = await supabase.from('attachments').insert({
      ...mutation,
      product_id: productId,
    });

    if (insertAttachmentError) {
      throw new Error(insertAttachmentError.message);
    }
  }

  const { error } = await supabase.from('products').update(toProductMutation(values)).eq('id', productId);

  if (error) {
    throw new Error(error.message);
  }
}
