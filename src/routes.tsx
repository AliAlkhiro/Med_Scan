import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PageLoading } from './shared/PageLoading';
import { PublicLayout } from './features/public/PublicLayout';
import { ScannerPage } from './features/public/pages/ScannerPage';
import { ProductPage } from './features/public/pages/ProductPage';
import { NotFoundPage } from './features/public/pages/NotFoundPage';

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

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoading />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <ScannerPage /> },
      { path: 'product/:barcode', element: <ProductPage /> },
      { path: 'not-found/:barcode', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: withSuspense(<AdminLayout />),
    children: [
      { path: 'login', element: withSuspense(<AdminLoginPage />) },
      { path: 'products', element: withSuspense(<AdminProductsPage />) },
      { path: 'products/new', element: withSuspense(<AdminProductNewPage />) },
      { path: 'products/:id', element: withSuspense(<AdminProductEditPage />) },
      { path: 'metrics', element: withSuspense(<AdminMetricsPage />) },
    ],
  },
]);
