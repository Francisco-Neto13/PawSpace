'use server';

import prisma from '@/lib/prisma';
import { getAuthUser } from './auth-helper';

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
    console.log(`⏱️  [DB] Fetch Many Journal: ${Date.now() - start}ms`);
    return entries;
  } catch (error) {
    console.error('❌ [Journal Query] Erro ao buscar entradas:', error);
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
    console.log(`⏱️  [DB] Fetch Unique Journal: ${Date.now() - start}ms`);
    return entry;
  } catch (error) {
    console.error('❌ [Journal Query] Erro ao buscar entrada específica:', error);
    return null;
  }
}