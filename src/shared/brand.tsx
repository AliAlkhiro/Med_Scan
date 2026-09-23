import { ScanLine } from 'lucide-react';
import { cx } from './cx';

const creatorEmail = 'alialkhiro@gmail.com';

export function PharmaCareLogo({ className }: { className?: string }) {
  return (
    <img
      alt="PharmaCare Scientific Bureau"
      className={cx('h-auto w-full object-contain', className)}
      decoding="async"
      src="/pharmacare-logo.jpeg"
    />
  );
}

export function BrandLockup({
  compact = false,
  subtitle,
}: {
  compact?: boolean;
  subtitle?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid h-11 w-11 flex-none place-items-center rounded-md bg-[linear-gradient(135deg,#123f2d_0%,#22c7cc_100%)] text-white shadow-sm ring-1 ring-aqua/25">
        <ScanLine aria-hidden="true" size={22} />
      </div>
      <div className="min-w-0">
        <PharmaCareLogo className={compact ? 'max-w-[12rem]' : 'max-w-[16rem]'} />
        {subtitle ? <p className="mt-1 text-sm font-medium text-palm/80">{subtitle}</p> : null}
      </div>
    </div>
  );
}

const identityGradient =
  'linear-gradient(90deg, rgba(231,53,79,0.15) 0%, rgba(231,53,79,0.08) 24%, rgba(255,255,255,0.02) 46%, rgba(255,255,255,0.02) 54%, rgba(34,199,204,0.14) 76%, rgba(34,199,204,0.24) 100%)';

export function PublicBrandBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
      <div className="relative overflow-hidden px-4 py-2">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{ background: identityGradient }}
        />
        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <PharmaCareLogo className="max-w-[8.5rem] justify-self-start sm:max-w-[12.5rem]" />
          <p className="justify-self-center text-base font-bold text-ink sm:text-xl">MedScan</p>
          <img
            alt="Amman Pharmaceutical Industries"
            className="h-auto w-full max-w-[7.5rem] justify-self-end object-contain sm:max-w-[12.5rem]"
            decoding="async"
            src="/api-logo.png"
          />
        </div>
      </div>
    </header>
  );
}

export function BrandFooter({ tone = 'light' }: { tone?: 'dark' | 'light' }) {
  const isDark = tone === 'dark';

  return (
    <footer
      className={cx(
        'border-t px-5 py-3 text-center text-sm shadow-[0_-10px_28px_rgba(18,63,45,0.06)]',
        isDark ? 'border-white/10 bg-ink/70 text-white/70' : 'border-slate-200 bg-white/90 text-slate-600',
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        <p>
          Created by{' '}
          <a
            className={cx('font-semibold underline-offset-4 hover:underline', isDark ? 'text-aqua' : 'text-palm')}
            href={`mailto:${creatorEmail}`}
          >
            Ali Alkhiro
          </a>
        </p>
      </div>
    </footer>
  );
}
