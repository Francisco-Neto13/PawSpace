'use client';
import { memo, useMemo } from 'react';
import { Zap, Target, Layout, LucideIcon } from 'lucide-react';

interface StatsGridProps {
  unlockedCount: number;
  totalCount: number;
  progress: number;
}

interface StatItem {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  barWidth: number;
}

function StatsGrid({ unlockedCount, totalCount, progress }: StatsGridProps) {
  const stats = useMemo<StatItem[]>(() => {
    const pending      = totalCount - unlockedCount;
    const progressSafe = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
    const pendingSafe  = totalCount > 0 ? (pending / totalCount) * 100 : 0;
    return [
      {
        label:    'Patas com Conteúdo',
        value:    unlockedCount,
        sub:      `de ${totalCount} no roadmap`,
        icon:     Zap,
        barWidth: progressSafe,
      },
      {
        label:    'Cobertura',
        value:    `${progress}%`,
        sub:      'da árvore de conhecimento',
        icon:     Target,
        barWidth: progress,
      },
      {
        label:    'Sem Conteúdo',
        value:    pending,
        sub:      'módulos ainda vazios',
        icon:     Layout,
        barWidth: pendingSafe,
      },
    ];
  }, [unlockedCount, totalCount, progress]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden group"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

          <div className="p-7 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-6">
              <item.icon size={18} className="text-[var(--text-primary)] opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="flex gap-1.5">
                {[0, 1, 2].map(d => (
                  <div key={d} className="w-1 h-1 rounded-full bg-[var(--border-visible)] group-hover:bg-[var(--text-secondary)] transition-colors duration-300" />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-5xl font-black text-[var(--text-primary)] mb-3 tracking-tighter font-mono leading-none tabular-nums">
                {item.value}
              </div>
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] block mb-1">
                {item.label}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-medium">
                {item.sub}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="h-[2px] w-full bg-[var(--chart-faint)] overflow-hidden">
                <div
                  style={{
                    width: `${item.barWidth}%`,
                    backgroundColor: 'var(--chart-strong)',
                    height: '100%',
                  }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-[9px] text-[var(--text-secondary)] font-mono font-bold">0%</span>
                <span className="text-[9px] text-[var(--text-secondary)] font-mono font-black">
                  {Math.round(item.barWidth)}%
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[var(--border-muted)] group-hover:border-[var(--border-visible)] transition-colors duration-300" />
        </div>
      ))}
    </section>
  );
}

export default memo(StatsGrid);
