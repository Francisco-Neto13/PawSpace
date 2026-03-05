'use client';
import { BookOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAdd?: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-700">
      <div className="w-16 h-16 border border-white/[0.08] bg-white/[0.01] flex items-center justify-center mb-6 text-zinc-600">
        <BookOpen size={24} strokeWidth={1.5} />
      </div>

      <p className="text-zinc-400 text-[11px] font-black uppercase tracking-[0.4em] mb-3">
        Biblioteca Vazia
      </p>

      <p className="text-zinc-600 text-[12px] font-normal max-w-[280px] leading-relaxed">
        Nenhum conteudo indexado neste modulo ainda.
      </p>

      {onAdd && (
        <button
          onClick={onAdd}
          className="mt-8 flex items-center gap-2 px-5 py-2.5 border border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.06] text-[#2dd4bf] text-[9px] font-black uppercase tracking-widest hover:bg-[#2dd4bf]/10 hover:border-[#2dd4bf]/50 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Plus size={10} />
          Adicionar Conteudo
        </button>
      )}

      <div className="mt-8 w-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
