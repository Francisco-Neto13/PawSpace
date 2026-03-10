'use client';
import { BookOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAdd?: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="library-panel flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in duration-500 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
      <div className="w-14 h-14 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-surface)] flex items-center justify-center mb-5 text-[var(--text-muted)]">
        <BookOpen size={24} strokeWidth={1.5} />
      </div>

      <p className="library-kicker mb-2">
        Biblioteca Vazia
      </p>

      <p className="library-subtitle max-w-[340px]">
        Nenhum conteúdo indexado neste módulo ainda.
      </p>

      {onAdd && (
        <button
          onClick={onAdd}
          className="mt-6 h-10 flex items-center gap-2 px-4 border border-[var(--border-visible)] rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[9px] font-black uppercase tracking-widest hover:bg-[var(--bg-input)] hover:border-[var(--text-secondary)] transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <Plus size={10} />
          Adicionar Conteúdo
        </button>
      )}

      <div className="mt-6 w-10 h-px bg-gradient-to-r from-transparent via-[var(--border-muted)] to-transparent" />
    </div>
  );
}

