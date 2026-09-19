import { LoadingState, StatusBadge } from '../../../shared/ui';

export function AdminMetricsPage() {
  return (
    <section className="grid gap-5">
      <div>
        <h2 className="text-xl font-bold">Metrics</h2>
        <p className="mt-1 text-sm text-slate-600">Anonymous scan and attachment activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Found scans', value: '0', tone: 'published' as const },
          { label: 'Not found', value: '0', tone: 'warning' as const },
          { label: 'Attachments', value: '0', tone: 'neutral' as const },
        ].map((metric) => (
          <div className="rounded-md bg-white p-5 shadow-sm" key={metric.label}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-600">{metric.label}</p>
              <StatusBadge tone={metric.tone}>MVP</StatusBadge>
            </div>
            <p className="mt-3 text-3xl font-bold">{metric.value}</p>
          </div>
        ))}
      </div>

      <LoadingState label="Metrics data pending" />
    </section>
  );
}
