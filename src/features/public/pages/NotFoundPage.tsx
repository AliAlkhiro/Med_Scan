import { RotateCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../../../shared/ui';

export function NotFoundPage() {
  const { barcode } = useParams();
  const scannedBarcode = barcode?.trim() || 'Unknown barcode';

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-5 px-5 py-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-palm">No matching record</p>
        <h1 className="mt-1 text-2xl font-bold">Product not found</h1>
      </header>

      <EmptyState
        message="No published product record is available for this scanned barcode."
        title="No matching record"
      />

      <div className="rounded-md bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scanned barcode</p>
        <p className="mt-2 break-all font-mono text-lg font-semibold text-ink">{scannedBarcode}</p>
      </div>

      <Link
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-palm px-4 py-3 text-center font-semibold text-white"
        to="/"
      >
        <RotateCcw aria-hidden="true" size={18} />
        Scan another product
      </Link>
    </section>
  );
}
