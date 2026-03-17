'use client';
import { Plus } from 'lucide-react';
import { SkillNode } from '../../types';

interface LibraryNodeHeaderProps {
  node: SkillNode;
  contentsCount: number;
  isLoading: boolean;
  onAddContent: () => void;
}

export function LibraryNodeHeader({
  node,
  contentsCount,
  isLoading,
  onAddContent,
}: LibraryNodeHeaderProps) {
  return (
    <div className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border text-xl shrink-0"
            style={{ borderColor: `${node.color}30`, backgroundColor: `${node.color}12` }}
          >
            {node.icon}
          </div>
          <div className="min-w-0">
            <p className="library-kicker mb-1">Trilha selecionada</p>
            <h2 className="surface-title truncate">{node.name}</h2>
            <p className="ui-copy mt-1.5">
              {isLoading
                ? 'Abrindo a estante...'
                : `${contentsCount} ${contentsCount === 1 ? 'material guardado' : 'materiais guardados'} nesta trilha`}
            </p>
          </div>
        </div>

        <button
          onClick={onAddContent}
          className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border-visible)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--text-secondary)] hover:bg-[var(--bg-input)] cursor-pointer sm:w-auto"
        >
          <Plus size={13} />
          <span className="button-label">Adicionar material</span>
        </button>
      </div>
    </div>
  );
}
