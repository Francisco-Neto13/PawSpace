'use client';
import { memo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PawIcon } from '@/components/shared/PawIcon';
import { CategoryCoverageDatum } from '@/components/overview/lib/overviewMetrics';

interface Props { data: CategoryCoverageDatum[] }

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CategoryCoverageDatum }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-muted)] rounded-lg px-3 py-2 text-[10px] space-y-0.5 shadow-xl">
      <p className="text-[var(--text-primary)] font-black uppercase tracking-wider">{d.category}</p>
      <p className="text-[var(--text-secondary)] font-bold">{d.withContent} / {d.total} com conteúdo</p>
      <div className="flex items-center gap-2 mt-1">
        <div className="h-[2px] flex-1 bg-[var(--border-muted)]">
          <div className="h-full bg-[var(--text-secondary)]" style={{ width: `${d.pct}%` }} />
        </div>
        <span className="text-[var(--text-secondary)] text-[9px]">{d.pct}%</span>
      </div>
    </div>
  );
}

function CategoryChart({ data }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (data.length === 0) return null;

  const bestCategory = data[0];
  const worstCategory = data[data.length - 1];

  return (
    <div className="h-full overview-card overview-card-hover p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex items-start justify-between mb-1 gap-3">
        <p className="overview-kicker text-[var(--text-primary)] flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
          Progresso por Categoria
        </p>
        <span className="text-[8px] uppercase tracking-[0.15em] font-black text-[var(--text-muted)] border border-[var(--border-subtle)] px-2 py-1 rounded-lg">
          Distribuição
        </span>
      </div>
      <p className="overview-subtitle mb-6 ml-3">Cobertura de conteúdo por área de estudo</p>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          barGap={4}
          barSize={28}
        >
          <XAxis
            dataKey="category"
            tick={{ fill: 'var(--text-muted)', fontSize: 9, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--chart-cursor)' }} />

          <Bar
            dataKey="total"
            fill="var(--chart-faint)"
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          >
            {data.map((d, i) => (
              <Cell
                key={i}
                fill="var(--chart-faint)"
                cursor="pointer"
                onClick={() => setActiveCategory(activeCategory === d.category ? null : d.category)}
              />
            ))}
          </Bar>

          <Bar
            dataKey="withContent"
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          >
            {data.map((d, i) => {
              const isActive = activeCategory === d.category;
              const isBest = d.category === bestCategory.category;
              return (
                <Cell
                  key={i}
                  fill="var(--chart-strong)"
                  fillOpacity={isActive ? 0.9 : isBest ? 0.7 : 0.45 + (d.pct / 100) * 0.3}
                  cursor="pointer"
                  onClick={() => setActiveCategory(activeCategory === d.category ? null : d.category)}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {activeCategory && (() => {
        const cat = data.find(d => d.category === activeCategory)!;
        return (
          <div className="mt-4 border border-[var(--border-muted)] bg-[var(--bg-surface)] rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)]">{cat.category}</p>
              <p className="text-[9px] text-[var(--text-muted)] mt-0.5">{cat.pending} módulos sem conteúdo</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider">Cobertura</p>
                <p className="text-[var(--text-primary)] font-mono font-black text-lg">{cat.pct}%</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider">Total</p>
                <p className="text-[var(--text-primary)] font-mono font-black text-lg">{cat.total}</p>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex items-center justify-between mt-auto pt-4 ml-1">
        <div className="flex items-center gap-4">
          {[['var(--chart-medium)', 'Com Conteúdo'], ['var(--chart-faint)', 'Total']].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2" style={{ backgroundColor: color }} />
              <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider font-bold">{label}</span>
            </div>
          ))}
        </div>
        <span className="text-[8px] text-[var(--text-secondary)] tracking-[0.02em] font-medium">
          Clique em uma barra
        </span>
      </div>

      {data.length > 1 && (
        <div className="flex gap-3 mt-3">
          <div className="flex-1 border border-[var(--border-subtle)] rounded px-2 py-1.5">
            <p className="text-[7px] text-[var(--text-secondary)] uppercase tracking-wider font-bold mb-0.5">Melhor</p>
            <p className="text-[9px] text-[var(--text-primary)] font-bold truncate">{bestCategory.category}</p>
            <p className="text-[8px] text-[var(--text-muted)] font-mono">{bestCategory.pct}% cobertura</p>
          </div>
          <div className="flex-1 border border-[var(--border-subtle)] rounded px-2 py-1.5">
            <p className="text-[7px] text-[var(--text-secondary)] uppercase tracking-wider font-bold mb-0.5">Atenção</p>
            <p className="text-[9px] text-[var(--text-primary)] font-bold truncate">{worstCategory.category}</p>
            <p className="text-[8px] text-[var(--text-muted)] font-mono">{worstCategory.pct}% cobertura</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(CategoryChart);
