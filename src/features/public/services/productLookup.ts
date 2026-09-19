import { getSupabaseClient } from '../../../lib/supabase';

export type ProductAttachment = {
  externalUrl: string | null;
  id: string;
  label: string;
  mimeType: string | null;
  sizeBytes: number | null;
  type: 'pdf' | 'image' | 'video' | 'link';
};

export type ProductLookupDetails = {
  applicationInstructions: string | null;
  attachments: ProductAttachment[];
  contraindications: string | null;
  counselingNotes: string | null;
  countryOfOrigin: string | null;
  dosageForm: string | null;
  extraNotes: string | null;
  genericName: string | null;
  id: string;
  indications: string | null;
  lastReviewedAt: string | null;
  manufacturer: string | null;
  packDescription: string | null;
  storageInstructions: string | null;
  strength: string | null;
  therapeuticClass: string | null;
  tradeName: string;
  warnings: string | null;
};

type LookupRpcResponse = {
  product?: ProductLookupDetails | null;
} | null;

export type ProductLookupResult =
  | { product: ProductLookupDetails; status: 'found' }
  | { barcode: string; status: 'not_found' };

export async function lookupProductByBarcode(barcode: string): Promise<ProductLookupResult> {
  const normalizedBarcode = barcode.trim();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc('lookup_published_product_by_barcode', {
    lookup_barcode: normalizedBarcode,
  });

  if (error) {
    throw new Error(error.message);
  }

  const lookup = data as LookupRpcResponse;

  if (!lookup?.product) {
    return {
      barcode: normalizedBarcode,
      status: 'not_found',
    };
  }

  return {
    product: lookup.product,
    status: 'found',
  };
}

export async function recordScanMetric(result: ProductLookupResult, barcode: string) {
  const supabase = getSupabaseClient();
  const normalizedBarcode = barcode.trim();

  const { error } = await supabase.from('usage_metrics').insert({
    barcode: normalizedBarcode,
    event_type: result.status === 'found' ? 'scan_found' : 'scan_not_found',
    product_id: result.status === 'found' ? result.product.id : null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
