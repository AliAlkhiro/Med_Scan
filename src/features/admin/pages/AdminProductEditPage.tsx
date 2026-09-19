import { useParams } from 'react-router-dom';

export function AdminProductEditPage() {
  const { id } = useParams();

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Edit product</h2>
      <p className="mt-2 text-sm text-slate-600">Product ID: {id}</p>
    </section>
  );
}
