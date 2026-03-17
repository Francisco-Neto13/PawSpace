'use client';

import type { SkillNode } from '@/contexts/PawSpaceContext';

interface SelectedNodeSummaryProps {
  selectedNode: SkillNode;
  childCount: number;
  selectedContentsCount: number;
  selectedProgress: string;
}

export function SelectedNodeSummary({
  selectedNode,
  childCount,
  selectedContentsCount,
  selectedProgress,
}: SelectedNodeSummaryProps) {
  return (
    <div className="absolute left-3 bottom-3 z-40 w-[296px] max-w-[calc(100%-0.75rem)] pointer-events-none animate-in fade-in zoom-in-95 duration-200 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="relative z-10 p-3">
        <p className="data-label mb-1.5">Trilha selecionada</p>
        <h3 className="surface-title text-[1.15rem] mb-2 truncate">
          {selectedNode.data.label || selectedNode.data.name || 'Sem nome'}
        </h3>
        <div className="h-px bg-[var(--border-subtle)] mb-2" />
        <div className="grid grid-cols-3 gap-1.5">
          <StatCard label="Filhos" value={childCount} />
          <StatCard label="Conteúdos" value={selectedContentsCount} />
          <StatCard label="Progresso" value={selectedProgress} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="relative rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
      <p className="data-label mb-1">{label}</p>
      <p className="text-[12px] leading-none text-[var(--text-primary)] font-black font-mono tabular-nums">
        {value}
      </p>
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[var(--border-muted)]" />
    </div>
  );
}
