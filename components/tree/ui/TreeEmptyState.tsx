'use client';
import { Plus } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

interface TreeEmptyStateProps {
  onCreate: () => void;
}

export function TreeEmptyState({ onCreate }: TreeEmptyStateProps) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 pointer-events-none">
      <div className="relative w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 text-center overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
        <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-[var(--text-primary)] opacity-[0.04] pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
            <p className="text-[var(--text-primary)] text-[11px] font-black uppercase tracking-[0.4em]">
              Pawspace Vazio
            </p>
          </div>
          <p className="text-[var(--text-secondary)] text-[11px] font-normal max-w-[260px] mx-auto leading-relaxed">
            Nenhuma árvore registrada. Crie o nó raiz para iniciar sua árvore.
          </p>
        </div>

        <button
          onClick={onCreate}
          className="relative z-10 mt-6 pointer-events-auto h-10 px-4 rounded-xl border border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[9px] font-black uppercase tracking-widest hover:bg-[var(--bg-input)] transition-all duration-200 active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
        >
          <Plus size={11} />
          Iniciar Arvore
        </button>

        <div className="relative z-10 mt-6 w-10 h-px bg-gradient-to-r from-transparent via-[var(--border-muted)] to-transparent mx-auto" />
      </div>
    </div>
  );
}

