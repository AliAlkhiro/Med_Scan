import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState, StatusBadge } from '../../../shared/ui';

export function AdminProductsPage() {
  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Products</h2>
          <p className="mt-1 text-sm text-slate-600">Manage product records and publication status.</p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-palm px-4 py-2 text-sm font-semibold text-white"
          to="/admin/products/new"
        >
          <Plus aria-hidden="true" size={18} />
          New product
        </Link>
      </div>

      <div className="rounded-md bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
          <span>Product</span>
          <span>Status</span>
        </div>
        <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4">
          <div>
            <p className="font-semibold">Sample published product</p>
            <p className="text-sm text-slate-500">Seed data will replace this row.</p>
          </div>
          <StatusBadge tone="published">Published</StatusBadge>
        </div>
      </div>

      <EmptyState
        message="When Supabase data is connected, drafts and published products can use this empty state when no records match."
        title="No products to show"
      />
    </section>
  );
}
