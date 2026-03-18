'use server';

import prisma from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/server/auth';

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
    return { status: 'ok', entries } as const;
  } catch (error) {
    console.error('❌ [Journal Query] Erro ao buscar entradas:', error);
    return { status: 'error', entries: [] } as const;
  }
}

export async function getJournalEntryById(id: string) {
  const userId = await getAuthUser();
  if (!userId) return null;

  try {
    const start = Date.now();
    const entry = await prisma.journalEntry.findUnique({
      where: { id, userId },
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
    return entry;
  } catch (error) {
    console.error('❌ [Journal Query] Erro ao buscar entrada específica:', error);
    return null;
  }
}
