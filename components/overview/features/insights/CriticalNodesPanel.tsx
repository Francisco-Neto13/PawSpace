'use client';
import { useMemo } from 'react';
import { SkillNode } from '@/shared/contexts/NexusContext';
import { Edge } from '@xyflow/react';
import { Circle, CircleCheck } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

interface Props { nodes: SkillNode[]; edges: Edge[] }

export default function CriticalNodesPanel({ nodes, edges }: Props) {
  const critical = useMemo(() => {
    const childCount = new Map<string, number>();
    edges.forEach(e => {
      childCount.set(e.source, (childCount.get(e.source) ?? 0) + 1);
    });
    return nodes
      .filter(n => (childCount.get(n.id) ?? 0) > 0)
      .map(n => {
        const data = n.data as any;
        const linksCount    = Array.isArray(data?.links)    ? data.links.length    : 0;
        const contentsCount = Array.isArray(data?.contents) ? data.contents.length : 0;
        const hasContent    = (linksCount + contentsCount) > 0;
        return {
          id:         n.id,
          name:       n.data.label || n.data.name,
          icon:       n.data.icon ?? '*',
          color:      n.data.color ?? '#ffffff',
          hasContent,
          dependents: childCount.get(n.id) ?? 0,
        };
      })
      .sort((a, b) => b.dependents - a.dependents)
      .slice(0, 6);
  }, [nodes, edges]);

  if (critical.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
        Patas Críticas
      </p>
      <p className="text-[9px] text-zinc-600 mb-6 ml-3">módulos que sustentam mais dependências</p>

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
              {n.hasContent
                ? <CircleCheck size={10} className="text-white/70" />
                : <Circle     size={10} className="text-zinc-600" />
              }
            </div>
            <div className="w-16 h-[2px] bg-white/[0.04] overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${Math.min((n.dependents / critical[0].dependents) * 100, 100)}%`,
                  backgroundColor: n.hasContent ? 'rgba(255,255,255,0.6)' : '#3f3f46',
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
