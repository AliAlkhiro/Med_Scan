import { useState } from 'react';
import { AlertTriangle, ExternalLink, FileText, Image, Link as LinkIcon, LoaderCircle, RotateCcw, Video } from 'lucide-react';
import { Link, useLoaderData } from 'react-router-dom';
import { isSupabaseConfigured } from '../../../config/env';
import { Button, ErrorState } from '../../../shared/ui';
import {
  getAttachmentOpenUrl,
  recordAttachmentOpenMetric,
  type ProductAttachment,
  type ProductLookupDetails,
} from '../services/productLookup';
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

const panelClasses = 'rounded-xl border border-white/10 bg-ink/85 p-5 text-white shadow-xl backdrop-blur-md';

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

function AttachmentOpenButton({
  attachment,
  productId,
}: {
  attachment: ProductAttachment;
  productId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  async function handleOpenAttachment() {
    setError(null);
    setIsOpening(true);

    const openedWindow = window.open('about:blank', '_blank');

    if (openedWindow) {
      openedWindow.opener = null;
    }

    try {
      const url = await getAttachmentOpenUrl({
        attachmentId: attachment.id,
        productId,
      });

      try {
        await recordAttachmentOpenMetric({
          attachmentId: attachment.id,
          productId,
        });
      } catch (metricError) {
        console.warn('Unable to record attachment-open metric', metricError);
      }

      if (openedWindow) {
        openedWindow.location.href = url;
      } else {
        window.location.assign(url);
      }
    } catch (openError) {
      if (openedWindow) {
        openedWindow.close();
      }

      setError(openError instanceof Error ? openError.message : 'Attachment could not be opened.');
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <div className="grid justify-items-end gap-1">
      <Button
        aria-label={`Open ${attachment.label}`}
        className="min-h-10 border-white/15 bg-white/10 px-3 text-white hover:bg-white/20"
        disabled={isOpening}
        icon={
          isOpening ? (
            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink aria-hidden="true" size={16} />
          )
        }
        onClick={handleOpenAttachment}
      >
        Open
      </Button>
      {error ? <p className="max-w-36 text-right text-xs font-medium text-coral">{error}</p> : null}
    </div>
  );
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
          <dt className="text-xs font-semibold uppercase tracking-wide text-aqua/80">{field.label}</dt>
          <dd className="text-sm leading-6 text-white/85">{field.value}</dd>
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
  const { barcode, cachedAt, isCached, product } = useLoaderData() as ProductPageData;
  const reviewedAt = formatDate(product.lastReviewedAt);
  const cachedAtLabel = formatDate(cachedAt);
  const hasReferenceNotes = getVisibleFields(detailFields, product).length > 0 || reviewedAt !== null;

  return (
    <section className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-4 px-5 py-5">
      <header className="rounded-xl bg-[linear-gradient(90deg,rgba(34,199,204,0.84)_0%,rgba(255,255,255,0.42)_50%,rgba(231,53,79,0.58)_100%)] p-[3px] shadow-xl">
        <div className="rounded-[0.625rem] border border-white/10 bg-ink/90 px-5 py-5 text-white shadow-[inset_0_0_28px_rgba(34,199,204,0.08)] backdrop-blur-md">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-aqua">Product details</p>
            <h1 className="mt-2 text-2xl font-bold leading-tight">{product.tradeName}</h1>
            <p className="mt-2 break-all font-mono text-sm text-white/60">Barcode {barcode}</p>
          </div>
        </div>
      </header>

      {isCached ? (
        <div className="rounded-lg border border-coral/25 bg-coral/10 px-4 py-3 text-white">
          <div className="flex gap-3">
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-none text-coral" />
            <div>
              <p className="text-sm font-bold">Showing cached product details</p>
              <p className="mt-1 text-sm leading-6 text-white/70">
                The live lookup could not be completed. Use these details as stale cached content
                {cachedAtLabel ? ` from ${cachedAtLabel}` : ''}.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className={`grid gap-4 ${panelClasses}`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Key details</h2>
        </div>
        <FieldList fields={primaryFields} product={product} />
      </div>

      {hasReferenceNotes ? (
        <div className={`grid gap-4 ${panelClasses}`}>
          <h2 className="text-lg font-bold">Reference notes</h2>
          <FieldList fields={detailFields} product={product} />
          {reviewedAt ? (
            <p className="border-t border-white/10 pt-3 text-sm text-white/50">Last reviewed {reviewedAt}</p>
          ) : null}
        </div>
      ) : null}

      {product.attachments.length > 0 ? (
        <div className={`grid gap-3 ${panelClasses}`}>
          <h2 className="text-lg font-bold">Attachments</h2>
          <div className="grid gap-2">
            {product.attachments.map((attachment) => {
              const fileSize = formatFileSize(attachment.sizeBytes);

              return (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-3"
                  key={attachment.id}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-md bg-aqua/10 text-aqua">
                      {attachmentIcon(attachment.type)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{attachment.label}</p>
                      <p className="text-xs uppercase tracking-wide text-white/50">
                        {[attachment.type, fileSize].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <AttachmentOpenButton attachment={attachment} productId={product.id} />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <Link
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[linear-gradient(135deg,#123f2d_0%,#156a53_68%,#22c7cc_100%)] px-4 py-3 text-center font-semibold text-white shadow-lg transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-aqua focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
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
    <section className="mx-auto flex h-full w-full max-w-xl flex-col justify-center px-5 py-5">
      <div className="rounded-xl bg-[linear-gradient(90deg,rgba(231,53,79,0.72)_0%,rgba(34,199,204,0.84)_100%)] p-[3px] shadow-xl">
        <div className="grid gap-4 rounded-[0.625rem] border border-white/10 bg-ink/85 p-5 text-white shadow-[inset_0_0_28px_rgba(34,199,204,0.08)] backdrop-blur-md">
          <ErrorState
            action={
              <Link to="/">
                <Button icon={<RotateCcw aria-hidden="true" size={17} />}>
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
        </div>
      </div>
    </section>
  );
}
