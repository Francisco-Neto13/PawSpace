'use client';
import { Plus } from 'lucide-react';

interface TreeEmptyStateProps {
  onCreate: () => void;
}

export function TreeEmptyState({ onCreate }: TreeEmptyStateProps) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 pointer-events-none">

      <div className="text-center space-y-2">
        <p className="text-zinc-300 text-[11px] font-black uppercase tracking-[0.4em]">
          Nexus Vazio
        </p>
        <p className="text-zinc-600 text-[11px] font-normal max-w-[260px] leading-relaxed">
          Nenhum protocolo registrado. Crie o nó raiz para iniciar sua Skill Tree.
        </p>
      </div>

      <button
        onClick={onCreate}
        className="pointer-events-auto flex items-center gap-2 px-6 py-3 border border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.06] text-[#2dd4bf] text-[9px] font-black uppercase tracking-widest hover:bg-[#2dd4bf]/10 hover:border-[#2dd4bf]/50 transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <Plus size={11} />
        Iniciar Protocolo
      </button>

      <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

    </div>
  );
}
