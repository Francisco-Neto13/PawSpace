'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { JournalInput } from './types';
import { getAuthUser } from './auth-helper';

export async function saveJournalEntry(data: JournalInput) {
  const totalStart = Date.now();
  console.log(`🚀 [Journal] Iniciando POST: ${data.id ? 'UPDATE' : 'CREATE'}`);

  const userId = await getAuthUser();
  if (!userId) return { success: false, error: 'Não autorizado' };

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
    console.error('❌ [Journal Mutation] Erro ao salvar entrada:', error);
    return { success: false };
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
    console.log(`⏱️  [DB] Delete Journal: ${Date.now() - start}ms`);
    return { success: true };
  } catch (error) {
    console.error('❌ [Journal Mutation] Erro ao deletar entrada:', error);
    return { success: false };
  }
}