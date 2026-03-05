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
    <div className="p-8 border border-white/[0.04] bg-white/[0.01] relative overflow-hidden group">
      <div
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{ background: `linear-gradient(to right, transparent, ${node.color}44, transparent)` }}
      />
      <div className="absolute top-0 left-0 bottom-0 w-[2px]" style={{ backgroundColor: node.color }} />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/5 group-hover:border-white/10 transition-colors duration-300" />

      <div className="flex items-center justify-between pl-5">
        <div className="flex items-center gap-6">
          <div
            className="w-14 h-14 flex items-center justify-center border text-2xl"
            style={{ borderColor: `${node.color}30`, backgroundColor: `${node.color}0d` }}
          >
            {node.icon}
          </div>
          <div>
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-1">
              Modulo Selecionado
            </p>
            <h2 className="text-white text-xl font-black uppercase tracking-[0.15em] leading-none">
              {node.name}
            </h2>
            <p className="text-zinc-600 text-[10px] font-medium mt-2">
              {isLoading
                ? 'Carregando...'
                : `${contentsCount} conteudo${contentsCount !== 1 ? 's' : ''} registrado${contentsCount !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>

        <button
          onClick={onAddContent}
          className="flex items-center gap-3 px-6 py-3.5 border border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.06] text-[#2dd4bf] hover:bg-[#2dd4bf]/10 hover:border-[#2dd4bf]/50 transition-all duration-300 cursor-pointer"
        >
          <Plus size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Conteudo</span>
        </button>
      </div>
    </div>
  );
}
