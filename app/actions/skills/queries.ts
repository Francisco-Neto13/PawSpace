'use server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.warn("⚠️ [Auth] Nenhum usuário autenticado encontrado na sessão.");
    return null;
  }
  return user.id;
}

export async function getSkillsForLibrary() {
  const userId = await getAuthUser();
  if (!userId) return [];

  try {
    const skills = await prisma.skill.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        isUnlocked: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    
    return skills;
  } catch (error) {
    console.error('❌ [Library Query] Erro no Prisma:', error);
    return [];
  }
}

export async function getSkillsFull() {
  const userId = await getAuthUser();
  if (!userId) return { nodes: [], edges: [] };

  console.log(`🚀 [Nexus Query] Buscando árvore para user: ${userId}`);

  try {
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

    console.log(`📦 [Nexus Query] Mapeamento concluído: ${nodes.length} Nodes e ${edges.length} Edges.`);
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