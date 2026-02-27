import OverviewContent from "@/components/overview/OverviewContent";
import prisma from "@/lib/prisma";

async function getOverviewData() {
  try {
    const total = await prisma.skill.count();
    const unlocked = await prisma.skill.count({ 
      where: { isUnlocked: true } 
    });

    return {
      total,
      unlocked,
      progress: total > 0 ? Math.round((unlocked / total) * 100) : 0
    };
  } catch (error) {
    console.error("Erro ao buscar dados do servidor:", error);
    return { total: 0, unlocked: 0, progress: 0 };
  }
}

export default async function OverviewPage() {
  const initialData = await getOverviewData();

  return <OverviewContent initialData={initialData} />;
}