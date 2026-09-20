import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PageLoading } from './shared/PageLoading';
import { PublicLayout } from './features/public/PublicLayout';
import { ScannerPage } from './features/public/pages/ScannerPage';

const AdminAuthProvider = lazy(() =>
  import('./features/admin/auth/AdminAuthProvider').then((module) => ({ default: module.AdminAuthProvider })),
);
const ProtectedAdminRoute = lazy(() =>
  import('./features/admin/auth/ProtectedAdminRoute').then((module) => ({ default: module.ProtectedAdminRoute })),
);
const AdminLayout = lazy(() =>
  import('./features/admin/AdminLayout').then((module) => ({ default: module.AdminLayout })),
);
const AdminLoginPage = lazy(() =>
  import('./features/admin/pages/AdminLoginPage').then((module) => ({ default: module.AdminLoginPage })),
);
const AdminProductsPage = lazy(() =>
  import('./features/admin/pages/AdminProductsPage').then((module) => ({ default: module.AdminProductsPage })),
);
const AdminProductNewPage = lazy(() =>
  import('./features/admin/pages/AdminProductNewPage').then((module) => ({ default: module.AdminProductNewPage })),
);
const AdminProductEditPage = lazy(() =>
  import('./features/admin/pages/AdminProductEditPage').then((module) => ({ default: module.AdminProductEditPage })),
);
const AdminMetricsPage = lazy(() =>
  import('./features/admin/pages/AdminMetricsPage').then((module) => ({ default: module.AdminMetricsPage })),
);
const NotFoundPage = lazy(() =>
  import('./features/public/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<PageLoading />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <ScannerPage /> },
      {
        path: 'product/:barcode',
        lazy: () => import('./features/public/pages/productRoute'),
      },
      { path: 'not-found/:barcode', element: withSuspense(<NotFoundPage />) },
    ],
  },
  {
    path: '/admin/login',
    element: withSuspense(
      <AdminAuthProvider>
        <AdminLoginPage />
      </AdminAuthProvider>,
    ),
  },
  {
    path: '/admin',
    element: withSuspense(
      <AdminAuthProvider>
        <ProtectedAdminRoute />
      </AdminAuthProvider>,
    ),
    children: [
      {
        element: withSuspense(<AdminLayout />),
        children: [
          { index: true, element: <Navigate replace to="/admin/products" /> },
          { path: 'products', element: withSuspense(<AdminProductsPage />) },
          { path: 'products/new', element: withSuspense(<AdminProductNewPage />) },
          { path: 'products/:id', element: withSuspense(<AdminProductEditPage />) },
          { path: 'metrics', element: withSuspense(<AdminMetricsPage />) },
        ],
      },
    ],
  },
]);
