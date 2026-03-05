'use client';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SkillNode } from '@/contexts/NexusContext';
import { Edge } from '@xyflow/react';

interface Props { nodes: SkillNode[]; edges: Edge[] }

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider">
      <p className="text-[#2dd4bf]">Nível {d.level}</p>
      <p className="text-white">{d.total} nós</p>
      <p className="text-zinc-500">{d.unlocked} desbloqueados</p>
    </div>
  );
}

export default function TreeDepthChart({ nodes, edges }: Props) {
  const data = useMemo(() => {
    const childToParent = new Map<string, string>();
    edges.forEach(e => childToParent.set(e.target, e.source));

    const getDepth = (id: string): number => {
      let depth = 0, current = id;
      while (childToParent.has(current)) {
        current = childToParent.get(current)!;
        if (++depth > 50) break;
      }
      return depth;
    };

    const map: Record<number, { total: number; unlocked: number }> = {};
    nodes.forEach(n => {
      const d = getDepth(n.id);
      if (!map[d]) map[d] = { total: 0, unlocked: 0 };
      map[d].total++;
      if (n.data.isUnlocked) map[d].unlocked++;
    });

    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([level, v]) => ({ level: `N${level}`, total: v.total, unlocked: v.unlocked }));
  }, [nodes, edges]);

  if (data.length === 0) return null;

  return (
    <div className="border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2dd4bf]/20 to-transparent" />
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#2dd4bf] mb-1 flex items-center gap-2">
        <span className="w-1 h-3 bg-[#2dd4bf] inline-block" />
        Distribuição por Nível
      </p>
      <p className="text-[9px] text-zinc-600 mb-6 ml-3">profundidade da árvore de conhecimento</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="unlockedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="level" tick={{ fill: '#52525b', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(45,212,191,0.15)', strokeWidth: 1 }} />
          <Area type="monotone" dataKey="total" stroke="rgba(45,212,191,0.15)" strokeWidth={1} fill="url(#totalGrad)" dot={false} />
          <Area type="monotone" dataKey="unlocked" stroke="#2dd4bf" strokeWidth={2} fill="url(#unlockedGrad)" dot={{ fill: '#2dd4bf', r: 3, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}