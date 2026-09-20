import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PageLoading } from './shared/PageLoading';
import { PublicLayout } from './features/public/PublicLayout';
import { ScannerPage } from './features/public/pages/ScannerPage';
import { ProductPage, ProductPageError } from './features/public/pages/ProductPage';
import { productPageLoader } from './features/public/pages/productPageLoader';
import { NotFoundPage } from './features/public/pages/NotFoundPage';

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

const withSuspense = (element: React.ReactNode) => (
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
        element: <ProductPage />,
        errorElement: <ProductPageError />,
        loader: productPageLoader,
      },
      { path: 'not-found/:barcode', element: <NotFoundPage /> },
    ],
  },
  { path: '/admin/login', element: withSuspense(<AdminLoginPage />) },
  {
    path: '/admin',
    element: withSuspense(<ProtectedAdminRoute />),
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
