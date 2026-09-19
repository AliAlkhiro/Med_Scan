import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '../config/env';

let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  client ??= createClient(env.supabaseUrl, env.supabaseAnonKey);

  return client;
}
