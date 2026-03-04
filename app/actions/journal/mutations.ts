'use server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { JournalInput } from './types';
import { getAuthUser } from './auth-helper';
import { LIMITS } from '@/lib/limits';

const MAX_ENTRIES = LIMITS.quantity.journalEntries;
const TITLE_MAX   = LIMITS.journal.title;
const BODY_MAX    = LIMITS.journal.body;

export async function saveJournalEntry(data: JournalInput) {
  const totalStart = Date.now();
  console.log(`🚀 [Journal] Iniciando POST: ${data.id ? 'UPDATE' : 'CREATE'}`);

  const userId = await getAuthUser();
  if (!userId) return { success: false, error: 'Não autorizado' };

  const title = (data.title || '').trim();
  const body  = (data.body  || '').trim();

  if (title.length > TITLE_MAX)
    return { success: false, error: `Título pode ter no máximo ${TITLE_MAX} caracteres.` };
  if (body.length > BODY_MAX)
    return { success: false, error: `Conteúdo pode ter no máximo ${BODY_MAX} caracteres.` };

  if (!data.id) {
    const count = await prisma.journalEntry.count({ where: { userId } });
    if (count >= MAX_ENTRIES)
      return { success: false, error: `Limite de ${MAX_ENTRIES} entradas no diário atingido.` };
  }

  try {
    const dbStart = Date.now();
    let entry;

    if (data.id) {
      entry = await prisma.journalEntry.update({
        where: { id: data.id, userId },
        data: { title, body, skillId: data.skillId || null },
      });
    } else {
      entry = await prisma.journalEntry.create({
        data: { title, body, userId, skillId: data.skillId || null },
      });
    }

    console.log(`⏱️  [DB] Persistência Prisma: ${Date.now() - dbStart}ms`);
    revalidatePath('/journal');
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
    await prisma.journalEntry.delete({ where: { id, userId } });
    revalidatePath('/journal');
    console.log(`⏱️  [DB] Delete Journal: ${Date.now() - start}ms`);
    return { success: true };
  } catch (error) {
    console.error('❌ [Journal Mutation] Erro ao deletar entrada:', error);
    return { success: false };
  }
}