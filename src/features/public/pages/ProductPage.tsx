import { FileText, Image, Link as LinkIcon, RotateCcw, Video } from 'lucide-react';
import { Link, useLoaderData } from 'react-router-dom';
import { isSupabaseConfigured } from '../../../config/env';
import { Button, ErrorState, StatusBadge } from '../../../shared/ui';
import type { ProductAttachment, ProductLookupDetails } from '../services/productLookup';
import type { ProductPageData } from './productPageLoader';

const primaryFields: Array<{ key: keyof ProductLookupDetails; label: string }> = [
  { key: 'genericName', label: 'Generic name' },
  { key: 'strength', label: 'Strength' },
  { key: 'dosageForm', label: 'Dosage form' },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'packDescription', label: 'Pack' },
];

const detailFields: Array<{ key: keyof ProductLookupDetails; label: string }> = [
  { key: 'countryOfOrigin', label: 'Country of origin' },
  { key: 'therapeuticClass', label: 'Therapeutic class' },
  { key: 'indications', label: 'Indications' },
  { key: 'counselingNotes', label: 'Counseling notes' },
  { key: 'warnings', label: 'Warnings' },
  { key: 'contraindications', label: 'Contraindications' },
  { key: 'storageInstructions', label: 'Storage' },
  { key: 'applicationInstructions', label: 'Application' },
  { key: 'extraNotes', label: 'Notes' },
];

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatFileSize(sizeBytes: number | null) {
  if (sizeBytes === null) {
    return null;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }

  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

function attachmentIcon(type: ProductAttachment['type']) {
  if (type === 'image') {
    return <Image aria-hidden="true" size={18} />;
  }

  if (type === 'video') {
    return <Video aria-hidden="true" size={18} />;
  }

  if (type === 'link') {
    return <LinkIcon aria-hidden="true" size={18} />;
  }

  return <FileText aria-hidden="true" size={18} />;
}

function FieldList({
  fields,
  product,
}: {
  fields: Array<{ key: keyof ProductLookupDetails; label: string }>;
  product: ProductLookupDetails;
}) {
  const visibleFields = getVisibleFields(fields, product);

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <dl className="grid gap-3">
      {visibleFields.map((field) => (
        <div className="grid gap-1" key={field.key}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{field.label}</dt>
          <dd className="text-sm leading-6 text-ink">{field.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function getVisibleFields(
  fields: Array<{ key: keyof ProductLookupDetails; label: string }>,
  product: ProductLookupDetails,
) {
  return fields.flatMap((field) => {
    const value = product[field.key];

    if (typeof value !== 'string' || value.trim().length === 0) {
      return [];
    }

    return [{ ...field, value }];
  });
}

export function ProductPage() {
  const { barcode, product } = useLoaderData() as ProductPageData;
  const reviewedAt = formatDate(product.lastReviewedAt);
  const hasReferenceNotes = getVisibleFields(detailFields, product).length > 0 || reviewedAt !== null;

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 px-5 py-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-palm">Product details</p>
        <h1 className="mt-1 text-2xl font-bold">{product.tradeName}</h1>
        <p className="mt-2 text-sm text-slate-600">Barcode {barcode}</p>
      </header>

      <div className="grid gap-4 rounded-md bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Key details</h2>
          <StatusBadge tone="published">Published</StatusBadge>
        </div>
        <FieldList fields={primaryFields} product={product} />
      </div>

      {hasReferenceNotes ? (
        <div className="grid gap-4 rounded-md bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Reference notes</h2>
          <FieldList fields={detailFields} product={product} />
          {reviewedAt ? (
            <p className="border-t border-slate-100 pt-3 text-sm text-slate-500">Last reviewed {reviewedAt}</p>
          ) : null}
        </div>
      ) : null}

      {product.attachments.length > 0 ? (
        <div className="grid gap-3 rounded-md bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Attachments</h2>
          <div className="grid gap-2">
            {product.attachments.map((attachment) => {
              const fileSize = formatFileSize(attachment.sizeBytes);

              return (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-3"
                  key={attachment.id}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-md bg-teal-50 text-palm">
                      {attachmentIcon(attachment.type)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{attachment.label}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {[attachment.type, fileSize].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <StatusBadge>Metadata</StatusBadge>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

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

export function ProductPageError() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-5 px-5 py-6">
      <ErrorState
        action={
          <Link to="/">
            <Button icon={<RotateCcw aria-hidden="true" size={17} />} tone="secondary">
              Scan another product
            </Button>
          </Link>
        }
        message={
          isSupabaseConfigured
            ? 'The product lookup could not be completed. Check the connection and try again.'
            : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before looking up products.'
        }
        title="Lookup unavailable"
      />
    </section>
  );
}
