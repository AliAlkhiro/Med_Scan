import { RotateCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState, StatusBadge } from '../../../shared/ui';

export function ProductPage() {
  const { barcode } = useParams();

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 px-5 py-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-palm">Product details</p>
        <h1 className="text-2xl font-bold">Barcode {barcode}</h1>
      </header>

      <div className="grid gap-3 rounded-md bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Lookup result</h2>
          <StatusBadge tone="published">Published</StatusBadge>
        </div>
        <EmptyState
          message="Product fields and attachment metadata will appear here after the lookup service is connected."
          title="Product details pending"
        />
      </div>

      <Link
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-palm px-4 py-3 text-center font-semibold text-white"
        to="/"
      >
        <RotateCcw aria-hidden="true" size={18} />
        Scan another product
      </Link>
    </section>
  );
}
