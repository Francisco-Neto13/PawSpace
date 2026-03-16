'use client';
import { memo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PawIcon } from '@/components/shared/PawIcon';
import { DepthDistributionDatum } from '@/components/overview/lib/overviewMetrics';

interface Props {
  data: DepthDistributionDatum[];
  maxGapLevel: string | null;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DepthDistributionDatum }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const gap = d.total - d.withContent;
  const pct = d.total > 0 ? Math.round((d.withContent / d.total) * 100) : 0;
  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-muted)] rounded-lg px-3 py-2 text-[10px] space-y-0.5 shadow-xl">
      <p className="text-[var(--text-secondary)] text-[8px] uppercase tracking-wider font-black">Nivel {d.level}</p>
      <p className="text-[var(--text-primary)] font-bold">{d.total} trilhas</p>
      <p className="text-[var(--text-secondary)] font-bold">{d.withContent} com material</p>
      {gap > 0 && <p className="text-[var(--text-secondary)]">{gap} sem material</p>}
      <div className="flex items-center gap-2 mt-1">
        <div className="h-[2px] flex-1 bg-[var(--border-muted)] overflow-hidden">
          <div className="h-full bg-[var(--text-secondary)] transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[var(--text-secondary)] text-[8px]">{pct}%</span>
      </div>
    </div>
  );
}

function TreeDepthChart({ data, maxGapLevel }: Props) {
  const [highlightGap, setHighlightGap] = useState(false);

  if (data.length === 0) return null;

  const totalNodes = data.reduce((s, d) => s + d.total, 0);
  const totalWithContent = data.reduce((s, d) => s + d.withContent, 0);
  const overallPct = totalNodes > 0 ? Math.round((totalWithContent / totalNodes) * 100) : 0;

  return (
    <div className="h-full overview-card overview-card-hover p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex items-start justify-between mb-1">
        <p className="overview-kicker text-[var(--text-primary)] flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
          Mapa por Nivel
        </p>
        <button
          onClick={() => setHighlightGap((v) => !v)}
          className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border border-[var(--border-muted)] transition-all"
          style={{
            backgroundColor: highlightGap ? 'var(--bg-elevated)' : 'transparent',
            color: highlightGap ? 'var(--text-primary)' : 'var(--text-muted)',
          }}
        >
          {highlightGap ? 'Lacunas ativas' : 'Ver lacunas'}
        </button>
      </div>
      <p className="overview-subtitle mb-6 ml-3">Profundidade da arvore e espacos ainda vazios entre niveis</p>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-medium)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--chart-medium)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="contentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-strong)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--chart-strong)" stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="gapGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-soft)" stopOpacity={0.22} />
              <stop offset="95%" stopColor="var(--chart-soft)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="level"
            tick={{ fill: 'var(--text-muted)', fontSize: 9, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'var(--chart-grid)', strokeWidth: 1 }}
          />

          {highlightGap && maxGapLevel && (
            <ReferenceLine
              x={maxGapLevel}
              stroke="var(--chart-soft)"
              strokeDasharray="3 3"
              label={{
                value: 'maior lacuna',
                position: 'top',
                fill: 'var(--text-secondary)',
                fontSize: 8,
                fontWeight: 700,
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--chart-grid)"
            strokeWidth={1}
            fill="url(#totalGrad)"
            dot={false}
            activeDot={{ fill: 'var(--chart-soft)', r: 3, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="withContent"
            stroke="var(--chart-medium)"
            strokeWidth={2}
            fill="url(#contentGrad)"
            dot={false}
            activeDot={{ fill: 'var(--chart-strong)', r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          {highlightGap && (
            <Area
              type="monotone"
              dataKey="gap"
              stroke="var(--chart-soft)"
              strokeWidth={1}
              strokeDasharray="4 2"
              fill="url(#gapGrad)"
              dot={false}
              activeDot={{ fill: 'var(--chart-medium)', r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-[2px] bg-[var(--text-secondary)]" />
            <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Com material</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-[2px] bg-[var(--border-muted)]" />
            <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Total</span>
          </div>
          {highlightGap && (
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-[1px] border-t border-dashed border-[var(--border-visible)]" />
              <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Lacunas</span>
            </div>
          )}
        </div>
        <span className="text-[8px] text-[var(--text-secondary)] font-mono font-bold">{overallPct}% do mapa</span>
      </div>
    </div>
  );
}

export default memo(TreeDepthChart);
