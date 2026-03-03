'use client';
import { useMemo } from 'react';
import { SkillNode } from '@/contexts/NexusContext';
import { Edge } from '@xyflow/react';
import { Lock, Unlock } from 'lucide-react';

interface Props { nodes: SkillNode[]; edges: Edge[] }

export default function CriticalNodesPanel({ nodes, edges }: Props) {
  const critical = useMemo(() => {
    const childCount = new Map<string, number>();
    edges.forEach(e => {
      childCount.set(e.source, (childCount.get(e.source) ?? 0) + 1);
    });

    return nodes
      .filter(n => (childCount.get(n.id) ?? 0) > 0)
      .map(n => ({
        id: n.id,
        name: n.data.label || n.data.name,
        icon: n.data.icon ?? '🔹',
        color: n.data.color ?? '#c8b89a',
        isUnlocked: n.data.isUnlocked,
        dependents: childCount.get(n.id) ?? 0,
      }))
      .sort((a, b) => b.dependents - a.dependents)
      .slice(0, 6);
  }, [nodes, edges]);

  if (critical.length === 0) return null;

  return (
    <div className="border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c8b89a]/20 to-transparent" />
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#c8b89a] mb-1 flex items-center gap-2">
        <span className="w-1 h-3 bg-[#c8b89a] inline-block" />
        Nós Críticos
      </p>
      <p className="text-[9px] text-zinc-600 mb-6 ml-3">bloqueando mais dependências</p>

      <div className="space-y-2">
        {critical.map((n, i) => (
          <div key={n.id} className="flex items-center gap-3 group">
            <span className="text-[9px] text-zinc-700 font-mono w-4">{i + 1}</span>
            <span className="text-base">{n.icon}</span>
            <span className="text-[10px] text-zinc-300 font-bold flex-1 truncate group-hover:text-white transition-colors">
              {n.name}
            </span>
            <span className="text-[9px] text-zinc-600 font-mono">{n.dependents} deps</span>
            <div className="w-4">
              {n.isUnlocked
                ? <Unlock size={10} className="text-[#c8b89a]" />
                : <Lock size={10} className="text-zinc-600" />
              }
            </div>
            <div className="w-16 h-[2px] bg-white/[0.04] overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${Math.min((n.dependents / critical[0].dependents) * 100, 100)}%`,
                  backgroundColor: n.isUnlocked ? '#c8b89a' : '#3f3f46',
                  transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}