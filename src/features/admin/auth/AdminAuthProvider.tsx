import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../../../config/env';
import { getSupabaseClient } from '../../../lib/supabase';
import { AdminAuthContext, type AdminAuthState } from './adminAuthContext';

async function resolveIsAdmin(session: Session | null) {
  if (!session || !isSupabaseConfigured) {
    return false;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('is_admin');

  if (error) {
    throw error;
  }

  return data === true;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const refreshAdminStatus = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);

    if (!nextSession) {
      setIsAdmin(false);
      setError(null);
      return false;
    }

    try {
      const nextIsAdmin = await resolveIsAdmin(nextSession);
      setIsAdmin(nextIsAdmin);
      setError(nextIsAdmin ? null : 'This account is not listed as a Med Scan admin.');
      return nextIsAdmin;
    } catch {
      setIsAdmin(false);
      setError('Admin access could not be verified. Please try again.');
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      setError('Supabase is not configured for this environment.');
      return undefined;
    }

    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      refreshAdminStatus(data.session).finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      refreshAdminStatus(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [refreshAdminStatus]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseConfigured) {
        const message = 'Supabase is not configured for this environment.';
        setError(message);
        return { ok: false, message };
      }

      setIsLoading(true);
      setError(null);

      const supabase = getSupabaseClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        const message = signInError.message || 'Unable to sign in with those credentials.';
        setIsLoading(false);
        setError(message);
        return { ok: false, message };
      }

      const nextIsAdmin = await refreshAdminStatus(data.session);
      setIsLoading(false);

      if (!nextIsAdmin) {
        await supabase.auth.signOut();
        const message = 'This account is not listed as a Med Scan admin.';
        setError(message);
        return { ok: false, message };
      }

      return { ok: true };
    },
    [refreshAdminStatus],
  );

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSession(null);
      setIsAdmin(false);
      return;
    }

    setIsLoading(true);
    await getSupabaseClient().auth.signOut();
    setSession(null);
    setIsAdmin(false);
    setIsLoading(false);
  }, []);

  const value = useMemo<AdminAuthState>(
    () => ({
      error,
      isAdmin,
      isAuthenticated: Boolean(session),
      isLoading,
      signIn,
      signOut,
      user: session?.user ?? null,
    }),
    [error, isAdmin, isLoading, session, signIn, signOut],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
