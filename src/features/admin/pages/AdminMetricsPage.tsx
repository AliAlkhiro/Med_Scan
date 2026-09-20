import { BarChart3, FileDown, RefreshCw, SearchX, ScanBarcode } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Button, EmptyState, ErrorState, LoadingState, StatusBadge } from '../../../shared/ui';
import { getAdminMetricsSummary, type AdminMetricsSummary } from '../services/adminMetrics';

function formatCount(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

function formatActivityDate(value: string | null) {
  if (!value) {
    return 'No activity yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

type SummaryCardProps = {
  icon: ReactNode;
  label: string;
  tone: 'neutral' | 'published' | 'warning';
  value: number;
};

function SummaryCard({ icon, label, tone, value }: SummaryCardProps) {
  return (
    <div className="rounded-md bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-palm">{icon}</span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold">{formatCount(value)}</p>
        <StatusBadge tone={tone}>Anonymous</StatusBadge>
      </div>
    </div>
  );
}

export function AdminMetricsPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<AdminMetricsSummary | null>(null);

  const loadMetrics = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const nextSummary = await getAdminMetricsSummary({ limit: 5 });
      setSummary(nextSummary);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Metrics could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  const hasMetrics =
    summary !== null &&
    (summary.totalScans > 0 ||
      summary.attachmentOpens > 0 ||
      summary.mostScannedProducts.length > 0 ||
      summary.commonMissingBarcodes.length > 0);

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Metrics</h2>
          <p className="mt-1 text-sm text-slate-600">Anonymous scan and attachment activity.</p>
        </div>
        <Button
          className="sm:self-start"
          disabled={isLoading}
          icon={<RefreshCw aria-hidden="true" size={18} />}
          onClick={loadMetrics}
          tone="secondary"
        >
          Refresh
        </Button>
      </div>

      {isLoading ? <LoadingState label="Loading metrics" /> : null}

      {!isLoading && error ? (
        <ErrorState
          action={
            <Button icon={<RefreshCw aria-hidden="true" size={18} />} onClick={loadMetrics} tone="secondary">
              Retry
            </Button>
          }
          message={error}
          title="Metrics could not be loaded"
        />
      ) : null}

      {!isLoading && !error && summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard icon={<BarChart3 aria-hidden="true" size={20} />} label="Total scans" tone="neutral" value={summary.totalScans} />
            <SummaryCard icon={<ScanBarcode aria-hidden="true" size={20} />} label="Found scans" tone="published" value={summary.foundScans} />
            <SummaryCard icon={<SearchX aria-hidden="true" size={20} />} label="Not found" tone="warning" value={summary.notFoundScans} />
            <SummaryCard icon={<FileDown aria-hidden="true" size={20} />} label="Attachment opens" tone="neutral" value={summary.attachmentOpens} />
          </div>

          {!hasMetrics ? (
            <EmptyState
              message="Scan, not-found, and attachment-open events will appear here after pharmacists start using published records."
              title="No usage metrics yet"
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="overflow-hidden rounded-md bg-white shadow-sm">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h3 className="font-bold text-ink">Most scanned products</h3>
                </div>
                {summary.mostScannedProducts.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {summary.mostScannedProducts.map((product) => (
                      <article className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_120px] sm:items-center" key={product.productId}>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{product.tradeName}</p>
                          <p className="mt-1 text-sm text-slate-500">{product.genericName || 'No generic name recorded'}</p>
                          <p className="mt-1 text-xs text-slate-500">Last scan: {formatActivityDate(product.lastScannedAt)}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 sm:text-right">{formatCount(product.scanCount)} scans</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-5 text-sm text-slate-600">No found scans recorded yet.</p>
                )}
              </section>

              <section className="overflow-hidden rounded-md bg-white shadow-sm">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h3 className="font-bold text-ink">Common missing barcodes</h3>
                </div>
                {summary.commonMissingBarcodes.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {summary.commonMissingBarcodes.map((barcode) => (
                      <article className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_120px] sm:items-center" key={barcode.barcode}>
                        <div className="min-w-0">
                          <p className="break-all font-mono text-sm font-semibold text-ink">{barcode.barcode}</p>
                          <p className="mt-1 text-xs text-slate-500">Last scan: {formatActivityDate(barcode.lastScannedAt)}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 sm:text-right">{formatCount(barcode.scanCount)} scans</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-5 text-sm text-slate-600">No missing barcode scans recorded yet.</p>
                )}
              </section>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
