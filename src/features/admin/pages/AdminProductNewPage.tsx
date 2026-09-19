import { Save } from 'lucide-react';
import { Button, Select, Textarea, TextInput } from '../../../shared/ui';

export function AdminProductNewPage() {
  return (
    <section className="rounded-md bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold">New product</h2>
        <p className="mt-2 text-sm text-slate-600">Create form wiring will be added with product management.</p>
      </div>
      <form className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Trade name" placeholder="Product trade name" />
          <TextInput label="Generic name" placeholder="Active ingredient" />
          <TextInput label="Strength" placeholder="500 mg" />
          <TextInput label="Dosage form" placeholder="Tablet" />
        </div>
        <Textarea label="Counseling notes" placeholder="Short pharmacist-facing notes" />
        <Select label="Publication status" defaultValue="draft">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </Select>
        <div>
          <Button icon={<Save aria-hidden="true" size={18} />} type="submit">
            Save product
          </Button>
        </div>
      </form>
    </section>
  );
}
