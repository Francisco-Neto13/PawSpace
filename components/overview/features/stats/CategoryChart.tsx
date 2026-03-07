'use client';
import { memo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PawIcon } from '@/components/shared/PawIcon';
import { CategoryCoverageDatum } from '@/components/overview/lib/overviewMetrics';

interface Props { data: CategoryCoverageDatum[] }

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider space-y-0.5">
      <p className="text-white">{d.category}</p>
      <p className="text-white/80">{d.withContent} / {d.total} com conteúdo</p>
      <div className="flex items-center gap-2 mt-1">
        <div className="h-[2px] flex-1 bg-white/10">
          <div className="h-full bg-white/60" style={{ width: `${d.pct}%` }} />
        </div>
        <span className="text-zinc-400 text-[9px]">{d.pct}%</span>
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
    <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-start justify-between mb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
          Progresso por Categoria
        </p>
      </div>
      <p className="text-[9px] text-zinc-400 mb-6 ml-3">cobertura de conteúdo por área</p>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          barGap={4}
          barSize={28}
          onMouseLeave={() => setActiveCategory(null)}
        >
          <XAxis
            dataKey="category"
            tick={{ fill: '#71717a', fontSize: 9, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />

          <Bar
            dataKey="total"
            fill="rgba(255,255,255,0.05)"
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          >
            {data.map((d, i) => (
              <Cell
                key={i}
                fill="rgba(255,255,255,0.05)"
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
                  fill="#ffffff"
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
          <div className="mt-4 border border-white/[0.08] bg-white/[0.02] rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-white">{cat.category}</p>
              <p className="text-[9px] text-zinc-500 mt-0.5">{cat.pending} módulos sem conteúdo</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[8px] text-zinc-400 uppercase tracking-wider">Cobertura</p>
                <p className="text-white font-mono font-black text-lg">{cat.pct}%</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-zinc-400 uppercase tracking-wider">Total</p>
                <p className="text-white font-mono font-black text-lg">{cat.total}</p>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex items-center justify-between mt-auto pt-4 ml-1">
        <div className="flex items-center gap-4">
          {[['rgba(255,255,255,0.6)', 'Com Conteúdo'], ['rgba(255,255,255,0.08)', 'Total']].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2" style={{ backgroundColor: color }} />
              <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">{label}</span>
            </div>
          ))}
        </div>
        <span className="text-[8px] text-zinc-400 italic">
          Clique para detalhes
        </span>
      </div>

      {data.length > 1 && (
        <div className="flex gap-3 mt-3">
          <div className="flex-1 border border-white/[0.04] rounded px-2 py-1.5">
            <p className="text-[7px] text-zinc-400 uppercase tracking-wider font-bold mb-0.5">Melhor</p>
            <p className="text-[9px] text-white font-bold truncate">{bestCategory.category}</p>
            <p className="text-[8px] text-zinc-500 font-mono">{bestCategory.pct}% cobertura</p>
          </div>
          <div className="flex-1 border border-white/[0.04] rounded px-2 py-1.5">
            <p className="text-[7px] text-zinc-400 uppercase tracking-wider font-bold mb-0.5">Atenção</p>
            <p className="text-[9px] text-white font-bold truncate">{worstCategory.category}</p>
            <p className="text-[8px] text-zinc-500 font-mono">{worstCategory.pct}% cobertura</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(CategoryChart);
