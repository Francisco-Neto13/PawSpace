'use server';
import prisma from '@/shared/lib/prisma';
import { revalidatePath } from 'next/cache';
import { JournalInput } from './types';
import { enforceUserActionRateLimit, validateIdentifier } from '@/shared/server/actionSecurity';
import { getAuthUser } from '@/shared/server/auth';
import { sanitizeJournalHtml } from '@/shared/server/journalSanitizer';
import { LIMITS } from '@/shared/lib/limits';

const MAX_ENTRIES = LIMITS.quantity.journalEntries;
const TITLE_MAX = LIMITS.journal.title;
const BODY_MAX = LIMITS.journal.body;
const JOURNAL_ID_MAX = 128;
const SKILL_ID_MAX = 128;
const JOURNAL_SAVE_RATE_LIMIT = 40;
const JOURNAL_SAVE_WINDOW_MS = 5 * 60 * 1000;
const JOURNAL_DELETE_RATE_LIMIT = 20;
const JOURNAL_DELETE_WINDOW_MS = 5 * 60 * 1000;

function toClientJournalEntry(entry: {
  id: string;
  title: string;
  body: string;
  skillId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: entry.id,
    title: entry.title,
    body: entry.body,
    skillId: entry.skillId,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

async function resolveOwnedSkillId(skillIdInput: string | null | undefined, userId: string) {
  if (skillIdInput === undefined || skillIdInput === null) return { skillId: null as string | null };

  const validated = validateIdentifier(skillIdInput, { allowEmpty: true, maxLength: SKILL_ID_MAX });
  if (!validated.ok) return { skillId: null as string | null, error: 'Skill invalida para este usuario.' };
  if (!validated.value) return { skillId: null as string | null };

  const skill = await prisma.skill.findFirst({
    where: { id: validated.value, userId },
    select: { id: true },
  });

  if (!skill) return { skillId: null as string | null, error: 'Skill invalida para este usuario.' };
  return { skillId: skill.id };
}

export async function saveJournalEntry(data: JournalInput) {
  const totalStart = Date.now();
  const isTemporaryId = Boolean(data.id && data.id.startsWith('temp-'));
  const shouldUpdate = Boolean(data.id && !isTemporaryId);

  console.log(`[Journal] Iniciando POST: ${shouldUpdate ? 'UPDATE' : 'CREATE'}`);

  const userId = await getAuthUser();
  if (!userId) return { success: false, error: 'Nao autorizado' };

  const rateLimit = enforceUserActionRateLimit({
    scope: 'journal-save',
    userId,
    limit: JOURNAL_SAVE_RATE_LIMIT,
    windowMs: JOURNAL_SAVE_WINDOW_MS,
  });
  if (!rateLimit.allowed) {
    return { success: false, error: 'Muitas alteracoes no diario. Tente novamente em instantes.' };
  }

  if (shouldUpdate) {
    const validatedId = validateIdentifier(data.id, { maxLength: JOURNAL_ID_MAX });
    if (!validatedId.ok || !validatedId.value) {
      return { success: false, error: 'Entrada invalida.' };
    }
  }

  const title = (data.title || '').trim();
  const body = (data.body || '').trim();

  if (title.length > TITLE_MAX) {
    return { success: false, error: `Titulo pode ter no maximo ${TITLE_MAX} caracteres.` };
  }
  if (body.length > BODY_MAX) {
    return { success: false, error: `Conteudo pode ter no maximo ${BODY_MAX} caracteres.` };
  }

  const sanitizedBody = sanitizeJournalHtml(body);

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
          data: { title, body: sanitizedBody, skillId: skillResolution.skillId },
          select: {
            id: true,
            title: true,
            body: true,
            skillId: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      : await prisma.journalEntry.create({
          data: { title, body: sanitizedBody, userId, skillId: skillResolution.skillId },
          select: {
            id: true,
            title: true,
            body: true,
            skillId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

    console.log(`[DB] Persistência Prisma: ${Date.now() - dbStart}ms`);
    revalidatePath('/journal');
    console.log(`[Journal] Operação total finalizada em: ${Date.now() - totalStart}ms`);
    return { success: true, entry: toClientJournalEntry(entry) };
  } catch (error) {
    console.error('[Journal Mutation] Erro ao salvar entrada:', error);
    return { success: false };
  }
}

export async function deleteJournalEntry(id: string) {
  const userId = await getAuthUser();
  if (!userId) return { success: false };
  const rateLimit = enforceUserActionRateLimit({
    scope: 'journal-delete',
    userId,
    limit: JOURNAL_DELETE_RATE_LIMIT,
    windowMs: JOURNAL_DELETE_WINDOW_MS,
  });
  if (!rateLimit.allowed) {
    return { success: false, error: 'Muitas tentativas de exclusao. Tente novamente em instantes.' };
  }

  const validatedId = validateIdentifier(id, { maxLength: JOURNAL_ID_MAX });
  if (!validatedId.ok || !validatedId.value) {
    return { success: false, error: 'Entrada invalida.' };
  }
  try {
    const start = Date.now();
    const result = await prisma.journalEntry.deleteMany({ where: { id: validatedId.value, userId } });
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
