'use client';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SkillNode } from '@/contexts/NexusContext';
import { Edge } from '@xyflow/react';
import { PawIcon } from '@/components/shared/PawIcon';

interface Props { nodes: SkillNode[]; edges: Edge[] }

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider">
      <p className="text-white">Nível {d.level}</p>
      <p className="text-white">{d.total} patas</p>
      <p className="text-zinc-500">{d.withContent} com conteúdo</p>
    </div>
  );
}

export default function TreeDepthChart({ nodes, edges }: Props) {
  const data = useMemo(() => {
    const childToParent = new Map<string, string>();
    edges.forEach(e => childToParent.set(e.target, e.source));

    const getDepth = (id: string): number => {
      let depth = 0;
      let current = id;
      while (childToParent.has(current)) {
        current = childToParent.get(current)!;
        if (++depth > 50) break;
      }
      return depth;
    };

    const map: Record<number, { total: number; withContent: number }> = {};
    nodes.forEach(n => {
      const d = getDepth(n.id);
      if (!map[d]) map[d] = { total: 0, withContent: 0 };
      map[d].total++;
      const nodeData = n.data as any;
      const linksCount = Array.isArray(nodeData?.links) ? nodeData.links.length : 0;
      const contentsCount = Array.isArray(nodeData?.contents) ? nodeData.contents.length : 0;
      if ((linksCount + contentsCount) > 0) map[d].withContent++;
    });

    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([level, v]) => ({ level: `N${level}`, total: v.total, withContent: v.withContent }));
  }, [nodes, edges]);

  if (data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
        Distribuição por Nível
      </p>
      <p className="text-[9px] text-zinc-600 mb-6 ml-3">profundidade da árvore de conhecimento</p>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="contentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0.02} />
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
          <Area
            type="monotone"
            dataKey="total"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
            fill="url(#totalGrad)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="withContent"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={2}
            fill="url(#contentGrad)"
            dot={{ fill: '#ffffff', r: 3, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
