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
            <p className="library-kicker mb-1">Módulo Selecionado</p>
            <h2 className="text-[var(--text-primary)] text-lg font-black truncate">{node.name}</h2>
            <p className="text-[var(--text-secondary)] text-[10px] font-medium mt-1">
              {isLoading
                ? 'Carregando conteúdos...'
                : `${contentsCount} conteúdo${contentsCount !== 1 ? 's' : ''} registrado${contentsCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <button
          onClick={onAddContent}
          className="h-10 shrink-0 flex items-center justify-center gap-2 px-4 border border-[var(--border-visible)] rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-input)] hover:border-[var(--text-secondary)] transition-all duration-200 cursor-pointer"
        >
          <Plus size={13} />
          <span className="text-[9px] font-black uppercase tracking-widest">Adicionar Conteúdo</span>
        </button>
      </div>
    </div>
  );
}

