'use server';
import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

export const getAuthUser = cache(async () => {
  const start = Date.now();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.warn(`⚠️ [Library Auth] Usuário não encontrado. Time: ${Date.now() - start}ms`);
    return null;
  }

  console.log(`⏱️  [Library Auth] Verificação: ${Date.now() - start}ms`);
  return user.id;
});