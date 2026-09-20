import { LogIn } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
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
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-8 text-ink">
      <section className="w-full max-w-md rounded-md bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h1 className="text-xl font-bold">Admin login</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in with an admin account to manage Med Scan products.</p>
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
  );
}
