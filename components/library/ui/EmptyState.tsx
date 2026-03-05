'use client';
import { BookOpen, Plus, Lock } from 'lucide-react';

interface EmptyStateProps {
  nodeUnlocked: boolean;
  onAdd?: () => void;
}

export function EmptyState({ nodeUnlocked, onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-700">

      {/* Ícone */}
      <div className="w-16 h-16 border border-white/[0.08] bg-white/[0.01] flex items-center justify-center mb-6 text-zinc-600">
        {nodeUnlocked
          ? <BookOpen size={24} strokeWidth={1.5} />
          : <Lock size={24} strokeWidth={1.5} />
        }
      </div>

      {/* Título */}
      <p className="text-zinc-400 text-[11px] font-black uppercase tracking-[0.4em] mb-3">
        {nodeUnlocked ? 'Biblioteca Vazia' : 'Acesso Restrito'}
      </p>

      {/* Descrição */}
      <p className="text-zinc-600 text-[12px] font-normal max-w-[280px] leading-relaxed">
        {nodeUnlocked
          ? 'Nenhum conteúdo indexado neste módulo ainda.'
          : 'Desbloqueie este módulo na árvore para adicionar conteúdos.'}
      </p>

      {/* Botão — só aparece se desbloqueado e handler disponível */}
      {nodeUnlocked && onAdd && (
        <button
          onClick={onAdd}
          className="mt-8 flex items-center gap-2 px-5 py-2.5 border border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.06] text-[#2dd4bf] text-[9px] font-black uppercase tracking-widest hover:bg-[#2dd4bf]/10 hover:border-[#2dd4bf]/50 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Plus size={10} />
          Adicionar Conteúdo
        </button>
      )}

      <div className="mt-8 w-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

    </div>
  );
}