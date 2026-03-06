'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SkillNode } from '@/contexts/NexusContext';
import { PawIcon } from '@/components/shared/PawIcon';

interface Props { nodes: SkillNode[] }

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider">
      <p className="text-white">{d.category}</p>
      <p className="text-white">{d.withContent} / {d.total} com conteúdo</p>
      <p className="text-zinc-500">{d.pct}% de cobertura</p>
    </div>
  );
}

export default function CategoryChart({ nodes }: Props) {
  const data = useMemo(() => {
    const map: Record<string, { total: number; withContent: number }> = {};
    nodes.forEach(n => {
      const cat = (n.data.category as string) || 'outros';
      if (!map[cat]) map[cat] = { total: 0, withContent: 0 };
      map[cat].total++;
      const nodeData = n.data as any;
      const linksCount    = Array.isArray(nodeData?.links)    ? nodeData.links.length    : 0;
      const contentsCount = Array.isArray(nodeData?.contents) ? nodeData.contents.length : 0;
      if ((linksCount + contentsCount) > 0) map[cat].withContent++;
    });
    return Object.entries(map).map(([category, v]) => ({
      category,
      total:       v.total,
      withContent: v.withContent,
      pending:     v.total - v.withContent,
      pct:         v.total > 0 ? Math.round((v.withContent / v.total) * 100) : 0,
    }));
  }, [nodes]);

  if (data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
        Progresso por Categoria
      </p>
      <p className="text-[9px] text-zinc-600 mb-6 ml-3">módulos com conteúdo vs total</p>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4} barSize={28}>
          <XAxis
            dataKey="category"
            tick={{ fill: '#52525b', fontSize: 9, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="total" fill="rgba(255,255,255,0.05)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="withContent" radius={[2, 2, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#ffffff" fillOpacity={0.6} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-4 ml-1">
        {[['rgba(255,255,255,0.6)', 'Com Conteúdo'], ['rgba(255,255,255,0.08)', 'Total']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2" style={{ backgroundColor: color }} />
            <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}