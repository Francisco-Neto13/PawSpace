'use client';
import { BookOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAdd?: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-700">
      <div className="w-16 h-16 border border-[var(--border-muted)] bg-[var(--bg-surface)] flex items-center justify-center mb-6 text-[var(--text-muted)]">
        <BookOpen size={24} strokeWidth={1.5} />
      </div>

      <p className="text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.4em] mb-3">
        Biblioteca Vazia
      </p>

      <p className="text-[var(--text-secondary)] text-[12px] font-normal max-w-[280px] leading-relaxed">
        Nenhum conteúdo indexado neste módulo ainda.
      </p>

      {onAdd && (
        <button
          onClick={onAdd}
          className="mt-8 flex items-center gap-2 px-5 py-2.5 border border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[9px] font-black uppercase tracking-widest hover:bg-[var(--bg-input)] hover:border-[var(--text-secondary)] transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Plus size={10} />
          Adicionar Conteúdo
        </button>
      )}

      <div className="mt-8 w-8 h-px bg-gradient-to-r from-transparent via-[var(--border-muted)] to-transparent" />
    </div>
  );
}

