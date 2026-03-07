'use client';
import { memo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PawIcon } from '@/components/shared/PawIcon';
import { DepthDistributionDatum } from '@/components/overview/lib/overviewMetrics';

interface Props {
  data: DepthDistributionDatum[];
  maxGapLevel: string | null;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const gap = d.total - d.withContent;
  const pct = d.total > 0 ? Math.round((d.withContent / d.total) * 100) : 0;
  return (
    <div className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider space-y-0.5">
      <p className="text-white/50 text-[8px]">Nível {d.level}</p>
      <p className="text-white">{d.total} patas</p>
      <p className="text-zinc-400">{d.withContent} com conteúdo</p>
      {gap > 0 && <p className="text-zinc-600">{gap} sem conteúdo</p>}
      <div className="flex items-center gap-2 mt-1">
        <div className="h-[2px] flex-1 bg-white/10 overflow-hidden">
          <div className="h-full bg-white/60 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-zinc-500 text-[8px]">{pct}%</span>
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
    <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-start justify-between mb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
          Distribuição por Nível
        </p>
        <button
          onClick={() => setHighlightGap(v => !v)}
          className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border border-white/[0.08] transition-all"
          style={{
            backgroundColor: highlightGap ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: highlightGap ? 'rgba(255,255,255,0.7)' : '#52525b',
          }}
        >
          {highlightGap ? 'Gap ativo' : 'Ver gaps'}
        </button>
      </div>
      <p className="text-[9px] text-zinc-600 mb-6 ml-3">profundidade da árvore de conhecimento</p>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="contentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gapGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="level"
            tick={{ fill: '#52525b', fontSize: 9, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
          />

          {highlightGap && maxGapLevel && (
            <ReferenceLine
              x={maxGapLevel}
              stroke="rgba(255,255,255,0.25)"
              strokeDasharray="3 3"
              label={{
                value: 'maior gap',
                position: 'top',
                fill: 'rgba(255,255,255,0.3)',
                fontSize: 8,
                fontWeight: 700,
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="total"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
            fill="url(#totalGrad)"
            dot={false}
            activeDot={{ fill: 'rgba(255,255,255,0.3)', r: 3, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="withContent"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={2}
            fill="url(#contentGrad)"
            dot={false}
            activeDot={{ fill: '#ffffff', r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          {highlightGap && (
            <Area
              type="monotone"
              dataKey="gap"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
              strokeDasharray="4 2"
              fill="url(#gapGrad)"
              dot={false}
              activeDot={{ fill: 'rgba(255,255,255,0.5)', r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-[2px] bg-white/60" />
            <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">Com conteúdo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-[2px] bg-white/10" />
            <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">Total</span>
          </div>
          {highlightGap && (
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-[1px] border-t border-dashed border-white/20" />
              <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">Gap</span>
            </div>
          )}
        </div>
        <span className="text-[8px] text-zinc-600 font-mono font-bold">{overallPct}% geral</span>
      </div>
    </div>
  );
}

export default memo(TreeDepthChart);
