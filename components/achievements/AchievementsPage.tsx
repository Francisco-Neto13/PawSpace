'use client';
import { useState, useEffect, useMemo } from 'react';
import { useNexus } from '@/contexts/NexusContext';
import { computeAchievements } from './lib/achievements';
import { AchievementStats } from './features/stats/AchievementStats';
import { AchievementFilters, FilterCategory } from './features/filters/AchievementFilters';
import { AchievementGrid } from './features/list/AchievementGrid';
import { PageBackground } from '@/components/shared/PageBackground';

export function AchievementsPage() {
  const { nodes, globalStats } = useNexus();

  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState<FilterCategory>('all');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const achievements = useMemo(() => {
    const activeNodes = nodes.filter(n => {
      const data = n.data as any;
      const linksCount = Array.isArray(data?.links) ? data.links.length : 0;
      const contentsCount = Array.isArray(data?.contents) ? data.contents.length : 0;
      return (linksCount + contentsCount) > 0;
    }).length;

    return computeAchievements({
      activeNodes,
      totalNodes:      nodes.length,
      journalEntries:  globalStats.totalJournalEntries,
      libraryContents: globalStats.totalLibraryContents,
    });
  }, [nodes, globalStats]);

  const filtered = useMemo(() =>
    filter === 'all' ? achievements : achievements.filter(a => a.category === filter),
    [achievements, filter]
  );

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-x-hidden">
      <PageBackground src="/cat5.webp" />
      <main
        className="relative z-10 py-8 space-y-6 pb-20"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
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

