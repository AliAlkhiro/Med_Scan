import { Outlet } from 'react-router-dom';
import { BrandFooter } from '../../shared/brand';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(135deg,#f3faf7_0%,#e8fbf8_48%,#fff1f3_100%)] text-ink antialiased">
      <main className="flex-1">
        <Outlet />
      </main>
      <BrandFooter />
    </div>
  );
}
