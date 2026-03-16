'use client';
import { useEffect, useMemo } from 'react';
import { PawIcon } from '@/components/shared/PawIcon';
import { useNexus } from '@/contexts/NexusContext';
import { LIMITS } from '@/shared/lib/limits';

export default function UsageLimits() {
  const { nodes, globalStats, refreshGlobalStats } = useNexus();

  useEffect(() => {
    void refreshGlobalStats();
  }, [refreshGlobalStats]);

  const usageItems = useMemo(() => {
    const totalModules = nodes.length;
    const moduleLimit = LIMITS.quantity.skillsPerUser;
    const journalLimit = LIMITS.quantity.journalEntries;
    const libraryLimit = Math.max(totalModules, 1) * LIMITS.quantity.contentsPerNode;

    return [
      {
        label: 'Notas no Diário',
        current: globalStats.totalJournalEntries,
        max: journalLimit,
        unit: 'entradas',
      },
      {
        label: 'Trilhas na Árvore',
        current: totalModules,
        max: moduleLimit,
        unit: 'módulos',
      },
      {
        label: 'Materiais na Estante',
        current: globalStats.totalLibraryContents,
        max: libraryLimit,
        unit: 'itens',
      },
    ];
  }, [nodes.length, globalStats.totalJournalEntries, globalStats.totalLibraryContents]);

  return (
    <section className="library-panel p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <p className="library-kicker mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
        Ritmo do PawSpace
      </p>
      <p className="library-subtitle mb-5 ml-3">uso atual versus o espaço disponível na sua trilha</p>

      <div className="space-y-5">
        {usageItems.map((item) => {
          const pct = item.max > 0 ? Math.min((item.current / item.max) * 100, 100) : 0;
          const isHigh = pct >= 80;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{item.label}</span>
                <span
                  className="text-[9px] font-mono font-black"
                  style={{ color: isHigh ? 'rgba(239,68,68,0.85)' : 'var(--text-secondary)' }}
                >
                  {item.current} / {item.max}
                </span>
              </div>
              <div className="h-[4px] w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isHigh ? 'rgba(239,68,68,0.75)' : 'var(--chart-strong)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[7px] text-[var(--text-faint)] uppercase tracking-wider font-bold">{item.unit}</span>
                <span className="text-[7px] font-mono font-bold" style={{ color: isHigh ? 'rgba(239,68,68,0.7)' : 'var(--text-faint)' }}>
                  {Math.round(pct)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
