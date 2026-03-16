'use client';

import { memo, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PawIcon } from '@/components/shared/PawIcon';
import type { LibraryTypeStatsResult } from '@/app/actions/library';

type TypeStat = {
  name: string;
  value: number;
};

type TooltipPayloadItem = {
  payload: TypeStat;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    video: 'Videos',
    article: 'Artigos',
    pdf: 'PDFs',
    link: 'Links',
    note: 'Notas',
  };
  return labels[type] ?? type;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-muted)] rounded-lg px-3 py-2 text-[10px]">
      <p className="text-[var(--text-primary)] uppercase tracking-wider font-black">{getTypeLabel(d.name)}</p>
      <p className="text-[var(--text-secondary)] font-bold">{d.value} itens</p>
    </div>
  );
}

const TYPE_COLORS: Record<string, string> = {
  video: 'var(--chart-strong)',
  article: 'var(--chart-medium)',
  pdf: 'var(--chart-soft)',
  link: 'var(--chart-faint)',
  note: 'var(--border-muted)',
};

interface LibraryStatsPanelProps {
  stats: LibraryTypeStatsResult | null;
  isBootstrapLoading?: boolean;
}

function LibraryStatsPanel({ stats, isBootstrapLoading = false }: LibraryStatsPanelProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const byType: TypeStat[] = stats?.status === 'ok' ? stats.byType : [];
  const totalContents = stats?.status === 'ok' ? stats.totalContents : 0;
  const totalNodes = stats?.status === 'ok' ? stats.totalNodes : 0;

  const emptyMessage = useMemo(() => {
    if (isBootstrapLoading || stats === null) return 'Carregando dados da estante...';
    if (stats.status === 'error') return 'Nao foi possivel carregar os dados da estante.';
    if (stats.status === 'unauthorized') return 'Sessao expirada. Faca login novamente.';
    return 'Sua estante ainda nao tem materiais guardados.';
  }, [stats, isBootstrapLoading]);

  if (totalContents === 0) {
    return (
      <div className="h-full overview-card overview-card-hover p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
        <p className="overview-kicker text-[var(--text-primary)] mb-1 flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
          Radar da Estante
        </p>
        <p className="overview-subtitle mt-6 ml-3">{emptyMessage}</p>
      </div>
    );
  }

  const activeType = activeIndex !== null ? byType[activeIndex] : null;

  return (
    <div className="h-full overview-card overview-card-hover p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="overview-kicker text-[var(--text-primary)] flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
          Radar da Estante
        </p>
        <span className="text-[8px] uppercase tracking-[0.15em] font-black text-[var(--text-muted)] border border-[var(--border-subtle)] px-2 py-1 rounded-lg">
          Estante
        </span>
      </div>
      <p className="overview-subtitle mb-6 ml-3">Tipos de material guardados e distribuicao na estante</p>

      <div className="flex-1 flex items-center">
        <div className="flex items-center gap-6 w-full">
          <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={byType}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  isAnimationActive={false}
                >
                  {byType.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={TYPE_COLORS[entry.name] ?? 'var(--chart-faint)'}
                      stroke="transparent"
                      style={{ cursor: 'pointer' }}
                      opacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[var(--text-primary)] font-mono font-black text-sm leading-none">
                {activeType ? activeType.value : totalContents}
              </span>
              <span className="text-[var(--text-secondary)] text-[7px] uppercase tracking-wider font-bold mt-0.5">
                {activeType ? getTypeLabel(activeType.name) : 'itens'}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {byType.map((t, i) => {
              const pct = totalContents > 0 ? Math.round((t.value / totalContents) * 100) : 0;
              const isActive = activeIndex === i;
              return (
                <div
                  key={t.name}
                  className="flex items-center gap-2 cursor-default"
                  style={{
                    opacity: activeIndex === null || isActive ? 1 : 0.35,
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div
                    className="w-2 h-2 shrink-0"
                    style={{
                      backgroundColor: TYPE_COLORS[t.name] ?? 'var(--chart-faint)',
                      transform: isActive ? 'scale(1.4)' : 'scale(1)',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                  <span
                    className="text-[9px] uppercase tracking-wider font-bold flex-1"
                    style={{
                      color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {getTypeLabel(t.name)}
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] font-mono min-w-[64px] text-right">
                    {pct}% ({t.value})
                  </span>
                </div>
              );
            })}

            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">
                {totalContents} itens em {totalNodes} trilhas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(LibraryStatsPanel);
