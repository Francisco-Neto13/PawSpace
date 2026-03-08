'use client';
import { useState } from 'react';
import { ChevronRight, Library, Search } from 'lucide-react';
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
      className="w-72 shrink-0 flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 relative overflow-hidden"
      style={{
        height: 'calc(100dvh - var(--navbar-height) - 120px)',
        position: 'sticky',
        top: 'calc(var(--navbar-height) + 24px)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex items-center gap-2">
        <div className="w-1 h-3 bg-[var(--text-secondary)]" />
        <p className="text-[9px] text-[var(--text-secondary)] uppercase font-black tracking-[0.3em] antialiased">
          Módulos da Árvore
        </p>
      </div>

      <div className="relative">
        <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar módulo..."
          className="w-full bg-[var(--bg-input)] border border-[var(--border-muted)] pl-8 pr-3 py-2.5 text-[10px] text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] font-mono outline-none focus:border-[var(--border-visible)] transition-colors"
        />
      </div>

      <div
        className="flex flex-col gap-1 overflow-y-auto flex-1 pb-4 pr-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-visible) transparent' }}
      >
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[var(--border-subtle)] rounded-xl mr-2">
            <Library size={16} className="text-[var(--text-muted)] mb-3" />
            <p className="text-[var(--text-muted)] text-[8px] font-black uppercase tracking-[0.2em] text-center px-4">
              Aguardando nova indexação de dados
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-[10px] text-[var(--text-muted)] font-mono text-center py-8">
            Nenhum módulo encontrado
          </p>
        ) : (
          filtered.map(node => {
            const isSelected = node.id === selectedNodeId;
            return (
              <button
                key={node.id}
                onClick={() => onSelect(node.id)}
                className={`group relative flex items-center gap-4 px-5 py-4 border rounded-xl text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-muted)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-xl" style={{ backgroundColor: node.color }} />
                )}

                <div
                  className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none rounded-t-xl"
                  style={{
                    background: isSelected
                      ? `linear-gradient(to right, ${node.color}33, transparent)`
                      : 'transparent',
                  }}
                />

                <div
                  className="w-9 h-9 flex items-center justify-center border shrink-0 text-base rounded-lg"
                  style={{
                    borderColor: isSelected ? `${node.color}40` : 'var(--border-subtle)',
                    backgroundColor: isSelected ? `${node.color}0d` : 'var(--bg-input)',
                  }}
                >
                  {node.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] font-bold truncate transition-colors duration-300"
                    style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    {node.name}
                  </p>
                  <p className="text-[9px] text-[var(--text-muted)] font-mono mt-0.5">
                    {node.contents.length} {node.contents.length === 1 ? 'item' : 'itens'}
                  </p>
                </div>

                {isSelected && (
                  <ChevronRight size={12} className="text-[var(--text-secondary)] shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}