import { SkillTree } from '@/components/tree/SkillTree';
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getTreeData() {
  try {
    const rawSkills = await prisma.skill.findMany({
      orderBy: { createdAt: 'asc' }
    });

    return rawSkills.map(skill => ({
      ...skill,
      createdAt: skill.createdAt.toISOString(),
      updatedAt: skill.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Erro ao carregar banco para a Tree:", error);
    return [];
  }
}

export default async function TreePage() {
  const initialSkills = await getTreeData();
  
  return <SkillTree key={initialSkills.length} initialSkills={initialSkills} />;
}