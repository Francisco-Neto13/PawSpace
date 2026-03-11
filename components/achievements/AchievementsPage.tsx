'use client';
import { useState, useEffect, useMemo } from 'react';
import { PawIcon } from '@/components/shared/PawIcon';
import { PageBackground } from '@/components/shared/PageBackground';
import { useNexus } from '@/contexts/NexusContext';
import { computeAchievements } from './lib/achievements';
import { AchievementStats } from './features/stats/AchievementStats';
import { AchievementFilters, FilterCategory } from './features/filters/AchievementFilters';
import { AchievementGrid } from './features/list/AchievementGrid';

export function AchievementsPage() {
  const { nodes, globalStats, refreshGlobalStats } = useNexus();
  const [filter, setFilter] = useState<FilterCategory>('all');

  useEffect(() => {
    void refreshGlobalStats();
  }, [refreshGlobalStats]);

  const achievements = useMemo(() => {
    const getContentCount = (nodeData: { links?: unknown; contents?: unknown }) => {
      const linksCount = Array.isArray(nodeData.links) ? nodeData.links.length : 0;
      const contentsCount = Array.isArray(nodeData.contents) ? nodeData.contents.length : 0;
      return linksCount + contentsCount;
    };

    const activeNodes = nodes.filter((node) => getContentCount(node.data) > 0).length;
    return computeAchievements({
      activeNodes,
      totalNodes: nodes.length,
      journalEntries: globalStats.totalJournalEntries,
      libraryContents: globalStats.totalLibraryContents,
    });
  }, [nodes, globalStats]);

  const filtered = useMemo(() => {
    if (filter === 'all') return achievements;
    if (filter === 'progress') {
      return achievements.filter((achievement) => achievement.progress && achievement.progress.current < achievement.progress.total);
    }
    return achievements.filter((achievement) => achievement.category === filter);
  }, [achievements, filter]);

  const unlockedCount = useMemo(
    () => achievements.filter((achievement) => achievement.isUnlocked).length,
    [achievements]
  );
  const totalCount = achievements.length;
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <PageBackground src="/cat5.webp" />

      <main
        className="relative z-10 py-8 pb-20"
      >
        <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 2xl:px-16 space-y-5">
          <div className="flex items-center gap-3">
            <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
            <span className="text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.4em]">
              Pawspace / Conquistas
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--shimmer-via)] to-transparent" />
          </div>

          <section className="library-panel library-panel-hover p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className="library-kicker mb-2">Quadro de Mérito</p>
                <h1 className="overview-title text-2xl md:text-3xl mb-2">Progresso de Conquistas</h1>
                <p className="library-subtitle max-w-2xl">
                  Acompanhe marcos da árvore, diário e biblioteca. Use os filtros para focar no que ainda falta desbloquear.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="library-chip">Desbloqueadas: {unlockedCount}</span>
                  <span className="library-chip">Total: {totalCount}</span>
                  <span className="library-chip">Conclusão: {progressPct}%</span>
                </div>
              </div>
            </div>
          </section>

          <AchievementStats achievements={achievements} />
          <AchievementFilters active={filter} onChange={setFilter} resultCount={filtered.length} />
          <AchievementGrid achievements={filtered} />
        </div>
      </main>
    </div>
  );
}
