import { LogIn } from 'lucide-react';
import { Button, TextInput } from '../../../shared/ui';

export function AdminLoginPage() {
  return (
    <section className="max-w-md rounded-md bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Admin login</h2>
        <p className="mt-2 text-sm text-slate-600">Supabase Auth login will be connected in a later step.</p>
      </div>
      <form className="grid gap-4">
        <TextInput autoComplete="email" label="Email" placeholder="admin@example.com" type="email" />
        <TextInput autoComplete="current-password" label="Password" placeholder="Password" type="password" />
        <Button className="mt-1" icon={<LogIn aria-hidden="true" size={18} />} type="submit">
          Sign in
        </Button>
      </form>
    </section>
  );
}
