import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminProductForm } from '../components/AdminProductForm';
import { createAdminProduct, createEmptyProductFormValues, type AdminProductFormValues } from '../services/adminProducts';

export function AdminProductNewPage() {
  const navigate = useNavigate();

  const handleCreate = async (values: AdminProductFormValues) => {
    const productId = await createAdminProduct(values);
    navigate(`/admin/products/${productId}`, {
      replace: true,
      state: { savedMessage: values.isPublished ? 'Product created and published.' : 'Draft product created.' },
    });
  };

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">New product</h2>
          <p className="mt-1 text-sm text-white/60">Create a draft or publish once the required lookup fields are ready.</p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/10 hover:bg-white/15 hover:text-white"
          to="/admin/products"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Products
        </Link>
      </div>
      <AdminProductForm initialValues={createEmptyProductFormValues()} onSubmit={handleCreate} />
    </section>
  );
}
