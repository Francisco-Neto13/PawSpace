'use server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addSkill(data: any) {
  try {
    const { label, name, ...rest } = data;
    
    const newSkill = await prisma.skill.create({
      data: { 
        ...rest, 
        name: label || name,
        isUnlocked: false 
      },
    });

    revalidatePath('/tree');
    revalidatePath('/overview');
    return { success: true, skill: newSkill };
  } catch (error) {
    console.error('❌ [Nexus Mutation] Erro ao criar skill:', error);
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

    console.log(`[Nexus Mutation] Update Posições: ${Date.now() - start}ms`);
    return { success: true };
  } catch (error) {
    console.error(`❌ [Nexus Mutation] Erro no update em massa:`, error);
    return { success: false };
  }
}

export async function toggleSkillStatus(skillId: string, isUnlocked: boolean) {
  try {
    await prisma.skill.update({
      where: { id: skillId },
      data: { isUnlocked },
    });
    
    revalidatePath('/overview');
    return { success: true };
  } catch (error) {
    console.error(`❌ [Nexus Mutation] Erro ao alternar status:`, error);
    return { success: false };
  }
}

export async function deleteSkill(skillId: string) {
  try {
    await prisma.skill.deleteMany({
      where: { id: skillId }
    });
    
    revalidatePath('/tree');
    revalidatePath('/overview');
    return { success: true };
  } catch (error) {
    console.error(`❌ [Nexus Mutation] Erro ao deletar:`, error);
    return { success: false };
  }
}