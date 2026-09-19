import { redirect, type LoaderFunctionArgs } from 'react-router-dom';
import { lookupProductByBarcode, recordScanMetric, type ProductLookupDetails } from '../services/productLookup';

export type ProductPageData = {
  barcode: string;
  product: ProductLookupDetails;
};

export async function productPageLoader({ params }: LoaderFunctionArgs) {
  const barcode = params.barcode?.trim();

  if (!barcode) {
    throw new Error('A barcode is required.');
  }

  const result = await lookupProductByBarcode(barcode);

  try {
    await recordScanMetric(result, barcode);
  } catch (error) {
    console.warn('Unable to record scan metric', error);
  }

  if (result.status === 'not_found') {
    throw redirect(`/not-found/${encodeURIComponent(barcode)}`);
  }

  return {
    barcode,
    product: result.product,
  } satisfies ProductPageData;
}
