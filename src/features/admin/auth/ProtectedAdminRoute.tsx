import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../../shared/ui';
import { useAdminAuth } from './adminAuthContext';

export function ProtectedAdminRoute() {
  const location = useLocation();
  const { error, isAdmin, isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 px-6 text-ink">
        <LoadingState label="Checking admin access" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/admin/login" />;
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 px-6 text-ink">
        <div className="max-w-md">
          <ErrorState
            message={error ?? 'Your account is signed in, but it does not have Med Scan admin access.'}
            title="Admin access required"
          />
        </div>
      </div>
    );
  }

  return <Outlet />;
}
