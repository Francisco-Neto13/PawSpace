'use server';

import prisma from '@/shared/lib/prisma';
import { getAuthUser } from './journal/auth-helper';

export async function getGlobalStats() {
  const userId = await getAuthUser();

  if (!userId) {
    return { totalSkills: 0, totalLibraryContents: 0, totalJournalEntries: 0 };
  }

  try {
    const [totalSkills, totalLibraryContents, totalJournalEntries] = await Promise.all([
      prisma.skill.count({ where: { userId } }),
      prisma.libraryContent.count({ where: { userId } }),
      prisma.journalEntry.count({ where: { userId } }),
    ]);

    return { totalSkills, totalLibraryContents, totalJournalEntries };
  } catch (error) {
    console.error('[Stats] Erro ao buscar stats globais:', error);
    return { totalSkills: 0, totalLibraryContents: 0, totalJournalEntries: 0 };
  }
}
