import { Link, useParams } from 'react-router-dom';

export function NotFoundPage() {
  const { barcode } = useParams();

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-5 px-5 py-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-palm">No matching record</p>
        <h1 className="mt-1 text-2xl font-bold">Product not found</h1>
      </div>

      <p className="rounded-lg bg-white p-5 text-sm text-slate-700 shadow-sm">
        No published product record is available for barcode <span className="font-semibold">{barcode}</span>.
      </p>

      <Link className="rounded-md bg-palm px-4 py-3 text-center font-semibold text-white" to="/">
        Scan another product
      </Link>
    </section>
  );
}
