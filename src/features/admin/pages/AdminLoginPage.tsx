import { LogIn } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BrandFooter } from '../../../shared/brand';
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
    <div className="admin-surface relative isolate flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(34,199,204,0.18)_0%,rgba(18,63,45,0.22)_28%,transparent_52%),linear-gradient(135deg,#061512_0%,#10241f_48%,#07100e_100%)] text-white">
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
      <main className="grid flex-1 place-items-center px-5 py-8">
        <section className="w-full max-w-md rounded-xl border border-white/10 bg-ink/85 p-6 shadow-xl backdrop-blur-md">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-aqua">Admin login</p>
            <h1 className="mt-2 text-2xl font-bold text-white">MedScan Admin</h1>
            <p className="mt-3 text-sm text-white/65">Sign in with an admin account to manage product records.</p>
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
      <BrandFooter tone="dark" />
    </div>
  );
}
