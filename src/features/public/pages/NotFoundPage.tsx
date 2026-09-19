import { RotateCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../../../shared/ui';

export function NotFoundPage() {
  const { barcode } = useParams();

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-5 px-5 py-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-palm">No matching record</p>
        <h1 className="mt-1 text-2xl font-bold">Product not found</h1>
      </div>

      <EmptyState
        message={`No published product record is available for barcode ${barcode}.`}
        title="No matching record"
      />

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
