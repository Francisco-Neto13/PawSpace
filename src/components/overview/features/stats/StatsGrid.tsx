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
  hint: string;
  icon: LucideIcon;
  barWidth: number;
}

function StatsGrid({ unlockedCount, totalCount, progress }: StatsGridProps) {
  const stats = useMemo<StatItem[]>(() => {
    const pending = Math.max(totalCount - unlockedCount, 0);
    const progressSafe = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
    const pendingSafe = totalCount > 0 ? (pending / totalCount) * 100 : 0;
    return [
      {
        label: 'Trilhas com Material',
        value: unlockedCount,
        sub: `de ${totalCount} no mapa`,
        hint: 'Avance por blocos que se conectam.',
        icon: Zap,
        barWidth: progressSafe,
      },
      {
        label: 'Cobertura do Mapa',
        value: `${progress}%`,
        sub: 'do território de estudo',
        hint: progress >= 80 ? 'Seu território está bem abastecido.' : 'Ainda há espaço para crescer.',
        icon: Target,
        barWidth: progress,
      },
      {
        label: 'Trilhas vazias',
        value: pending,
        sub: 'espaços ainda sem material',
        hint: pending > 0 ? 'Comece pelas trilhas críticas.' : 'Sem pendências estruturais.',
        icon: Layout,
        barWidth: pendingSafe,
      },
    ];
  }, [unlockedCount, totalCount, progress]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="relative overview-card overview-card-hover overflow-hidden group render-isolate"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] opacity-80 transition-opacity duration-300 bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

          <div className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-5">
              <div className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center justify-center">
                <item.icon size={14} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-300" />
              </div>
              <span className="data-label">Radar</span>
            </div>

            <div className="mb-4">
              <div className="metric-value mb-2 font-mono tabular-nums">
                {item.value}
              </div>
              <span className="ui-label block mb-1">
                {item.label}
              </span>
              <span className="metric-support">
                {item.sub}
              </span>
            </div>

            <div className="space-y-2">
              <div className="h-[3px] w-full bg-[var(--chart-faint)] overflow-hidden rounded-full">
                <div
                  style={{
                    width: `${item.barWidth}%`,
                    backgroundColor: 'var(--chart-strong)',
                    height: '100%',
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="ui-meta font-mono font-black">
                  {Math.round(item.barWidth)}%
                </span>
                <span className="helper-text">
                  {item.hint}
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
