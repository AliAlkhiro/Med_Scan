import { Save } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button, Select, Textarea, TextInput } from '../../../shared/ui';

export function AdminProductEditPage() {
  const { id } = useParams();

  return (
    <section className="rounded-md bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Edit product</h2>
        <p className="mt-2 text-sm text-slate-600">Product ID: {id}</p>
      </div>
      <form className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Trade name" placeholder="Loaded trade name" />
          <TextInput label="Manufacturer" placeholder="Manufacturer" />
          <TextInput label="Barcode" placeholder="Primary barcode" />
          <Select label="Publication status" defaultValue="draft">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </div>
        <Textarea label="Important warnings" placeholder="Warnings shown on the product details page" />
        <div>
          <Button icon={<Save aria-hidden="true" size={18} />} type="submit">
            Save changes
          </Button>
        </div>
      </form>
    </section>
  );
}
