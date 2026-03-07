'use client';
import { memo, useState } from 'react';
import { CircleCheck, Circle, ChevronRight } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import { CriticalNodeDatum } from '@/components/overview/lib/overviewMetrics';

interface Props { critical: CriticalNodeDatum[] }

function CriticalNodesPanel({ critical }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (critical.length === 0) return null;

  const covered   = critical.filter(n => n.hasContent).length;
  const uncovered = critical.filter(n => !n.hasContent).length;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-start justify-between mb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
          Patas Críticas
        </p>
        <div className="flex gap-1.5">
          {covered > 0 && (
            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-white/[0.06] border border-white/[0.1] text-white/60">
              ✓ {covered}
            </span>
          )}
          {uncovered > 0 && (
            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-white/[0.02] border border-white/[0.04] text-zinc-400">
              ○ {uncovered}
            </span>
          )}
        </div>
      </div>
      <p className="text-[9px] text-zinc-400 mb-6 ml-3">módulos que sustentam mais dependências</p>

      <div className="space-y-1">
        {critical.map((n, i) => {
          const isExpanded = expandedId === n.id;
          const barPct = Math.min((n.dependents / critical[0].dependents) * 100, 100);

          return (
            <div key={n.id}>
              <button
                className="w-full flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg transition-all duration-200 group text-left"
                style={{
                  backgroundColor: isExpanded ? 'rgba(255,255,255,0.04)' : 'transparent',
                }}
                onClick={() => setExpandedId(isExpanded ? null : n.id)}
              >
                <span className="text-[9px] text-zinc-500 font-mono w-4 shrink-0">{i + 1}</span>

                <span className="text-base shrink-0">{n.icon}</span>

                <span
                  className="text-[10px] font-bold flex-1 truncate transition-colors duration-200"
                  style={{ color: isExpanded ? '#ffffff' : n.hasContent ? 'rgba(255,255,255,0.82)' : '#a1a1aa' }}
                >
                  {n.name}
                </span>

                <span className="text-[9px] text-zinc-400 font-mono shrink-0">{n.dependents} deps</span>

                <div className="w-4 shrink-0 flex items-center justify-center">
                  {n.hasContent
                    ? <CircleCheck size={11} className="text-white/60" />
                    : <Circle     size={11} className="text-zinc-500" />
                  }
                </div>

                <div className="w-20 h-[3px] bg-white/[0.04] overflow-hidden rounded-full shrink-0">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${barPct}%`,
                      backgroundColor: n.hasContent ? 'rgba(255,255,255,0.55)' : '#3f3f46',
                    }}
                  />
                </div>

                <ChevronRight
                  size={10}
                  className="shrink-0 transition-transform duration-200 text-zinc-500"
                  style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                />
              </button>

              {isExpanded && (
                <div
                  className="ml-7 mb-2 px-3 py-3 border border-white/[0.06] bg-white/[0.02] rounded-lg"
                  style={{
                    animation: 'slideDown 0.2s ease-out',
                  }}
                >
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[8px] text-zinc-400 uppercase tracking-wider font-bold mb-0.5">Links</p>
                      <p className="text-white font-mono font-black text-lg">{n.linksCount}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-zinc-400 uppercase tracking-wider font-bold mb-0.5">Conteúdos</p>
                      <p className="text-white font-mono font-black text-lg">{n.contentsCount}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-zinc-400 uppercase tracking-wider font-bold mb-0.5">Dependentes</p>
                      <p className="text-white font-mono font-black text-lg">{n.dependents}</p>
                    </div>
                    <div className="flex-1 flex items-center justify-end">
                      <span
                        className="text-[9px] font-black uppercase tracking-wider px-2 py-1 border"
                        style={{
                          borderColor: n.hasContent ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                          color: n.hasContent ? 'rgba(255,255,255,0.8)' : '#a1a1aa',
                        }}
                      >
                        {n.hasContent ? 'Coberto' : 'Sem conteúdo'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {uncovered > 0 && (
        <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2">
          <Circle size={8} className="text-zinc-400 shrink-0" />
          <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">
            {uncovered} pata{uncovered > 1 ? 's' : ''} crítica{uncovered > 1 ? 's' : ''} sem conteúdo — prioridade alta
          </p>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default memo(CriticalNodesPanel);
