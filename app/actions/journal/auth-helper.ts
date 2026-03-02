'use server';
import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

export const getAuthUser = cache(async () => {
  const start = Date.now();
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.warn(`⚠️ [Auth] Usuário não encontrado. Time: ${Date.now() - start}ms`);
    return null;
  }

  console.log(`⏱️  [Auth Internal] Verificação: ${Date.now() - start}ms`);
  return user.id;
});