'use server';
import prisma from '@/shared/lib/prisma';
import { revalidatePath } from 'next/cache';
import { JournalInput } from './types';
import { getAuthUser } from '@/shared/server/auth';
import { LIMITS } from '@/shared/lib/limits';

const MAX_ENTRIES = LIMITS.quantity.journalEntries;
const TITLE_MAX = LIMITS.journal.title;
const BODY_MAX = LIMITS.journal.body;

async function resolveOwnedSkillId(skillIdInput: string | null | undefined, userId: string) {
  if (skillIdInput === undefined || skillIdInput === null) return { skillId: null as string | null };

  const skillId = skillIdInput.trim();
  if (!skillId) return { skillId: null as string | null };

  const skill = await prisma.skill.findFirst({
    where: { id: skillId, userId },
    select: { id: true },
  });

  if (!skill) return { skillId: null as string | null, error: 'Skill inválida para este usuário.' };
  return { skillId: skill.id };
}

export async function saveJournalEntry(data: JournalInput) {
  const totalStart = Date.now();
  const isTemporaryId = Boolean(data.id && data.id.startsWith('temp-'));
  const shouldUpdate = Boolean(data.id && !isTemporaryId);

  console.log(`[Journal] Iniciando POST: ${shouldUpdate ? 'UPDATE' : 'CREATE'}`);

  const userId = await getAuthUser();
  if (!userId) return { success: false, error: 'Não autorizado' };

  const title = (data.title || '').trim();
  const body = (data.body || '').trim();

  if (title.length > TITLE_MAX) {
    return { success: false, error: `Título pode ter no máximo ${TITLE_MAX} caracteres.` };
  }
  if (body.length > BODY_MAX) {
    return { success: false, error: `Conteúdo pode ter no máximo ${BODY_MAX} caracteres.` };
  }

  if (!shouldUpdate) {
    const count = await prisma.journalEntry.count({ where: { userId } });
    if (count >= MAX_ENTRIES) {
      return { success: false, error: `Limite de ${MAX_ENTRIES} entradas no diário atingido.` };
    }
  }

  try {
    const skillResolution = await resolveOwnedSkillId(data.skillId, userId);
    if (skillResolution.error) {
      return { success: false, error: skillResolution.error };
    }

    const dbStart = Date.now();
    const entry = shouldUpdate
      ? await prisma.journalEntry.update({
          where: { id: data.id, userId },
          data: { title, body, skillId: skillResolution.skillId },
        })
      : await prisma.journalEntry.create({
          data: { title, body, userId, skillId: skillResolution.skillId },
        });

    console.log(`[DB] Persistência Prisma: ${Date.now() - dbStart}ms`);
    revalidatePath('/journal');
    console.log(`[Journal] Operação total finalizada em: ${Date.now() - totalStart}ms`);
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
      console.warn(`[Journal Mutation] Entrada não encontrada para delete (id=${id}).`);
      return { success: true, alreadyDeleted: true };
    }
    return { success: true };
  } catch (error) {
    console.error('[Journal Mutation] Erro ao deletar entrada:', error);
    return { success: false };
  }
}
