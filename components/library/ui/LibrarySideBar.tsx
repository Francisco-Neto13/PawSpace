'use client';
import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { SkillNode } from '../types';

interface LibrarySidebarProps {
  nodes: SkillNode[];
  selectedNodeId: string;
  onSelect: (id: string) => void;
}

export function LibrarySidebar({ nodes, selectedNodeId, onSelect }: LibrarySidebarProps) {
  const [search, setSearch] = useState('');

  const filtered = nodes.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside
      className="w-72 shrink-0 flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 relative overflow-hidden"
      style={{
        height: 'calc(100dvh - var(--navbar-height) - 120px)',
        position: 'sticky',
        top: 'calc(var(--navbar-height) + 24px)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="flex items-center gap-2">
        <div className="w-1 h-3 bg-[#ffffff]/40" />
        <p className="text-[9px] text-zinc-400 uppercase font-black tracking-[0.3em]">
          Módulos da Árvore
        </p>
      </div>

      <div className="relative">
        <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar módulo..."
          className="w-full bg-black/30 border border-white/[0.08] pl-8 pr-3 py-2.5 text-[10px] text-zinc-300 placeholder:text-zinc-500 font-mono outline-none focus:border-white/20 transition-colors"
        />
      </div>

      <div
        className="flex flex-col gap-2 overflow-y-auto flex-1 pb-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
      >
        {filtered.length === 0 && (
          <p className="text-[10px] text-zinc-500 font-mono text-center py-8">Nenhum módulo encontrado</p>
        )}
        {filtered.map(node => {
          const isSelected = node.id === selectedNodeId;
          return (
            <button
              key={node.id}
              onClick={() => onSelect(node.id)}
              className={`group relative flex items-center gap-4 px-5 py-4 border rounded-xl text-left transition-all duration-300
                ${isSelected
                  ? 'border-white/20 bg-white/[0.06] cursor-pointer'
                  : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03] cursor-pointer'
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
                {node.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-bold truncate transition-colors duration-300 ${isSelected ? 'text-[#ffffff]' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                  {node.name}
                </p>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                  {node.contents.length} {node.contents.length === 1 ? 'item' : 'itens'}
                </p>
              </div>
              {isSelected && <ChevronRight size={12} className="text-[#ffffff]/40 shrink-0" />}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

