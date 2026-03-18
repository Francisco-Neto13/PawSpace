'use server';
import prisma from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/server/auth';

export type LibraryTypeStat = {
  name: string;
  value: number;
};

export type LibraryTypeStatsResult =
  | { status: 'ok'; byType: LibraryTypeStat[]; totalContents: number; totalNodes: number }
  | { status: 'unauthorized' | 'error'; byType: []; totalContents: 0; totalNodes: 0 };

type LibraryTypeStatsByUserResult =
  | { status: 'ok'; byType: LibraryTypeStat[]; totalContents: number; totalNodes: number }
  | { status: 'error'; byType: []; totalContents: 0; totalNodes: 0 };

export async function getContentsBySkill(skillId: string) {
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

export async function getLibraryTypeStatsByUserId(userId: string): Promise<LibraryTypeStatsByUserResult> {
  try {
    const [byTypeRows, byNodeRows] = await Promise.all([
      prisma.libraryContent.groupBy({
        by: ['type'],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.libraryContent.groupBy({
        by: ['skillId'],
        where: { userId },
        _count: { _all: true },
      }),
    ]);

    const byType = byTypeRows
      .map((row) => ({
        name: row.type || 'outros',
        value: row._count._all,
      }))
      .sort((a, b) => b.value - a.value);

    const totalContents = byType.reduce((acc, item) => acc + item.value, 0);
    const totalNodes = byNodeRows.length;

    return { status: 'ok', byType, totalContents, totalNodes };
  } catch (error) {
    console.error('[Library Query] Failed to fetch library type stats:', error);
    return { status: 'error', byType: [], totalContents: 0, totalNodes: 0 };
  }
}

export async function getLibraryTypeStats(): Promise<LibraryTypeStatsResult> {
  const userId = await getAuthUser();
  if (!userId) {
    return { status: 'unauthorized', byType: [], totalContents: 0, totalNodes: 0 };
  }

  return getLibraryTypeStatsByUserId(userId);
}
