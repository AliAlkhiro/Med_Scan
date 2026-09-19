import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/products/new', label: 'New product' },
  { to: '/admin/metrics', label: 'Metrics' },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-ink">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-palm">Med Scan Admin</p>
            <h1 className="text-xl font-bold">Product management</h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 ${isActive ? 'bg-palm text-white' : 'bg-slate-100 text-slate-700'}`
                }
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-6">
        <Outlet />
      </main>
    </div>
  );
}
