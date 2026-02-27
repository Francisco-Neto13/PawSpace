'use server';
import prisma from '@/lib/prisma';
import { cache } from 'react';
import { SkillRow } from './types';

export const getSkillsFull = cache(async (userId: string): Promise<SkillRow[]> => {
  const start = Date.now();
  try {
    const skills = await prisma.skill.findMany({
      where: { userId },
      include: { contents: true },
      orderBy: { createdAt: 'asc' },
    });
    
    console.log(`[Nexus Query] Full Fetch: ${Date.now() - start}ms`);
    return skills as unknown as SkillRow[];
  } catch (error) {
    console.error('❌ [Nexus Query] Erro ao buscar skills completas:', error);
    return [];
  }
});

export const getSkillsSummary = cache(async (userId: string) => {
  const start = Date.now();
  try {
    const skills = await prisma.skill.findMany({
      where: { userId },
      select: {
        id: true,
        isUnlocked: true,
        category: true,
      },
    });
    
    console.log(`[Nexus Query] Summary Fetch: ${Date.now() - start}ms`);
    return skills;
  } catch (error) {
    console.error('❌ [Nexus Query] Erro ao buscar resumo de skills:', error);
    return [];
  }
});