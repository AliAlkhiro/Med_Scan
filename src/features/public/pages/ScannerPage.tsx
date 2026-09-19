import { RotateCcw, ScanLine } from 'lucide-react';
import { isSupabaseConfigured } from '../../../config/env';
import { Button, ErrorState, StatusBadge } from '../../../shared/ui';

export function ScannerPage() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-palm">Med Scan</p>
          <h1 className="text-2xl font-bold">Scan product barcode</h1>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-palm text-white shadow-sm">
          <ScanLine aria-hidden="true" size={24} />
        </div>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-ink text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(15,118,110,0.42),transparent_36%)]" />
        <div className="relative aspect-[3/4] w-full max-w-[20rem] rounded-lg border-2 border-white/70">
          <div className="absolute left-5 right-5 top-1/2 h-0.5 bg-coral shadow-[0_0_18px_rgba(220,107,79,0.85)]" />
          <div className="absolute inset-x-0 bottom-5 flex justify-center">
            <StatusBadge>Scanner ready</StatusBadge>
          </div>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="mt-4">
          <ErrorState
            action={<Button icon={<RotateCcw aria-hidden="true" size={17} />} tone="secondary">Retry</Button>}
            message="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before connecting lookup data."
            title="Supabase settings missing"
          />
        </div>
      )}
    </section>
  );
}
