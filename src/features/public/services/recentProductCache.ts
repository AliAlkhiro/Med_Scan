import type { ProductLookupDetails } from './productLookup';

const RECENT_PRODUCT_CACHE_KEY = 'med-scan:recent-product';

export type RecentProductCacheEntry = {
  barcode: string;
  cachedAt: string;
  product: ProductLookupDetails;
};

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function saveRecentProduct(product: ProductLookupDetails, barcode: string) {
  if (!canUseLocalStorage()) {
    return;
  }

  const entry: RecentProductCacheEntry = {
    barcode,
    cachedAt: new Date().toISOString(),
    product,
  };

  try {
    window.localStorage.setItem(RECENT_PRODUCT_CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.warn('Unable to cache recent product', error);
  }
}

export function getRecentProduct(barcode: string) {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const cachedValue = window.localStorage.getItem(RECENT_PRODUCT_CACHE_KEY);

    if (!cachedValue) {
      return null;
    }

    const entry = JSON.parse(cachedValue) as Partial<RecentProductCacheEntry>;

    if (entry.barcode !== barcode || !entry.cachedAt || !entry.product?.id || !entry.product.tradeName) {
      return null;
    }

    return entry as RecentProductCacheEntry;
  } catch (error) {
    console.warn('Unable to read recent product cache', error);
    return null;
  }
}
