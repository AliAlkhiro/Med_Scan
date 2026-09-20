import { getSupabaseClient } from '../../../lib/supabase';

export type AdminMetricsProduct = {
  genericName: string | null;
  lastScannedAt: string | null;
  productId: string;
  scanCount: number;
  tradeName: string;
};

export type AdminMetricsMissingBarcode = {
  barcode: string;
  lastScannedAt: string | null;
  scanCount: number;
};

export type AdminMetricsSummary = {
  attachmentOpens: number;
  commonMissingBarcodes: AdminMetricsMissingBarcode[];
  foundScans: number;
  mostScannedProducts: AdminMetricsProduct[];
  notFoundScans: number;
  totalScans: number;
};

type MetricsProductPayload = {
  genericName?: unknown;
  lastScannedAt?: unknown;
  productId?: unknown;
  scanCount?: unknown;
  tradeName?: unknown;
};

type MissingBarcodePayload = {
  barcode?: unknown;
  lastScannedAt?: unknown;
  scanCount?: unknown;
};

type MetricsSummaryPayload = {
  attachmentOpens?: unknown;
  commonMissingBarcodes?: unknown;
  foundScans?: unknown;
  mostScannedProducts?: unknown;
  notFoundScans?: unknown;
  totalScans?: unknown;
};

function toNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function toNullableString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function toProductMetric(value: unknown): AdminMetricsProduct | null {
  if (!isRecord(value)) {
    return null;
  }

  const product = value as MetricsProductPayload;

  if (typeof product.productId !== 'string' || typeof product.tradeName !== 'string') {
    return null;
  }

  return {
    genericName: toNullableString(product.genericName),
    lastScannedAt: toNullableString(product.lastScannedAt),
    productId: product.productId,
    scanCount: toNumber(product.scanCount),
    tradeName: product.tradeName,
  };
}

function toMissingBarcodeMetric(value: unknown): AdminMetricsMissingBarcode | null {
  if (!isRecord(value)) {
    return null;
  }

  const barcode = value as MissingBarcodePayload;

  if (typeof barcode.barcode !== 'string') {
    return null;
  }

  return {
    barcode: barcode.barcode,
    lastScannedAt: toNullableString(barcode.lastScannedAt),
    scanCount: toNumber(barcode.scanCount),
  };
}

function toAdminMetricsSummary(value: unknown): AdminMetricsSummary {
  const payload = isRecord(value) ? (value as MetricsSummaryPayload) : {};
  const mostScannedProducts = Array.isArray(payload.mostScannedProducts) ? payload.mostScannedProducts : [];
  const commonMissingBarcodes = Array.isArray(payload.commonMissingBarcodes) ? payload.commonMissingBarcodes : [];

  return {
    attachmentOpens: toNumber(payload.attachmentOpens),
    commonMissingBarcodes: commonMissingBarcodes.map(toMissingBarcodeMetric).filter((item): item is AdminMetricsMissingBarcode => Boolean(item)),
    foundScans: toNumber(payload.foundScans),
    mostScannedProducts: mostScannedProducts.map(toProductMetric).filter((item): item is AdminMetricsProduct => Boolean(item)),
    notFoundScans: toNumber(payload.notFoundScans),
    totalScans: toNumber(payload.totalScans),
  };
}

export async function getAdminMetricsSummary({ limit = 5 }: { limit?: number } = {}): Promise<AdminMetricsSummary> {
  const supabase = getSupabaseClient();
  const boundedLimit = Math.min(Math.max(Math.trunc(limit), 1), 25);

  const { data, error } = await supabase.rpc('get_admin_metrics_summary', {
    p_limit: boundedLimit,
  });

  if (error) {
    throw new Error(error.message);
  }

  return toAdminMetricsSummary(data);
}
