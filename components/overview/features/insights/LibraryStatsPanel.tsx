'use client';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useLibrary } from '@/contexts/LibraryContext';

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider">
      <p className="text-[#c8b89a]">{d.name}</p>
      <p className="text-white">{d.value} itens</p>
    </div>
  );
}

const TYPE_COLORS: Record<string, string> = {
  video:    '#c8b89a',
  article:  'rgba(200,184,154,0.6)',
  pdf:      'rgba(200,184,154,0.4)',
  link:     'rgba(200,184,154,0.25)',
  note:     'rgba(200,184,154,0.15)',
};

export default function LibraryStatsPanel() {
  const { nodeContents } = useLibrary();

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

    const byType = Object.entries(typeMap).map(([name, value]) => ({ name, value }));
    return { byType, totalContents: total, totalNodes: nodes };
  }, [nodeContents]);

  if (totalContents === 0) {
    return (
      <div className="border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c8b89a]/20 to-transparent" />
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#c8b89a] mb-1 flex items-center gap-2">
          <span className="w-1 h-3 bg-[#c8b89a] inline-block" />
          Biblioteca
        </p>
        <p className="text-[9px] text-zinc-700 mt-6 ml-3">Navegue pelos nós para carregar os dados da biblioteca.</p>
      </div>
    );
  }

  return (
    <div className="border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c8b89a]/20 to-transparent" />
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#c8b89a] mb-1 flex items-center gap-2">
        <span className="w-1 h-3 bg-[#c8b89a] inline-block" />
        Biblioteca
      </p>
      <p className="text-[9px] text-zinc-600 mb-6 ml-3">conteúdos por tipo</p>

      <div className="flex items-center gap-6">
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
            >
              {byType.map((_, i) => (
                <Cell
                  key={i}
                  fill={TYPE_COLORS[_.name] ?? 'rgba(200,184,154,0.2)'}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1 space-y-2">
          {byType.map(t => (
            <div key={t.name} className="flex items-center gap-2">
              <div className="w-2 h-2 shrink-0" style={{ backgroundColor: TYPE_COLORS[t.name] ?? 'rgba(200,184,154,0.2)' }} />
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold flex-1">{t.name}</span>
              <span className="text-[9px] text-zinc-500 font-mono">{t.value}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-white/[0.04]">
            <span className="text-[8px] text-zinc-600 uppercase tracking-wider font-bold">
              {totalContents} itens em {totalNodes} nós
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}