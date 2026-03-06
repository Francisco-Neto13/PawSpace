'use client';
import { Plus } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

interface TreeEmptyStateProps {
  onCreate: () => void;
}

export function TreeEmptyState({ onCreate }: TreeEmptyStateProps) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 pointer-events-none">
      <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-white opacity-[0.04] pointer-events-none" />

      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
          <p className="text-zinc-300 text-[11px] font-black uppercase tracking-[0.4em]">
            Pawspace Vazio
          </p>
        </div>
        <p className="text-zinc-600 text-[11px] font-normal max-w-[260px] leading-relaxed">
          Nenhuma árvore registrada. Crie o nó raiz para iniciar sua Árvore.
        </p>
      </div>

      <button
        onClick={onCreate}
        className="pointer-events-auto flex items-center gap-2 px-6 py-3 border border-[#ffffff]/30 bg-[#ffffff]/[0.06] text-[#ffffff] text-[9px] font-black uppercase tracking-widest hover:bg-[#ffffff]/10 hover:border-[#ffffff]/50 transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <Plus size={11} />
        Iniciar Árvore
      </button>

      <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

    </div>
  );
}

