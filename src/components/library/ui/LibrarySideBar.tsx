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
      className="library-panel relative flex max-h-[26rem] flex-col gap-4 self-start overflow-hidden bg-[var(--bg-strong)] p-4 xl:sticky xl:top-[calc(var(--navbar-height)+24px)] xl:h-[calc(100dvh-var(--navbar-height)-140px)] xl:max-h-none"
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex items-center justify-between gap-3 px-1 pt-1">
        <p className="library-kicker">
          Trilhas da Árvore
        </p>
        <span className="library-chip">{nodes.length}</span>
      </div>

      <div className="relative px-0.5">
        <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar trilha..."
          className="library-input h-10 pl-8 pr-3 text-sm font-medium text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]"
        />
      </div>

      <div
        className="flex flex-1 min-h-0 flex-col gap-2 overview-scroll-area px-0.5 pr-1"
      >
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[var(--border-subtle)] rounded-xl">
            <Library size={16} className="text-[var(--text-muted)] mb-3" />
            <p className="ui-label text-center px-4">
              Aguardando novas trilhas
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="ui-meta font-mono text-center py-8">
            Nenhuma trilha encontrada
          </p>
        ) : (
          filtered.map(node => {
            const isSelected = node.id === selectedNodeId;
            return (
              <button
                key={node.id}
                onClick={() => onSelect(node.id)}
                className={`group relative flex min-h-[4.25rem] items-center gap-3 rounded-xl border px-3 py-3.5 text-left transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-muted)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-[1px] bottom-[1px] w-[2px]" style={{ backgroundColor: node.color }} />
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
                    className="sidebar-title truncate transition-colors duration-200"
                    style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  >
                    {node.name}
                  </p>
                  <p className="ui-meta font-mono mt-0.5">
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
