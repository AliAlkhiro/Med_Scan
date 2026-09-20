import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';

export type AdminAuthState = {
  error: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
  user: User | null;
};

export const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider.');
  }

  return context;
}
