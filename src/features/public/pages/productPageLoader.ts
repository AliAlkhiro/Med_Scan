import { redirect, type LoaderFunctionArgs } from 'react-router-dom';
import { lookupProductByBarcode, recordScanMetric, type ProductLookupDetails } from '../services/productLookup';
import { getRecentProduct, saveRecentProduct } from '../services/recentProductCache';

export type ProductPageData = {
  barcode: string;
  cachedAt: string | null;
  isCached: boolean;
  product: ProductLookupDetails;
};

export async function productPageLoader({ params }: LoaderFunctionArgs) {
  const barcode = params.barcode?.trim();

  if (!barcode) {
    throw new Error('A barcode is required.');
  }

  let result: Awaited<ReturnType<typeof lookupProductByBarcode>>;

  try {
    result = await lookupProductByBarcode(barcode);
  } catch (error) {
    const cachedProduct = getRecentProduct(barcode);

    if (cachedProduct) {
      return {
        barcode,
        cachedAt: cachedProduct.cachedAt,
        isCached: true,
        product: cachedProduct.product,
      } satisfies ProductPageData;
    }

    throw error;
  }

  try {
    await recordScanMetric(result, barcode);
  } catch (error) {
    console.warn('Unable to record scan metric', error);
  }

  if (result.status === 'not_found') {
    throw redirect(`/not-found/${encodeURIComponent(barcode)}`);
  }

  saveRecentProduct(result.product, barcode);

  return {
    barcode,
    cachedAt: null,
    isCached: false,
    product: result.product,
  } satisfies ProductPageData;
}
