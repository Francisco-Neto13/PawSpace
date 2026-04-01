'use server';

import prisma from '@/shared/lib/prisma';
import { validateIdentifier } from '@/shared/server/actionSecurity';
import { getAuthUser } from '@/shared/server/auth';
import { sanitizeJournalHtml } from '@/shared/server/journalSanitizer';

const JOURNAL_ID_MAX = 128;

type JournalEntryRow = {
  id: string;
  title: string;
  body: string;
  skillId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type JournalEntriesResult =
  | { status: 'ok'; entries: JournalEntryRow[] }
  | { status: 'unauthorized'; entries: [] }
  | { status: 'error'; entries: [] };

export async function getJournalEntries() {
  const userId = await getAuthUser();
  if (!userId) return { status: 'unauthorized', entries: [] } as const;

  try {
    const start = Date.now();
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        body: true,
        skillId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`⏱️  [DB] Fetch Many Journal: ${Date.now() - start}ms`);
    return {
      status: 'ok',
      entries: entries.map((entry) => ({
        ...entry,
        body: sanitizeJournalHtml(entry.body),
      })),
    } as const;
  } catch (error) {
    console.error('❌ [Journal Query] Erro ao buscar entradas:', error);
    return { status: 'error', entries: [] } as const;
  }
}

export async function getJournalEntryById(id: string) {
  const userId = await getAuthUser();
  if (!userId) return null;

  const validatedId = validateIdentifier(id, { maxLength: JOURNAL_ID_MAX });
  if (!validatedId.ok || !validatedId.value) return null;

  try {
    const start = Date.now();
    const entry = await prisma.journalEntry.findUnique({
      where: { id: validatedId.value, userId },
      select: {
        id: true,
        title: true,
        body: true,
        skillId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    console.log(`⏱️  [DB] Fetch Unique Journal: ${Date.now() - start}ms`);
    return entry
      ? {
          ...entry,
          body: sanitizeJournalHtml(entry.body),
        }
      : null;
  } catch (error) {
    console.error('❌ [Journal Query] Erro ao buscar entrada específica:', error);
    return null;
  }
}
