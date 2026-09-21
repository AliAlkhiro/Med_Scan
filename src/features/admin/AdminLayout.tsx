import { BarChart3, Boxes, LogOut, Plus } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BrandFooter, BrandLockup } from '../../shared/brand';
import { cx } from '../../shared/cx';
import { Button } from '../../shared/ui';
import { useAdminAuth } from './auth/adminAuthContext';

const navItems = [
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/products/new', label: 'New product', icon: Plus },
  { to: '/admin/metrics', label: 'Metrics', icon: BarChart3 },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { signOut, user } = useAdminAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(135deg,#f3faf7_0%,#eef7ff_52%,#fff1f3_100%)] text-ink antialiased">
      <header className="border-b border-aqua/20 bg-white/90 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <BrandLockup compact subtitle="Product management" />
          <nav className="flex flex-wrap gap-2 text-sm font-semibold" aria-label="Admin">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  cx(
                    'inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 transition',
                    isActive
                      ? 'bg-[linear-gradient(135deg,#123f2d_0%,#156a53_70%,#22c7cc_100%)] text-white shadow-sm'
                      : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-aqua/10 hover:text-palm',
                  )
                }
                key={item.to}
                to={item.to}
              >
                <item.icon aria-hidden="true" size={17} />
                {item.label}
              </NavLink>
            ))}
            <Button
              aria-label={user?.email ? `Logout ${user.email}` : 'Logout'}
              className="min-h-10 px-3 py-2"
              icon={<LogOut aria-hidden="true" size={17} />}
              onClick={handleLogout}
              tone="ghost"
            >
              Logout
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6">
        <Outlet />
      </main>
      <BrandFooter />
    </div>
  );
}
