'use client';
import { memo, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import { CriticalNodeDatum } from '@/components/overview/lib/overviewMetrics';

interface Props {
  critical: CriticalNodeDatum[];
}

function CriticalNodesPanel({ critical }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const safeExpandedId = critical.some((item) => item.id === expandedId) ? expandedId : null;

  if (critical.length === 0) {
    return (
      <div className="overview-card overview-card-hover p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
        <p className="overview-kicker text-[var(--text-primary)] flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
          Trilhas Críticas
        </p>
        <p className="overview-subtitle mt-6 ml-3">
          Conecte trilhas na árvore para descobrir o que sustenta mais progresso.
        </p>
      </div>
    );
  }

  const covered = critical.filter((n) => n.hasContent).length;
  const uncovered = critical.filter((n) => !n.hasContent).length;

  return (
    <div className="h-full max-h-[440px] overview-card overview-card-hover p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex items-start justify-between mb-1 shrink-0">
        <p className="overview-kicker text-[var(--text-primary)] flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
          Trilhas Críticas
        </p>
        <div className="flex gap-1.5">
          {covered > 0 && (
            <span className="data-label px-2 py-0.5 bg-[var(--bg-elevated)] border border-[var(--border-muted)] text-[var(--text-secondary)]">
              {covered} coberta{covered > 1 ? 's' : ''}
            </span>
          )}
          {uncovered > 0 && (
            <span className="data-label px-2 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              {uncovered} pendente{uncovered > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      <p className="overview-subtitle mb-6 ml-3 shrink-0">
        Trilhas que mais destravam o território quando recebem material
      </p>

      <div className="flex-1 min-h-0 overview-scroll-area">
        <div className="flex flex-col gap-1 pr-1 pb-1">
          {critical.map((n, i) => {
            const isExpanded = safeExpandedId === n.id;
            const maxDependents = Math.max(critical[0]?.dependents ?? 1, 1);
            const barPct = Math.min((n.dependents / maxDependents) * 100, 100);

            return (
              <div key={n.id}>
                <button
                  className="w-full flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg transition-all duration-200 text-left"
                  style={{ backgroundColor: isExpanded ? 'var(--bg-elevated)' : 'transparent' }}
                  onClick={() => setExpandedId(isExpanded ? null : n.id)}
                >
                  <span className="ui-meta font-mono w-4 shrink-0">{i + 1}</span>
                  <span className="text-base shrink-0">{n.icon}</span>

                  <span
                    className="sidebar-title flex-1 truncate transition-colors duration-200"
                    style={{ color: isExpanded || n.hasContent ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    {n.name}
                  </span>

                  <span className="ui-meta text-[var(--text-secondary)] font-mono font-black shrink-0">
                    {n.dependents} dep.
                  </span>

                  {n.hasContent
                    ? <CheckCircle2 size={11} className="text-[var(--text-secondary)] shrink-0" />
                    : <AlertCircle size={11} className="text-[var(--text-muted)] shrink-0" />
                  }

                  <div className="w-16 h-[3px] bg-[var(--bg-elevated)] overflow-hidden rounded-full shrink-0">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${barPct}%`,
                        backgroundColor: n.hasContent ? 'var(--chart-medium)' : 'var(--text-faint)',
                      }}
                    />
                  </div>

                  <ChevronRight
                    size={10}
                    className="shrink-0 transition-transform duration-200 text-[var(--text-muted)]"
                    style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  />
                </button>

                {isExpanded && (
                  <div
                    className="ml-7 mb-2 px-4 py-3 border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-lg"
                    style={{ animation: 'slideDown 0.2s ease-out' }}
                  >
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="data-label mb-0.5">
                          Links
                        </p>
                        <p className="text-[var(--text-primary)] font-mono font-black text-[15px] leading-none">{n.linksCount}</p>
                      </div>
                      <div>
                        <p className="data-label mb-0.5">
                          Materiais
                        </p>
                        <p className="text-[var(--text-primary)] font-mono font-black text-[15px] leading-none">{n.contentsCount}</p>
                      </div>
                      <div>
                        <p className="data-label mb-0.5">
                          Trilhas dependentes
                        </p>
                        <p className="text-[var(--text-primary)] font-mono font-black text-[15px] leading-none">{n.dependents}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                      {n.hasContent ? (
                        <CheckCircle2 size={10} className="text-[var(--text-secondary)] shrink-0" />
                      ) : (
                        <AlertCircle size={10} className="text-[var(--text-muted)] shrink-0" />
                      )}
                      <p
                        className="caption-meta uppercase"
                        style={{ color: n.hasContent ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                      >
                        {n.hasContent
                          ? 'Esta trilha já tem material na estante'
                          : 'Sem material ainda. Preencher aqui libera outras trilhas'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2 shrink-0">
        <p className="caption-meta uppercase">
          dep. - quantas trilhas dependem desta para avançar
        </p>
        {uncovered > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle size={8} className="text-[var(--text-secondary)] shrink-0" />
            <p className="caption-meta uppercase text-[var(--text-secondary)]">
              {uncovered} trilha{uncovered > 1 ? 's críticas sem' : ' crítica sem'} material -
              priorizar aqui destrava o resto do mapa
            </p>
          </div>
        )}
      </div>

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
