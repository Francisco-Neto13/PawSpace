'use client';
import { useState, useEffect, useMemo } from 'react';
import { useNexus } from '@/contexts/NexusContext';
import { useJournal } from '@/contexts/JournalContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { computeAchievements } from './lib/achievements';
import { AchievementStats } from './features/stats/AchievementStats';
import { AchievementFilters, FilterCategory } from './features/filters/AchievementFilters';
import { AchievementGrid } from './features/list/AchievementGrid';

export function AchievementsPage() {
  const { nodes } = useNexus();
  const { entries } = useJournal();
  const { nodeContents } = useLibrary();

  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState<FilterCategory>('all');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const achievements = useMemo(() => {
    const unlockedNodes   = nodes.filter(n => n.data.isUnlocked).length;
    const totalNodes      = nodes.length;
    const journalEntries  = entries.length;
    const libraryContents = Object.values(nodeContents).flat().length;
    return computeAchievements({ unlockedNodes, totalNodes, journalEntries, libraryContents });
  }, [nodes, entries, nodeContents]);

  const filtered = useMemo(() =>
    filter === 'all' ? achievements : achievements.filter(a => a.category === filter),
    [achievements, filter]
  );

  return (
    <div
      className="relative min-h-screen w-full bg-[#030304] overflow-x-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#c8b89a05_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_50%,transparent_100%)]" />

      <main className="relative z-10 py-8 space-y-6 pb-20">
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