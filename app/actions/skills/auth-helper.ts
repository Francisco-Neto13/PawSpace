'use server';
import { createClient } from '@/shared/supabase/server';

export async function getAuthUser() {
  const start = Date.now();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.warn(`⚠️ [Skills Auth] Usuário não encontrado. Time: ${Date.now() - start}ms`);
    return null;
  }

  console.log(`⏱️  [Skills Auth] Verificação: ${Date.now() - start}ms`);
  return user.id;
}