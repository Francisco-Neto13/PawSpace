'use server';
import prisma from '@/shared/lib/prisma';
import { revalidatePath } from 'next/cache';
import { JournalInput } from './types';
import { getAuthUser } from './auth-helper';
import { LIMITS } from '@/shared/lib/limits';

const MAX_ENTRIES = LIMITS.quantity.journalEntries;
const TITLE_MAX = LIMITS.journal.title;
const BODY_MAX = LIMITS.journal.body;

export async function saveJournalEntry(data: JournalInput) {
  const totalStart = Date.now();
  const isTemporaryId = Boolean(data.id && data.id.startsWith('temp-'));
  const shouldUpdate = Boolean(data.id && !isTemporaryId);

  console.log(`[Journal] Iniciando POST: ${shouldUpdate ? 'UPDATE' : 'CREATE'}`);

  const userId = await getAuthUser();
  if (!userId) return { success: false, error: 'Nao autorizado' };

  const title = (data.title || '').trim();
  const body = (data.body || '').trim();

  if (title.length > TITLE_MAX) {
    return { success: false, error: `Titulo pode ter no maximo ${TITLE_MAX} caracteres.` };
  }
  if (body.length > BODY_MAX) {
    return { success: false, error: `Conteudo pode ter no maximo ${BODY_MAX} caracteres.` };
  }

  if (!shouldUpdate) {
    const count = await prisma.journalEntry.count({ where: { userId } });
    if (count >= MAX_ENTRIES) {
      return { success: false, error: `Limite de ${MAX_ENTRIES} entradas no diario atingido.` };
    }
  }

  try {
    const dbStart = Date.now();
    const entry = shouldUpdate
      ? await prisma.journalEntry.update({
          where: { id: data.id, userId },
          data: { title, body, skillId: data.skillId || null },
        })
      : await prisma.journalEntry.create({
          data: { title, body, userId, skillId: data.skillId || null },
        });

    console.log(`[DB] Persistencia Prisma: ${Date.now() - dbStart}ms`);
    revalidatePath('/journal');
    console.log(`[Journal] Operacao TOTAL finalizada em: ${Date.now() - totalStart}ms`);
    return { success: true, entry };
  } catch (error) {
    console.error('[Journal Mutation] Erro ao salvar entrada:', error);
    return { success: false };
  }
}

export async function deleteJournalEntry(id: string) {
  const userId = await getAuthUser();
  if (!userId) return { success: false };
  try {
    const start = Date.now();
    const result = await prisma.journalEntry.deleteMany({ where: { id, userId } });
    revalidatePath('/journal');
    console.log(`[DB] Delete Journal: ${Date.now() - start}ms`);
    if (result.count === 0) {
      console.warn(`[Journal Mutation] Entrada nao encontrada para delete (id=${id}).`);
      return { success: true, alreadyDeleted: true };
    }
    return { success: true };
  } catch (error) {
    console.error('[Journal Mutation] Erro ao deletar entrada:', error);
    return { success: false };
  }
}
