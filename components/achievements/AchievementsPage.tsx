'use client';
import { useState, useEffect, useMemo } from 'react';
import { useNexus } from '@/contexts/NexusContext';
import { computeAchievements } from './lib/achievements';
import { AchievementStats } from './features/stats/AchievementStats';
import { AchievementFilters, FilterCategory } from './features/filters/AchievementFilters';
import { AchievementGrid } from './features/list/AchievementGrid';
import { PageBackground } from '@/components/shared/PageBackground';

export function AchievementsPage() {
  const { nodes, globalStats, refreshGlobalStats } = useNexus();
  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState<FilterCategory>('all');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    void refreshGlobalStats();
  }, [refreshGlobalStats]);

  const achievements = useMemo(() => {
    const getContentCount = (nodeData: { links?: unknown; contents?: unknown }) => {
      const linksCount    = Array.isArray(nodeData.links)    ? nodeData.links.length    : 0;
      const contentsCount = Array.isArray(nodeData.contents) ? nodeData.contents.length : 0;
      return linksCount + contentsCount;
    };
    const activeNodes = nodes.filter(n => getContentCount(n.data) > 0).length;
    return computeAchievements({
      activeNodes,
      totalNodes:      nodes.length,
      journalEntries:  globalStats.totalJournalEntries,
      libraryContents: globalStats.totalLibraryContents,
    });
  }, [nodes, globalStats]);

  const filtered = useMemo(() => {
    if (filter === 'all') return achievements;
    if (filter === 'progress') {
      return achievements.filter(a =>
        a.progress && a.progress.current < a.progress.total
      );
    }
    return achievements.filter(a => a.category === filter);
  }, [achievements, filter]);

  return (
    <div className="relative min-h-full w-full overflow-x-hidden">
      <PageBackground src="/cat5.webp" />
      <main
        className="relative z-10 py-8 space-y-4 pb-20"
        style={{
          opacity:    visible ? 1 : 0,
          transform:  visible ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <AchievementStats achievements={achievements} />
        <AchievementFilters
          active={filter}
          onChange={setFilter}
          resultCount={filtered.length}
        />
        <AchievementGrid achievements={filtered} />
      </main>
    </div>
  );
}
