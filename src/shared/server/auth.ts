import type { User } from '@supabase/supabase-js';

import { createClient } from '@/shared/supabase/server';

export type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getCurrentUser(client?: ServerSupabaseClient): Promise<User | null> {
  const supabase = client ?? (await createClient());
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getAuthUser(client?: ServerSupabaseClient): Promise<string | null> {
  const user = await getCurrentUser(client);
  return user?.id ?? null;
}
