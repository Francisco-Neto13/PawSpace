'use server';
import prisma from '@/lib/prisma';
import { SkillRow } from './types';

export async function getSkillsFull(userId: string): Promise<SkillRow[]> {
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
    console.error('❌ [Nexus Query] Erro ao buscar skills:', error);
    return [];
  }
}

export async function getSkillsSummary(userId: string) {
  const start = Date.now(); 
  try {
    const skills = await prisma.skill.findMany({
      where: { userId },
      select: { id: true, isUnlocked: true, category: true },
    });

    console.log(`Query (Summary): ${Date.now() - start}ms`);
    
    return skills;
  } catch (error) {
    console.error('❌ [Nexus Query] Erro ao buscar resumo:', error);
    return [];
  }
}