import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button, ErrorState, LoadingState } from '../../../shared/ui';
import { AdminProductForm } from '../components/AdminProductForm';
import {
  getAdminProduct,
  updateAdminProduct,
  type AdminProductDetails,
  type AdminProductFormValues,
} from '../services/adminProducts';

export function AdminProductEditPage() {
  const { id } = useParams();
  const location = useLocation();
  const savedStateMessage =
    location.state && typeof location.state === 'object' && 'savedMessage' in location.state
      ? String(location.state.savedMessage)
      : null;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<AdminProductDetails | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(savedStateMessage);

  const loadProduct = useCallback(async () => {
    if (!id) {
      setError('Product ID is missing.');
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const nextProduct = await getAdminProduct(id);
      setProduct(nextProduct);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Product could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const handleUpdate = async (values: AdminProductFormValues) => {
    if (!id) {
      throw new Error('Product ID is missing.');
    }

    await updateAdminProduct(id, values);
    setSavedMessage(values.isPublished ? 'Product saved and published.' : 'Product saved as draft.');
    await loadProduct();
  };

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Edit product</h2>
          <p className="mt-1 text-sm text-white/60">
            {product ? product.tradeName : id ? `Product ID: ${id}` : 'Product record'}
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/10 hover:bg-white/15 hover:text-white"
          to="/admin/products"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Products
        </Link>
      </div>

      {isLoading ? <LoadingState label="Loading product" /> : null}

      {!isLoading && error ? (
        <ErrorState
          action={
            <Button icon={<RefreshCw aria-hidden="true" size={18} />} onClick={loadProduct} tone="secondary">
              Retry
            </Button>
          }
          message={error}
          title="Product could not be loaded"
        />
      ) : null}

      {!isLoading && !error && product ? (
        <AdminProductForm
          initialValues={product}
          onSubmit={handleUpdate}
          savedMessage={savedMessage}
          submitLabel="Save changes"
        />
      ) : null}
    </section>
  );
}
