'use client';
import { memo, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useLibrary } from '@/contexts/LibraryContext';
import { PawIcon } from '@/components/shared/PawIcon';

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider">
      <p className="text-white">{d.name}</p>
      <p className="text-zinc-400">{d.value} itens</p>
    </div>
  );
}

const TYPE_COLORS: Record<string, string> = {
  video:   'rgba(255,255,255,0.9)',
  article: 'rgba(255,255,255,0.65)',
  pdf:     'rgba(255,255,255,0.45)',
  link:    'rgba(255,255,255,0.25)',
  note:    'rgba(255,255,255,0.12)',
};

function LibraryStatsPanel() {
  const { nodeContents } = useLibrary();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { byType, totalContents, totalNodes } = useMemo(() => {
    const typeMap: Record<string, number> = {};
    let total = 0;
    let nodes = 0;

    Object.values(nodeContents).forEach(contents => {
      if (!contents || contents.length === 0) return;
      nodes++;
      contents.forEach((c: any) => {
        const t = c.type ?? 'outros';
        typeMap[t] = (typeMap[t] ?? 0) + 1;
        total++;
      });
    });

    const byType = Object.entries(typeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { byType, totalContents: total, totalNodes: nodes };
  }, [nodeContents]);

  if (totalContents === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
          Caixinha de Areia
        </p>
        <p className="text-[9px] text-zinc-700 mt-6 ml-3">
          Navegue pelos módulos para carregar os dados da biblioteca.
        </p>
      </div>
    );
  }

  const activeType = activeIndex !== null ? byType[activeIndex] : null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
        Caixinha de Areia
      </p>
      <p className="text-[9px] text-zinc-600 mb-6 ml-3">conteúdos por tipo</p>

      <div className="flex items-center gap-6">
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
                    fill={TYPE_COLORS[entry.name] ?? 'rgba(255,255,255,0.1)'}
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
            <span className="text-white font-mono font-black text-sm leading-none">
              {activeType ? activeType.value : totalContents}
            </span>
            <span className="text-zinc-600 text-[7px] uppercase tracking-wider font-bold mt-0.5">
              {activeType ? activeType.name : 'itens'}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {byType.map((t, i) => {
            const pct      = totalContents > 0 ? Math.round((t.value / totalContents) * 100) : 0;
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
                    backgroundColor: TYPE_COLORS[t.name] ?? 'rgba(255,255,255,0.1)',
                    transform: isActive ? 'scale(1.4)' : 'scale(1)',
                    transition: 'transform 0.15s ease',
                  }}
                />
                <span
                  className="text-[9px] uppercase tracking-wider font-bold flex-1"
                  style={{
                    color: isActive ? 'rgba(255,255,255,0.8)' : '#a1a1aa',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {t.name}
                </span>
                <span className="text-[9px] text-zinc-600 font-mono w-5 text-right">{pct}%</span>
                <span className="text-[9px] text-zinc-500 font-mono w-4 text-right">{t.value}</span>
              </div>
            );
          })}

          <div className="pt-2 border-t border-white/[0.04]">
            <span className="text-[8px] text-zinc-600 uppercase tracking-wider font-bold">
              {totalContents} itens em {totalNodes} módulos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(LibraryStatsPanel);
