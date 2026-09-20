import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2, Plus, Save, Trash2 } from 'lucide-react';
import { Button, ErrorState, Select, StatusBadge, Textarea, TextInput } from '../../../shared/ui';
import { createEmptyBarcode, type AdminProductFormValues } from '../services/adminProducts';

type FieldErrors = Partial<Record<keyof AdminProductFormValues, string>>;
type BarcodeErrors = Record<number, string | undefined>;

type AdminProductFormProps = {
  initialValues: AdminProductFormValues;
  onSubmit: (values: AdminProductFormValues) => Promise<void>;
  savedMessage?: string | null;
  submitLabel?: string;
};

function validateProduct(values: AdminProductFormValues) {
  const errors: FieldErrors = {};
  const barcodeErrors: BarcodeErrors = {};
  const seenBarcodes = new Map<string, number>();
  const filledBarcodes = values.barcodes
    .map((barcode, index) => ({
      barcode: barcode.barcode.trim(),
      index,
    }))
    .filter(({ barcode }) => barcode.length > 0);

  if (!values.tradeName.trim()) {
    errors.tradeName = 'Trade name is required.';
  }

  if (values.isPublished && filledBarcodes.length === 0) {
    errors.barcodes = 'Add at least one barcode before publishing.';
  }

  for (const { barcode, index } of filledBarcodes) {
    const existingIndex = seenBarcodes.get(barcode);

    if (existingIndex !== undefined) {
      barcodeErrors[index] = 'This barcode is duplicated in this product.';
      barcodeErrors[existingIndex] = 'This barcode is duplicated in this product.';
      continue;
    }

    seenBarcodes.set(barcode, index);
  }

  return { barcodeErrors, errors };
}

function hasErrors(errors: FieldErrors, barcodeErrors: BarcodeErrors) {
  return Object.keys(errors).length > 0 || Object.values(barcodeErrors).some(Boolean);
}

const barcodeTypeOptions = [
  { label: 'Unknown', value: '' },
  { label: 'EAN-13', value: 'EAN-13' },
  { label: 'EAN-8', value: 'EAN-8' },
  { label: 'UPC-A', value: 'UPC-A' },
  { label: 'UPC-E', value: 'UPC-E' },
  { label: 'Code 128', value: 'Code 128' },
];

