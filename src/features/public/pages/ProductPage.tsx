import { Link, useParams } from 'react-router-dom';

export function ProductPage() {
  const { barcode } = useParams();

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 px-5 py-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-palm">Product details</p>
        <h1 className="text-2xl font-bold">Barcode {barcode}</h1>
      </header>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">
          Published product details will appear here after barcode lookup is connected.
        </p>
      </div>

      <Link className="rounded-md bg-palm px-4 py-3 text-center font-semibold text-white" to="/">
        Scan another product
      </Link>
    </section>
  );
}
