'use server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
    return await prisma.skill.findMany({
      where: { userId },
      include: { contents: true },
      orderBy: { createdAt: 'asc' },
    });
  } catch (error) {
    console.error('Erro ao buscar skills:', error);
    return [];
  }
}

export async function addSkill(data: {
  userId: string;
  name: string;
  description?: string;
  icon?: string;
  shape?: string;
  parentId?: string | null;
  positionX?: number;
  positionY?: number;
}) {
  try {
    const newSkill = await prisma.skill.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description ?? null,
        icon: data.icon ?? null,
        shape: data.shape ?? 'hexagon',
        parentId: data.parentId ?? null,
        positionX: data.positionX ?? 0,
        positionY: data.positionY ?? 0,
        isUnlocked: false,
      },
    });
    revalidatePath('/tree', 'page');
    revalidatePath('/overview', 'page');
    return { success: true, skill: newSkill };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Erro ao criar skill:', message);
    return { success: false, error: message };
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
    console.error('Erro ao atualizar status da skill:', error);
    return { success: false, error };
  }
}

export async function updateSkillPosition(skillId: string, x: number, y: number) {
  try {
    await prisma.skill.update({
      where: { id: skillId },
      data: { positionX: x, positionY: y },
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar posição:', error);
    return { success: false };
  }
}

export async function deleteSkill(skillId: string) {
  try {
    await prisma.skill.delete({ where: { id: skillId } });
    revalidatePath('/tree', 'page');
    revalidatePath('/overview', 'page');
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar skill:', error);
    return { success: false, error };
  }
}