export function AdminProductForm({
  initialValues,
  onSubmit,
  savedMessage,
  submitLabel = 'Save product',
}: AdminProductFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [barcodeErrors, setBarcodeErrors] = useState<BarcodeErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState<AdminProductFormValues>(initialValues);

  const publicationStatus = useMemo(() => (values.isPublished ? 'published' : 'draft'), [values.isPublished]);

  const updateValue = (field: keyof AdminProductFormValues, value: string | boolean) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    setErrors((currentErrors) => {
      if (!(field in currentErrors)) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const updateBarcodeValue = (index: number, field: 'barcode' | 'barcodeType', value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      barcodes: currentValues.barcodes.map((barcode, barcodeIndex) =>
        barcodeIndex === index ? { ...barcode, [field]: value } : barcode,
      ),
    }));
    setErrors((currentErrors) => {
      if (!currentErrors.barcodes) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors.barcodes;
      return nextErrors;
    });
    setBarcodeErrors((currentErrors) => {
      if (!(index in currentErrors)) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[index];
      return nextErrors;
    });
  };

  const addBarcode = () => {
    setValues((currentValues) => ({
      ...currentValues,
      barcodes: [...currentValues.barcodes, createEmptyBarcode()],
    }));
  };

  const removeBarcode = (index: number) => {
    setValues((currentValues) => {
      const nextBarcodes = currentValues.barcodes.filter((_, barcodeIndex) => barcodeIndex !== index);

      return {
        ...currentValues,
        barcodes: nextBarcodes.length > 0 ? nextBarcodes : [createEmptyBarcode()],
      };
    });
    setBarcodeErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const { barcodeErrors: nextBarcodeErrors, errors: nextErrors } = validateProduct(values);
    setErrors(nextErrors);
    setBarcodeErrors(nextBarcodeErrors);

    if (hasErrors(nextErrors, nextBarcodeErrors)) {
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit(values);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Product could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3">
        <StatusBadge tone={values.isPublished ? 'published' : 'draft'}>
          {values.isPublished ? 'Published' : 'Draft'}
        </StatusBadge>
        {savedMessage ? (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-palm">
            <CheckCircle2 aria-hidden="true" size={17} />
            {savedMessage}
          </span>
        ) : null}
      </div>

      {formError ? <ErrorState message={formError} title="Product could not be saved" /> : null}

      <section className="grid gap-4 rounded-md bg-white p-5 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-ink">Core details</h3>
          <p className="mt-1 text-sm text-slate-600">These fields anchor the public product detail page.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            error={errors.tradeName}
            label="Trade name"
            onChange={(event) => updateValue('tradeName', event.target.value)}
            placeholder="Product trade name"
            required
            value={values.tradeName}
          />
          <TextInput
            label="Generic name"
            onChange={(event) => updateValue('genericName', event.target.value)}
            placeholder="Active ingredient"
            value={values.genericName}
          />
          <TextInput
            label="Strength"
            onChange={(event) => updateValue('strength', event.target.value)}
            placeholder="500 mg"
            value={values.strength}
          />
          <TextInput
            label="Dosage form"
            onChange={(event) => updateValue('dosageForm', event.target.value)}
            placeholder="Tablet"
            value={values.dosageForm}
          />
          <TextInput
            label="Manufacturer"
            onChange={(event) => updateValue('manufacturer', event.target.value)}
            placeholder="Manufacturer"
            value={values.manufacturer}
          />
          <TextInput
            label="Pack description"
            onChange={(event) => updateValue('packDescription', event.target.value)}
            placeholder="20 tablets blister pack"
            value={values.packDescription}
          />
          <Select
            label="Publication status"
            onChange={(event) => updateValue('isPublished', event.target.value === 'published')}
            value={publicationStatus}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
          <TextInput
            label="Last reviewed"
            onChange={(event) => updateValue('lastReviewedAt', event.target.value)}
            type="date"
            value={values.lastReviewedAt}
          />
          <TextInput
            label="Country of origin"
            onChange={(event) => updateValue('countryOfOrigin', event.target.value)}
            placeholder="Country"
            value={values.countryOfOrigin}
          />
          <TextInput
            className="md:col-span-2"
            label="Therapeutic class"
            onChange={(event) => updateValue('therapeuticClass', event.target.value)}
            placeholder="Therapeutic class"
            value={values.therapeuticClass}
          />
        </div>
      </section>

      <section className="grid gap-4 rounded-md bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-ink">Barcodes</h3>
            <p className="mt-1 text-sm text-slate-600">Add every package barcode that should resolve to this product.</p>
          </div>
          <Button icon={<Plus aria-hidden="true" size={18} />} onClick={addBarcode} tone="secondary">
            Add barcode
          </Button>
        </div>

        {errors.barcodes ? <p className="text-sm font-medium text-coral">{errors.barcodes}</p> : null}

        <div className="grid gap-3">
          {values.barcodes.map((barcode, index) => (
            <div
              className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-start"
              key={barcode.id ?? `new-${index}`}
            >
              <TextInput
                error={barcodeErrors[index]}
                label={`Barcode ${index + 1}`}
                onChange={(event) => updateBarcodeValue(index, 'barcode', event.target.value)}
                placeholder="Scanned barcode"
                value={barcode.barcode}
              />
              <Select
                label="Type"
                onChange={(event) => updateBarcodeValue(index, 'barcodeType', event.target.value)}
                value={barcode.barcodeType}
              >
                {barcodeTypeOptions.map((option) => (
                  <option key={option.value || 'unknown'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Button
                aria-label={`Remove barcode ${index + 1}`}
                className="md:mt-7"
                icon={<Trash2 aria-hidden="true" size={18} />}
                onClick={() => removeBarcode(index)}
                tone="ghost"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-md bg-white p-5 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-ink">Pharmacist guidance</h3>
          <p className="mt-1 text-sm text-slate-600">Optional short notes shown only when content is present.</p>
        </div>
        <Textarea
          label="Indications"
          onChange={(event) => updateValue('indications', event.target.value)}
          placeholder="Approved uses or practical indication notes"
          value={values.indications}
        />
        <Textarea
          label="Counseling notes"
          onChange={(event) => updateValue('counselingNotes', event.target.value)}
          placeholder="Short pharmacist-facing counseling notes"
          value={values.counselingNotes}
        />
        <Textarea
          label="Warnings"
          onChange={(event) => updateValue('warnings', event.target.value)}
          placeholder="Important warnings"
          value={values.warnings}
        />
        <Textarea
          label="Contraindications"
          onChange={(event) => updateValue('contraindications', event.target.value)}
          placeholder="Contraindications"
          value={values.contraindications}
        />
        <Textarea
          label="Storage instructions"
          onChange={(event) => updateValue('storageInstructions', event.target.value)}
          placeholder="Storage instructions"
          value={values.storageInstructions}
        />
        <Textarea
          label="Application instructions"
          onChange={(event) => updateValue('applicationInstructions', event.target.value)}
          placeholder="Use or administration instructions"
          value={values.applicationInstructions}
        />
        <Textarea
          label="Extra notes"
          onChange={(event) => updateValue('extraNotes', event.target.value)}
          placeholder="Additional reviewed notes"
          value={values.extraNotes}
        />
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button disabled={isSaving} icon={<Save aria-hidden="true" size={18} />} type="submit">
          {isSaving ? 'Saving' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
