'use server';
import prisma from '@/lib/prisma';

export type SkillRow = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  shape: string;
  isUnlocked: boolean;
  parentId: string | null;
  positionX: number;
  positionY: number;
  contents: { id: string; title: string; url: string | null; description: string | null }[];
};

export async function getSkills(userId: string): Promise<SkillRow[]> {
  try {
    const skills = await prisma.skill.findMany({
      where: { userId },
      include: { contents: true },
      orderBy: { createdAt: 'asc' },
    });
    return skills as unknown as SkillRow[];
  } catch (error) {
    console.error('Erro ao buscar skills:', error);
    return [];
  }
}

export async function addSkill(data: any) {
  try {
    const newSkill = await prisma.skill.create({
      data: { ...data, isUnlocked: false },
    });
    return { success: true, skill: newSkill };
  } catch (error) {
    return { success: false };
  }
}

export async function updateManySkillPositions(
  positions: { skillId: string; x: number; y: number }[]
) {
  const start = Date.now();
  try {
    if (!positions.length) return { success: true };

    const ids = positions.map(p => `'${p.skillId}'`).join(',');
    const casesX = positions.map(p => `WHEN id = '${p.skillId}' THEN ${Math.round(p.x)}`).join(' ');
    const casesY = positions.map(p => `WHEN id = '${p.skillId}' THEN ${Math.round(p.y)}`).join(' ');

    await prisma.$executeRawUnsafe(`
      UPDATE "Skill"
      SET 
        "positionX" = CASE ${casesX} END,
        "positionY" = CASE ${casesY} END
      WHERE id IN (${ids})
    `);

    console.log(`[Nexus Action] SQL Bruto: ${Date.now() - start}ms`);

    return { success: true };
  } catch (error) {
    console.error(`❌ [Nexus Action] Erro:`, error);
    return { success: false };
  }
}

export async function toggleSkillStatus(skillId: string, isUnlocked: boolean) {
  try {
    await prisma.skill.update({
      where: { id: skillId },
      data: { isUnlocked },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteSkill(skillId: string) {
  try {
    await prisma.skill.delete({ where: { id: skillId } });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}