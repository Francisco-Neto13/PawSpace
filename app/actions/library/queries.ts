'use server';
import prisma from '@/shared/lib/prisma';
import { getAuthUser } from './auth-helper';

export async function getContentsBySkill(skillId: string) {
  const totalStart = Date.now();
  try {
    const userId = await getAuthUser();
    if (!userId) return [];
    const dbStart = Date.now();
    const contents = await prisma.libraryContent.findMany({
      where: { skillId, userId },
      select: {
        id: true,
        skillId: true,
        type: true,
        title: true,
        url: true,
        fileKey: true,
        body: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    console.log(`⏱️  [Library DB] Fetch Contents: ${Date.now() - dbStart}ms`);
    return contents;
  } catch (error) {
    console.error('❌ [Library Query] Erro ao buscar conteúdos:', error);
    return [];
  }
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
      },
      orderBy: { createdAt: 'asc' },
    });
    return skills;
  } catch (error) {
    console.error('❌ [Library Query] Erro ao buscar skills para biblioteca:', error);
    return [];
  }
}

export async function getAllContentsForLibrary() {
  try {
    const userId = await getAuthUser();
    if (!userId) return [];
    const dbStart = Date.now();
    const contents = await prisma.libraryContent.findMany({
      where: { userId },
      select: {
        id: true,
        skillId: true,
        type: true,
        title: true,
        url: true,
        fileKey: true,
        body: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    console.log(`⏱️  [Library DB] Fetch All Contents: ${Date.now() - dbStart}ms`);
    return contents;
  } catch (error) {
    console.error('❌ [Library Query] Erro ao buscar conteúdos da biblioteca:', error);
    return [];
  }
}
