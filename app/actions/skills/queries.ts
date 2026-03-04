'use server';

import prisma from '@/shared/lib/prisma';
import { getAuthUser } from './auth-helper';

export async function getSkillsFull() {
  const userId = await getAuthUser();
  if (!userId) return { nodes: [], edges: [] };

  try {
    const start = Date.now();
    const skills = await prisma.skill.findMany({
      where: { userId },
      include: { contents: true },
      orderBy: { createdAt: 'asc' },
    });

    const nodes = skills.map((skill) => ({
      id: skill.id,
      type: 'skill', 
      position: { 
        x: skill.positionX ?? 0, 
        y: skill.positionY ?? 0 
      },
      data: {
        ...skill,
        label: skill.name, 
      },
    }));

    const edges = skills
      .filter((s) => s.parentId)
      .map((s) => {
        const parent = skills.find(p => p.id === s.parentId);
        const isPathActive = s.isUnlocked && (parent?.isUnlocked ?? false);

        return {
          id: `e-${s.parentId}-${s.id}`,
          source: s.parentId!,
          target: s.id,
          type: 'skill', 
          data: {
            unlocked: isPathActive, 
            category: s.category,
          },
        };
      });

    console.log(`⏱️  [Nexus Query] Fetch: ${Date.now() - start}ms | Nodes: ${nodes.length}`);
    return { nodes, edges };
  } catch (error) {
    console.error('❌ [Nexus Query] Erro Crítico:', error);
    return { nodes: [], edges: [] };
  }
}

export async function getSkillsSummary() {
  const userId = await getAuthUser();
  if (!userId) return { total: 0, unlocked: 0, progress: 0 };

  try {
    const skills = await prisma.skill.findMany({
      where: { userId },
      select: { isUnlocked: true }
    });

    const total = skills.length;
    const unlocked = skills.filter(s => s.isUnlocked).length;
    const progress = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    return { total, unlocked, progress };
  } catch (error) {
    console.error('❌ [Summary Query] Erro:', error);
    return { total: 0, unlocked: 0, progress: 0 };
  }
}
