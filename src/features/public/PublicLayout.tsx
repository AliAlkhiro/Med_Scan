import { Outlet } from 'react-router-dom';
import { BrandFooter, PublicBrandBar } from '../../shared/brand';

export function PublicLayout() {
  return (
    <div className="relative isolate flex h-[100svh] flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(34,199,204,0.18)_0%,rgba(18,63,45,0.22)_28%,transparent_52%),linear-gradient(135deg,#061512_0%,#10241f_48%,#07100e_100%)] text-white antialiased">
      <PublicBrandBar />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.11]"
        style={{
          backgroundImage: 'url("/pharmacare-mark-pattern-tile.png")',
          backgroundPosition: '1.85rem 5.5rem',
          backgroundRepeat: 'repeat',
          backgroundSize: '3.4rem auto',
        }}
      />
      <main className="relative min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BrandFooter tone="dark" />
    </div>
  );
}
