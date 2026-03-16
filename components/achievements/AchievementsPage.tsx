'use client';
import { useState, useEffect, useMemo } from 'react';
import { PawIcon } from '@/components/shared/PawIcon';
import { PageBackground } from '@/components/shared/PageBackground';
import { useNexus } from '@/contexts/NexusContext';
import { computeAchievements } from './lib/achievements';
import { AchievementStats } from './features/stats/AchievementStats';
import { AchievementFilters, FilterCategory } from './features/filters/AchievementFilters';
import { AchievementGrid } from './features/list/AchievementGrid';
import { WorkspaceEmptyState } from '@/components/shared/WorkspaceEmptyState';

export function AchievementsPage() {
  const { nodes, globalStats, refreshGlobalStats, isLoading } = useNexus();
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
      return achievements.filter(
        (achievement) => achievement.progress && achievement.progress.current < achievement.progress.total
      );
    }
    return achievements.filter((achievement) => achievement.category === filter);
  }, [achievements, filter]);

  const unlockedCount = useMemo(
    () => achievements.filter((achievement) => achievement.isUnlocked).length,
    [achievements]
  );
  const totalCount = achievements.length;
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  if (isLoading && nodes.length === 0) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--bg-base)]">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[var(--border-visible)] border-t-[var(--text-primary)] rounded-full animate-spin" />
          <p className="text-[var(--text-primary)] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
            Sincronizando PawSpace...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoading && nodes.length === 0) {
    return (
      <WorkspaceEmptyState
        title="Sem trofeus por enquanto"
        description="Monte sua arvore e adicione materiais para comecar a desbloquear marcos."
        actionLabel="Ir para a arvore"
        actionHref="/tree"
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <PageBackground src="/cat5.webp" />

      <main className="relative z-10 py-8 pb-20">
        <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 2xl:px-16 space-y-5">
          <div className="flex items-center gap-3 reveal-fade delay-0">
            <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
            <span className="text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.4em]">
              PawSpace / Trofeus
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--shimmer-via)] to-transparent" />
          </div>

          <section className="library-panel library-panel-hover p-6 relative overflow-hidden reveal-up delay-100">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className="library-kicker mb-2">Sala de Trofeus</p>
                <h1 className="overview-title text-2xl md:text-3xl mb-2">Conquistas do PawSpace</h1>
                <p className="library-subtitle max-w-2xl">
                  Acompanhe marcos da arvore, do diario e da estante. Use os filtros para cacar o proximo desbloqueio.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="library-chip">Desbloqueadas: {unlockedCount}</span>
                  <span className="library-chip">Total: {totalCount}</span>
                  <span className="library-chip">Conclusao: {progressPct}%</span>
                </div>
              </div>
            </div>
          </section>

          <div className="reveal-up delay-200">
            <AchievementStats achievements={achievements} />
          </div>
          <div className="reveal-up delay-300">
            <AchievementFilters active={filter} onChange={setFilter} resultCount={filtered.length} />
          </div>
          <div className="reveal-up delay-400">
            <AchievementGrid achievements={filtered} />
          </div>
        </div>
      </main>
    </div>
  );
}
