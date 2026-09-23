import { BarChart3, Boxes, LogOut, Plus } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BrandFooter } from '../../shared/brand';
import { cx } from '../../shared/cx';
import { Button } from '../../shared/ui';
import { useAdminAuth } from './auth/adminAuthContext';

const navItems = [
  { to: '/admin/products', label: 'Products', icon: Boxes, end: true },
  { to: '/admin/products/new', label: 'New product', icon: Plus, end: false },
  { to: '/admin/metrics', label: 'Metrics', icon: BarChart3, end: false },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { signOut, user } = useAdminAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-surface relative isolate flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(34,199,204,0.18)_0%,rgba(18,63,45,0.22)_28%,transparent_52%),linear-gradient(135deg,#061512_0%,#10241f_48%,#07100e_100%)] text-white antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08]"
        style={{
          backgroundImage: 'url("/pharmacare-mark-pattern-tile.png")',
          backgroundPosition: '1.85rem 5.5rem',
          backgroundRepeat: 'repeat',
          backgroundSize: '3.4rem auto',
        }}
      />
      <header className="border-b border-white/10 bg-ink/82 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-aqua">MedScan Admin</p>
            <h1 className="mt-1 text-xl font-bold text-white">Product management</h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold" aria-label="Admin">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  cx(
                    'inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 transition',
                    isActive
                      ? 'bg-[linear-gradient(135deg,#123f2d_0%,#156a53_70%,#22c7cc_100%)] text-white shadow-sm'
                      : 'bg-white/10 text-white/80 ring-1 ring-white/10 hover:bg-white/15 hover:text-white',
                  )
                }
                end={item.end}
                key={item.to}
                to={item.to}
              >
                <item.icon aria-hidden="true" size={17} />
                {item.label}
              </NavLink>
            ))}
            <Button
              aria-label={user?.email ? `Logout ${user.email}` : 'Logout'}
              className="min-h-10 px-3 py-2 shadow-sm"
              icon={<LogOut aria-hidden="true" size={17} />}
              onClick={handleLogout}
              tone="danger"
            >
              Logout
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6">
        <Outlet />
      </main>
      <BrandFooter tone="dark" />
    </div>
  );
}
