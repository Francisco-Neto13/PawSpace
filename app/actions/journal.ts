'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

export type JournalInput = {
  id?: string;
  title: string;
  body: string;
  skillId?: string | null;
};

export async function saveJournalEntry(data: JournalInput) {
  const userId = await getAuthUser();
  if (!userId) return { success: false, error: 'Não autorizado' };

  try {
    const entry = await prisma.journalEntry.upsert({
      where: { 
        id: data.id || 'new-id' 
      },
      update: {
        title: data.title,
        body: data.body,
        skillId: data.skillId || null,
      },
      create: {
        title: data.title,
        body: data.body,
        userId: userId,
        skillId: data.skillId || null,
      },
    });

    return { success: true, entry };
  } catch (error) {
    console.error('❌ [Journal] Erro ao salvar entrada:', error);
    return { success: false };
  }
}

export async function getJournalEntries() {
  const userId = await getAuthUser();
  if (!userId) return [];

  try {
    return await prisma.journalEntry.findMany({
      where: { userId },
      include: {
        skill: {
          select: { name: true, color: true, icon: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('❌ [Journal] Erro ao buscar entradas:', error);
    return [];
  }
}

export async function getJournalEntryById(id: string) {
  const userId = await getAuthUser();
  if (!userId) return null;

  try {
    return await prisma.journalEntry.findUnique({
      where: { id, userId }
    });
  } catch (error) {
    console.error('❌ [Journal] Erro ao buscar entrada específica:', error);
    return null;
  }
}

export async function deleteJournalEntry(id: string) {
  const userId = await getAuthUser();
  if (!userId) return { success: false };

  try {
    await prisma.journalEntry.delete({
      where: { id, userId }
    });
    return { success: true };
  } catch (error) {
    console.error('❌ [Journal] Erro ao deletar entrada:', error);
    return { success: false };
  }
}