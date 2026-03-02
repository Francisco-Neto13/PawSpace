'use server';

import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

export const getAuthUser = cache(async () => {
  const start = Date.now();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.warn(`⚠️ [Skills Auth] Usuário não encontrado. Time: ${Date.now() - start}ms`);
    return null;
  }

  console.log(`⏱️  [Skills Auth] Verificação: ${Date.now() - start}ms`);
  return user.id;
});