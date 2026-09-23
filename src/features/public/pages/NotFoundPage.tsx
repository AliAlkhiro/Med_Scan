import { AlertCircle, RotateCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export function NotFoundPage() {
  const { barcode } = useParams();
  const scannedBarcode = barcode?.trim() || 'Unknown barcode';

  return (
    <section className="mx-auto flex h-full w-full max-w-xl flex-col justify-center overflow-hidden px-5 py-5">
      <div className="rounded-xl bg-[linear-gradient(90deg,rgba(231,53,79,0.72)_0%,rgba(34,199,204,0.84)_50%,rgba(231,53,79,0.72)_100%)] p-[3px] shadow-xl">
        <div className="grid gap-5 rounded-[0.625rem] border border-white/10 bg-ink/85 px-5 py-6 text-center text-white shadow-[inset_0_0_28px_rgba(34,199,204,0.08)] backdrop-blur-md">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-coral/35 bg-white/10 text-coral shadow-[0_0_24px_rgba(231,53,79,0.35)]">
            <AlertCircle aria-hidden="true" size={28} />
          </div>
          <header>
            <p className="text-xs font-semibold uppercase tracking-wide text-aqua">No matching record</p>
            <h1 className="mt-2 text-2xl font-bold">Product not found</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/70">
              No published product record is available for this scanned barcode.
            </p>
          </header>
          <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-4 text-left shadow-sm backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Scanned barcode</p>
            <p className="mt-2 break-all font-mono text-lg font-semibold text-white">{scannedBarcode}</p>
          </div>
        </div>
      </div>

      <Link
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[linear-gradient(135deg,#123f2d_0%,#156a53_68%,#22c7cc_100%)] px-4 py-3 text-center font-semibold text-white shadow-lg transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-aqua focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        to="/"
      >
        <RotateCcw aria-hidden="true" size={18} />
        Scan another product
      </Link>
    </section>
  );
}
