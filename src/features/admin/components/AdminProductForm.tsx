import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, Plus, Save, Trash2, Upload } from 'lucide-react';
import { Button, ErrorState, Select, StatusBadge, Textarea, TextInput } from '../../../shared/ui';
import {
  createEmptyAttachment,
  createEmptyBarcode,
  type AdminProductFormValues,
  uploadAttachmentFile,
} from '../services/adminProducts';

type FieldErrors = Partial<Record<keyof AdminProductFormValues, string>>;
type BarcodeErrors = Record<number, string | undefined>;
type AttachmentField = 'externalUrl' | 'label' | 'mimeType' | 'sizeBytes' | 'storagePath' | 'type';
type AttachmentErrors = Record<number, Partial<Record<AttachmentField, string>> | undefined>;
type AttachmentUploadState = Record<number, { error?: string; isUploading: boolean } | undefined>;

type AdminProductFormProps = {
  initialValues: AdminProductFormValues;
  onSubmit: (values: AdminProductFormValues) => Promise<void>;
  savedMessage?: string | null;
  submitLabel?: string;
};

function validateProduct(values: AdminProductFormValues) {
  const errors: FieldErrors = {};
  const barcodeErrors: BarcodeErrors = {};
  const attachmentErrors: AttachmentErrors = {};
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

  values.attachments.forEach((attachment, index) => {
    const rowErrors: Partial<Record<AttachmentField, string>> = {};
    const hasStoragePath = attachment.storagePath.trim().length > 0;
    const hasExternalUrl = attachment.externalUrl.trim().length > 0;
    const sizeBytes = attachment.sizeBytes.trim();

    if (!attachment.label.trim()) {
      rowErrors.label = 'Label is required.';
    }

    if (!attachment.type) {
      rowErrors.type = 'Type is required.';
    }

    if (!hasStoragePath && !hasExternalUrl) {
      rowErrors.storagePath = 'Add a file path or external URL.';
      rowErrors.externalUrl = 'Add a file path or external URL.';
    }

    if (sizeBytes.length > 0 && (!Number.isInteger(Number(sizeBytes)) || Number(sizeBytes) < 0)) {
      rowErrors.sizeBytes = 'Size must be a whole number of bytes.';
    }

    if (Object.keys(rowErrors).length > 0) {
      attachmentErrors[index] = rowErrors;
    }
  });

  if (Object.keys(attachmentErrors).length > 0) {
    errors.attachments = 'Fix attachment metadata before saving.';
  }

  return { attachmentErrors, barcodeErrors, errors };
}

function hasErrors(errors: FieldErrors, barcodeErrors: BarcodeErrors, attachmentErrors: AttachmentErrors) {
  return (
    Object.keys(errors).length > 0 ||
    Object.values(barcodeErrors).some(Boolean) ||
    Object.values(attachmentErrors).some((rowErrors) => rowErrors && Object.keys(rowErrors).length > 0)
  );
}

const barcodeTypeOptions = [
  { label: 'Unknown', value: '' },
  { label: 'EAN-13', value: 'EAN-13' },
  { label: 'EAN-8', value: 'EAN-8' },
  { label: 'UPC-A', value: 'UPC-A' },
  { label: 'UPC-E', value: 'UPC-E' },
  { label: 'Code 128', value: 'Code 128' },
];

const attachmentTypeOptions = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Link', value: 'link' },
];

