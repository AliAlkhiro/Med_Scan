import { LogIn } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BrandFooter, BrandLockup } from '../../../shared/brand';
import { Button, ErrorState, TextInput } from '../../../shared/ui';
import { useAdminAuth } from '../auth/adminAuthContext';

export function AdminLoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { error, isAdmin, isAuthenticated, isLoading, signIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  const from = location.state && typeof location.state === 'object' && 'from' in location.state
    ? (location.state.from as { pathname?: string }).pathname
    : '/admin/products';

  if (isAuthenticated && isAdmin) {
    return <Navigate replace to={from || '/admin/products'} />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const result = await signIn(email.trim(), password);

    if (!result.ok) {
      setFormError(result.message ?? 'Unable to sign in.');
      return;
    }

    navigate(from || '/admin/products', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(135deg,#f3faf7_0%,#eef7ff_52%,#fff1f3_100%)] text-ink">
      <main className="grid flex-1 place-items-center px-5 py-8">
        <section className="w-full max-w-md rounded-md border border-aqua/20 bg-white/95 p-6 shadow-sm">
          <div className="mb-5">
            <BrandLockup compact subtitle="Admin login" />
            <p className="mt-4 text-sm text-slate-600">Sign in with an admin account to manage product records.</p>
          </div>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <TextInput
              autoComplete="email"
              label="Email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              required
              type="email"
              value={email}
            />
            <TextInput
              autoComplete="current-password"
              label="Password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              type="password"
              value={password}
            />
            {formError || error ? (
              <ErrorState message={formError ?? error ?? 'Unable to sign in.'} title="Login failed" />
            ) : null}
            <Button className="mt-1" disabled={isLoading} icon={<LogIn aria-hidden="true" size={18} />} type="submit">
              {isLoading ? 'Signing in' : 'Sign in'}
            </Button>
          </form>
        </section>
      </main>
      <BrandFooter />
    </div>
  );
}
