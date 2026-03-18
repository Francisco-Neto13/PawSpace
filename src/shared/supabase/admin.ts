import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedAdminClient: SupabaseClient | null | undefined;

export function createAdminClient(): SupabaseClient | null {
  if (cachedAdminClient !== undefined) {
    return cachedAdminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    cachedAdminClient = null;
    return cachedAdminClient;
  }

  cachedAdminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedAdminClient;
}