export function AdminProductForm({
  initialValues,
  onSubmit,
  savedMessage,
  submitLabel = 'Save product',
}: AdminProductFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [barcodeErrors, setBarcodeErrors] = useState<BarcodeErrors>({});
  const [attachmentErrors, setAttachmentErrors] = useState<AttachmentErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [attachmentUploadState, setAttachmentUploadState] = useState<AttachmentUploadState>({});
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

  const updateAttachmentValue = (index: number, field: AttachmentField, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      attachments: currentValues.attachments.map((attachment, attachmentIndex) =>
        attachmentIndex === index ? { ...attachment, [field]: value } : attachment,
      ),
    }));
    setErrors((currentErrors) => {
      if (!currentErrors.attachments) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors.attachments;
      return nextErrors;
    });
    setAttachmentErrors((currentErrors) => {
      const rowErrors = currentErrors[index];

      if (!rowErrors || !(field in rowErrors)) {
        return currentErrors;
      }

      const nextRowErrors = { ...rowErrors };
      delete nextRowErrors[field];
      return {
        ...currentErrors,
        [index]: Object.keys(nextRowErrors).length > 0 ? nextRowErrors : undefined,
      };
    });
  };

  const handleAttachmentFileChange = async (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setAttachmentUploadState((currentState) => ({
      ...currentState,
      [index]: { isUploading: true },
    }));

    try {
      const uploadedFile = await uploadAttachmentFile(file);
      setValues((currentValues) => ({
        ...currentValues,
        attachments: currentValues.attachments.map((attachment, attachmentIndex) =>
          attachmentIndex === index
            ? {
                ...attachment,
                mimeType: uploadedFile.mimeType,
                sizeBytes: uploadedFile.sizeBytes,
                storagePath: uploadedFile.storagePath,
                type: uploadedFile.type,
              }
            : attachment,
        ),
      }));
      setErrors((currentErrors) => {
        if (!currentErrors.attachments) {
          return currentErrors;
        }

        const nextErrors = { ...currentErrors };
        delete nextErrors.attachments;
        return nextErrors;
      });
      setAttachmentErrors((currentErrors) => {
        const rowErrors = currentErrors[index];

        if (!rowErrors) {
          return currentErrors;
        }

        const nextRowErrors = { ...rowErrors };
        delete nextRowErrors.storagePath;
        delete nextRowErrors.mimeType;
        delete nextRowErrors.sizeBytes;
        delete nextRowErrors.type;

        return {
          ...currentErrors,
          [index]: Object.keys(nextRowErrors).length > 0 ? nextRowErrors : undefined,
        };
      });
      setAttachmentUploadState((currentState) => ({
        ...currentState,
        [index]: { isUploading: false },
      }));
    } catch (error) {
      setAttachmentUploadState((currentState) => ({
        ...currentState,
        [index]: {
          error: error instanceof Error ? error.message : 'File could not be uploaded.',
          isUploading: false,
        },
      }));
    }
  };

  const addAttachment = () => {
    setValues((currentValues) => ({
      ...currentValues,
      attachments: [...currentValues.attachments, createEmptyAttachment()],
    }));
  };

  const removeAttachment = (index: number) => {
    setValues((currentValues) => ({
      ...currentValues,
      attachments: currentValues.attachments.filter((_, attachmentIndex) => attachmentIndex !== index),
    }));
    setAttachmentErrors({});
    setAttachmentUploadState({});
  };

  const moveAttachment = (index: number, direction: -1 | 1) => {
    setValues((currentValues) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= currentValues.attachments.length) {
        return currentValues;
      }

      const nextAttachments = [...currentValues.attachments];
      [nextAttachments[index], nextAttachments[nextIndex]] = [nextAttachments[nextIndex], nextAttachments[index]];

      return {
        ...currentValues,
        attachments: nextAttachments,
      };
    });
    setAttachmentErrors({});
    setAttachmentUploadState({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const {
      attachmentErrors: nextAttachmentErrors,
      barcodeErrors: nextBarcodeErrors,
      errors: nextErrors,
    } = validateProduct(values);
    setErrors(nextErrors);
    setAttachmentErrors(nextAttachmentErrors);
    setBarcodeErrors(nextBarcodeErrors);

    if (hasErrors(nextErrors, nextBarcodeErrors, nextAttachmentErrors)) {
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-ink">Attachments</h3>
            <p className="mt-1 text-sm text-slate-600">Add reviewed documents, images, videos, or reference links for pharmacists.</p>
          </div>
          <Button icon={<Plus aria-hidden="true" size={18} />} onClick={addAttachment} tone="secondary">
            Add attachment
          </Button>
        </div>

        {errors.attachments ? <p className="text-sm font-medium text-coral">{errors.attachments}</p> : null}

        {values.attachments.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            No attachment metadata has been added.
          </p>
        ) : (
          <div className="grid gap-3">
            {values.attachments.map((attachment, index) => {
              const rowErrors = attachmentErrors[index] ?? {};
              const uploadState = attachmentUploadState[index];

              return (
                <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3" key={attachment.id ?? `attachment-${index}`}>
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem]">
                    <TextInput
                      error={rowErrors.label}
                      label={`Attachment ${index + 1} label`}
                      onChange={(event) => updateAttachmentValue(index, 'label', event.target.value)}
                      placeholder="Patient leaflet"
                      value={attachment.label}
                    />
                    <Select
                      error={rowErrors.type}
                      label="Type"
                      onChange={(event) => updateAttachmentValue(index, 'type', event.target.value)}
                      value={attachment.type}
                    >
                      {attachmentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <TextInput
                      error={rowErrors.storagePath}
                      label="Storage path"
                      onChange={(event) => updateAttachmentValue(index, 'storagePath', event.target.value)}
                      placeholder="products/name/file.pdf"
                      value={attachment.storagePath}
                    />
                    <TextInput
                      error={rowErrors.externalUrl}
                      label="External URL"
                      onChange={(event) => updateAttachmentValue(index, 'externalUrl', event.target.value)}
                      placeholder="https://..."
                      type="url"
                      value={attachment.externalUrl}
                    />
                    <div className="grid gap-2 text-sm font-medium text-slate-800 md:col-span-2">
                      <span>Upload file</span>
                      <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-slate-200 transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-palm focus-within:ring-offset-2">
                        <Upload aria-hidden="true" size={18} />
                        {uploadState?.isUploading ? 'Uploading' : 'Choose file'}
                        <input
                          accept="application/pdf,image/gif,image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                          className="sr-only"
                          disabled={uploadState?.isUploading || isSaving}
                          onChange={(event) => void handleAttachmentFileChange(index, event)}
                          type="file"
                        />
                      </label>
                      {uploadState?.error ? <span className="text-sm font-medium text-coral">{uploadState.error}</span> : null}
                      {!uploadState?.error && attachment.storagePath ? (
                        <span className="text-sm text-slate-500">Uploaded file metadata is ready to save.</span>
                      ) : null}
                    </div>
                    <TextInput
                      error={rowErrors.sizeBytes}
                      label="Size in bytes"
                      min="0"
                      onChange={(event) => updateAttachmentValue(index, 'sizeBytes', event.target.value)}
                      placeholder="Optional"
                      type="number"
                      value={attachment.sizeBytes}
                    />
                    <TextInput
                      error={rowErrors.mimeType}
                      label="MIME type"
                      onChange={(event) => updateAttachmentValue(index, 'mimeType', event.target.value)}
                      placeholder="application/pdf"
                      value={attachment.mimeType}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      aria-label={`Move attachment ${index + 1} up`}
                      disabled={index === 0}
                      icon={<ArrowUp aria-hidden="true" size={18} />}
                      onClick={() => moveAttachment(index, -1)}
                      tone="ghost"
                    >
                      Up
                    </Button>
                    <Button
                      aria-label={`Move attachment ${index + 1} down`}
                      disabled={index === values.attachments.length - 1}
                      icon={<ArrowDown aria-hidden="true" size={18} />}
                      onClick={() => moveAttachment(index, 1)}
                      tone="ghost"
                    >
                      Down
                    </Button>
                    <Button
                      aria-label={`Remove attachment ${index + 1}`}
                      icon={<Trash2 aria-hidden="true" size={18} />}
                      onClick={() => removeAttachment(index)}
                      tone="ghost"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
