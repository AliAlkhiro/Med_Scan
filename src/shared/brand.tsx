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

export function BrandFooter() {
  return (
    <footer className="border-t-4 border-aqua bg-white/90 px-5 py-4 text-sm text-slate-600 shadow-[0_-10px_28px_rgba(18,63,45,0.06)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            alt="Amman Pharmaceutical Industries"
            className="h-8 w-auto max-w-[11rem] object-contain opacity-80 grayscale"
            decoding="async"
            src="/api-logo.png"
          />
        </div>
        <p>
          Created by{' '}
          <a className="font-semibold text-palm underline-offset-4 hover:underline" href={`mailto:${creatorEmail}`}>
            Ali Alkhiro
          </a>
        </p>
      </div>
    </footer>
  );
}
