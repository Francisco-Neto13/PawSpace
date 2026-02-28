'use client';
import { ChevronRight } from 'lucide-react';
import { SkillNode } from '../types';

interface BibliotecaSidebarProps {
  nodes: SkillNode[];
  selectedNodeId: string;
  onSelect: (id: string) => void;
}

export function BibliotecaSidebar({ nodes, selectedNodeId, onSelect }: BibliotecaSidebarProps) {
  return (
    <aside className="w-72 shrink-0 flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-3 bg-[#c8b89a]/40" />
        <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.3em]">
          Módulos da Árvore
        </p>
      </div>

      <div
        className="flex flex-col gap-2 overflow-y-auto flex-1 pb-20"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,184,154,0.1) transparent' }}
      >
        {nodes.map(node => {
          const isSelected = node.id === selectedNodeId;
          return (
            <button
              key={node.id}
              onClick={() => onSelect(node.id)}
              disabled={!node.isUnlocked}
              className={`group relative flex items-center gap-4 px-5 py-4 border text-left transition-all duration-300
                ${isSelected
                  ? 'border-[#c8b89a]/20 bg-[#c8b89a]/[0.04] cursor-pointer'
                  : node.isUnlocked
                    ? 'border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] cursor-pointer'
                    : 'border-white/[0.02] opacity-30 cursor-not-allowed'
                }`}
            >
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ backgroundColor: node.color }} />
              )}
              <div
                className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
                style={{
                  background: isSelected
                    ? `linear-gradient(to right, ${node.color}33, transparent)`
                    : 'transparent',
                }}
              />

              <div
                className="w-9 h-9 flex items-center justify-center border shrink-0 text-base"
                style={{
                  borderColor: isSelected ? `${node.color}40` : 'rgba(255,255,255,0.04)',
                  backgroundColor: isSelected ? `${node.color}0d` : 'transparent',
                }}
              >
                {node.isUnlocked ? node.icon : '🔒'}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-bold truncate transition-colors duration-300 ${isSelected ? 'text-[#c8b89a]' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                  {node.name}
                </p>
                <p className="text-[9px] text-zinc-700 font-mono mt-0.5">
                  {node.contents.length} {node.contents.length === 1 ? 'item' : 'itens'}
                </p>
              </div>

              {isSelected && <ChevronRight size={12} className="text-[#c8b89a]/40 shrink-0" />}
            </button>
          );
        })}
      </div>
    </aside>
  );
}