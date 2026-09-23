import { Edit3, Plus, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, EmptyState, ErrorState, LoadingState, StatusBadge } from '../../../shared/ui';
import { listAdminProducts, type AdminProductListItem } from '../services/adminProducts';

function formatAdminDate(value: string | null) {
  if (!value) {
    return 'Not reviewed';
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function AdminProductsPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<AdminProductListItem[]>([]);

  const loadProducts = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const nextProducts = await listAdminProducts();
      setProducts(nextProducts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Products could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return (
    <section className="grid gap-5">
      <div>
        <div>
          <h2 className="text-xl font-bold">Products</h2>
          <p className="mt-1 text-sm text-white/60">Manage product records and publication status.</p>
        </div>
      </div>

      {isLoading ? <LoadingState label="Loading products" /> : null}

      {!isLoading && error ? (
        <ErrorState
          action={
            <Button icon={<RefreshCw aria-hidden="true" size={18} />} onClick={loadProducts} tone="secondary">
              Retry
            </Button>
          }
          message={error}
          title="Products could not be loaded"
        />
      ) : null}

      {!isLoading && !error && products.length === 0 ? (
        <EmptyState
          action={
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[linear-gradient(135deg,#123f2d_0%,#156a53_68%,#22c7cc_100%)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-105"
              to="/admin/products/new"
            >
              <Plus aria-hidden="true" size={18} />
              New product
            </Link>
          }
          message="Create the first product record to make it available for review and publishing."
          title="No products yet"
        />
      ) : null}

      {!isLoading && !error && products.length > 0 ? (
        <div className="admin-panel overflow-hidden rounded-xl">
          <div className="hidden grid-cols-[minmax(0,1fr)_160px_160px_120px] gap-4 border-b border-white/10 px-4 py-3 text-sm font-semibold text-white/60 md:grid">
            <span>Product</span>
            <span>Last reviewed</span>
            <span>Updated</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y divide-white/10">
            {products.map((product) => (
              <article
                className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_160px_160px_120px] md:items-center md:gap-4"
                key={product.id}
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                    <Link
                      className="truncate font-semibold text-white underline-offset-4 hover:text-aqua hover:underline"
                      to={`/admin/products/${product.id}`}
                    >
                      {product.tradeName}
                    </Link>
                    <Link
                      aria-label={`Edit ${product.tradeName}`}
                      className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md text-white/50 transition hover:bg-white/10 hover:text-aqua"
                      to={`/admin/products/${product.id}`}
                    >
                      <Edit3 aria-hidden="true" size={16} />
                    </Link>
                  </div>
                  <p className="mt-1 text-sm text-white/50">{product.genericName || 'No generic name recorded'}</p>
                </div>
                <div className="text-sm text-white/65">
                  <span className="font-semibold text-white/50 md:hidden">Last reviewed: </span>
                  {formatAdminDate(product.lastReviewedAt)}
                </div>
                <div className="text-sm text-white/65">
                  <span className="font-semibold text-white/50 md:hidden">Updated: </span>
                  {formatAdminDate(product.updatedAt)}
                </div>
                <div className="md:text-right">
                  <StatusBadge tone={product.isPublished ? 'published' : 'draft'}>
                    {product.isPublished ? 'Published' : 'Draft'}
                  </StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
