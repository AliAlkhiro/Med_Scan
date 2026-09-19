import { BarChart3, Boxes, LogOut, Plus, ScanLine } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { cx } from '../../shared/cx';
import { Button } from '../../shared/ui';

const navItems = [
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/products/new', label: 'New product', icon: Plus },
  { to: '/admin/metrics', label: 'Metrics', icon: BarChart3 },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-ink antialiased">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 flex-none place-items-center rounded-md bg-palm text-white">
              <ScanLine aria-hidden="true" size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-palm">Med Scan Admin</p>
              <h1 className="text-xl font-bold">Product management</h1>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold" aria-label="Admin">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  cx(
                    'inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 transition',
                    isActive ? 'bg-palm text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  )
                }
                key={item.to}
                to={item.to}
              >
                <item.icon aria-hidden="true" size={17} />
                {item.label}
              </NavLink>
            ))}
            <Button className="min-h-10 px-3 py-2" icon={<LogOut aria-hidden="true" size={17} />} tone="ghost">
              Logout
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-6">
        <Outlet />
      </main>
    </div>
  );
}
