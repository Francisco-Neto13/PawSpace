'use server';
import prisma from '@/shared/lib/prisma';
import { getAuthUser } from './journal/auth-helper';

export async function getGlobalStats() {
  const userId = await getAuthUser();
  if (!userId) return { totalLibraryContents: 0, totalJournalEntries: 0 };
  try {
    const [totalLibraryContents, totalJournalEntries] = await Promise.all([
      prisma.libraryContent.count({ where: { userId } }),
      prisma.journalEntry.count({ where: { userId } }),
    ]);
    return { totalLibraryContents, totalJournalEntries };
  } catch (error) {
    console.error('❌ [Stats] Erro ao buscar stats globais:', error);
    return { totalLibraryContents: 0, totalJournalEntries: 0 };
  }
}