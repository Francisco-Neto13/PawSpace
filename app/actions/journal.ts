'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';

const getAuthUser = cache(async () => {
  const start = Date.now();
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.warn(`⚠️ [Auth] Usuário não encontrado ou sessão expirada. Time: ${Date.now() - start}ms`);
    return null;
  }

  console.log(`⏱️  [Auth Internal] Verificação de usuário: ${Date.now() - start}ms`);
  return user.id;
});

export type JournalInput = {
  id?: string;
  title: string;
  body: string;
  skillId?: string | null;
};

export async function saveJournalEntry(data: JournalInput) {
  const totalStart = Date.now();
  console.log(`🚀 [Journal] Iniciando POST: ${data.id ? 'UPDATE' : 'CREATE'}`);

  const userId = await getAuthUser();
  if (!userId) {
    return { success: false, error: 'Não autorizado' };
  }

  try {
    const dbStart = Date.now();
    let entry;

    if (data.id) {
      entry = await prisma.journalEntry.update({
        where: { id: data.id, userId }, 
        data: {
          title: data.title,
          body: data.body,
          skillId: data.skillId || null,
        },
      });
    } else {
      entry = await prisma.journalEntry.create({
        data: {
          title: data.title,
          body: data.body,
          userId: userId,
          skillId: data.skillId || null,
        },
      });
    }
    
    console.log(`⏱️  [DB] Persistência Prisma: ${Date.now() - dbStart}ms`);

    const revalStart = Date.now();
    revalidatePath('/journal');
    console.log(`⏱️  [Next] RevalidatePath: ${Date.now() - revalStart}ms`);

    console.log(`✅ [Journal] Operação TOTAL finalizada em: ${Date.now() - totalStart}ms`);
    return { success: true, entry };
  } catch (error) {
    console.error('❌ [Journal] Erro ao salvar entrada:', error);
    return { success: false };
  }
}

export async function getJournalEntries() {
  const userId = await getAuthUser();
  if (!userId) return [];

  try {
    const start = Date.now();
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      include: {
        skill: {
          select: { name: true, color: true, icon: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`⏱️  [DB] Fetch Many: ${Date.now() - start}ms`);
    return entries;
  } catch (error) {
    console.error('❌ [Journal] Erro ao buscar entradas:', error);
    return [];
  }
}

export async function getJournalEntryById(id: string) {
  const userId = await getAuthUser();
  if (!userId) return null;

  try {
    const start = Date.now();
    const entry = await prisma.journalEntry.findUnique({
      where: { id, userId }
    });
    console.log(`⏱️  [DB] Fetch Unique: ${Date.now() - start}ms`);
    return entry;
  } catch (error) {
    console.error('❌ [Journal] Erro ao buscar entrada específica:', error);
    return null;
  }
}

export async function deleteJournalEntry(id: string) {
  const userId = await getAuthUser();
  if (!userId) return { success: false };

  try {
    const start = Date.now();
    await prisma.journalEntry.delete({
      where: { id, userId }
    });
    revalidatePath('/journal');
    console.log(`⏱️  [DB] Delete: ${Date.now() - start}ms`);
    return { success: true };
  } catch (error) {
    console.error('❌ [Journal] Erro ao deletar entrada:', error);
    return { success: false };
  }
}