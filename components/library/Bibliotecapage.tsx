'use client';
import { useState, useMemo } from 'react';
import { Search, Plus, Filter, X } from 'lucide-react';

import { ContentType } from './types';
import { MOCK_NODES, TYPE_CONFIG, FILTER_OPTIONS } from './constants';
import { ContentCard, EmptyState } from './BibliotecaComponents';
import { BibliotecaSidebar } from './BibliotecaSideBar';

export default function BibliotecaPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(MOCK_NODES[0].id);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all');

  const selectedNode = useMemo(
    () => MOCK_NODES.find(n => n.id === selectedNodeId) ?? MOCK_NODES[0],
    [selectedNodeId]
  );

  const filteredContents = useMemo(() => {
    return selectedNode.contents.filter(c => {
      const matchType = typeFilter === 'all' || c.type === typeFilter;
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [selectedNode, typeFilter, search]);

  const totalContents = MOCK_NODES.reduce((acc, n) => acc + n.contents.length, 0);

  return (
    <div className="relative min-h-[calc(100vh-160px)] w-full bg-[#030304] flex flex-col overflow-hidden">

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#c8b89a06_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full p-6 flex flex-col gap-10 flex-1">

        <header className="space-y-2 pt-2 reveal-up delay-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-[#c8b89a]" />
              <h2 className="text-[#c8b89a] text-[10px] font-black uppercase tracking-[0.4em]">
                Nexus / Biblioteca de Conhecimento
              </h2>
              <div className="h-[1px] w-32 bg-gradient-to-r from-[#c8b89a]/20 to-transparent" />
            </div>

            <div className="flex items-center gap-8">
              {[
                { label: 'Módulos',       value: MOCK_NODES.length },
                { label: 'Conteúdos',     value: totalContents },
                { label: 'Desbloqueados', value: MOCK_NODES.filter(n => n.isUnlocked).length },
              ].map((s, i) => (
                <div key={i} className="text-right">
                  <p className="text-white text-2xl font-black font-mono leading-none">{s.value}</p>
                  <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="flex gap-8 flex-1 min-h-0 reveal-up delay-100">

          <BibliotecaSidebar
            nodes={MOCK_NODES}
            selectedNodeId={selectedNodeId}
            onSelect={setSelectedNodeId}
          />

          <main className="flex-1 min-w-0 flex flex-col gap-6">

            <div className="p-8 border border-white/[0.04] bg-white/[0.01] relative overflow-hidden group">
              <div
                className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
                style={{ background: `linear-gradient(to right, transparent, ${selectedNode.color}44, transparent)` }}
              />
              <div className="absolute top-0 left-0 bottom-0 w-[2px]" style={{ backgroundColor: selectedNode.color }} />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/5 group-hover:border-white/10 transition-colors duration-300" />

              <div className="flex items-center justify-between pl-5">
                <div className="flex items-center gap-6">
                  <div
                    className="w-14 h-14 flex items-center justify-center border text-2xl"
                    style={{ borderColor: `${selectedNode.color}30`, backgroundColor: `${selectedNode.color}0d` }}
                  >
                    {selectedNode.icon}
                  </div>
                  <div>
                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-1">
                      Módulo Selecionado
                    </p>
                    <h2 className="text-white text-xl font-black uppercase tracking-[0.15em] leading-none">
                      {selectedNode.name}
                    </h2>
                    <p className="text-zinc-600 text-[10px] font-medium mt-2">
                      {selectedNode.contents.length} conteúdo{selectedNode.contents.length !== 1 ? 's' : ''} registrado{selectedNode.contents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {selectedNode.isUnlocked && (
                  <button className="flex items-center gap-3 px-6 py-3.5 border border-[#c8b89a]/30 bg-[#c8b89a]/[0.06] text-[#c8b89a] hover:bg-[#c8b89a]/10 hover:border-[#c8b89a]/50 transition-all duration-300 cursor-pointer">
                    <Plus size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Conteúdo</span>
                  </button>
                )}
              </div>
            </div>

            {selectedNode.isUnlocked && selectedNode.contents.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar conteúdo..."
                    className="w-full bg-white/[0.02] border border-white/[0.06] pl-11 pr-4 py-3.5 text-white text-sm font-medium outline-none focus:border-[#c8b89a]/30 transition-colors placeholder:text-zinc-700 cursor-text"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Filter size={12} className="text-zinc-700 mr-1" />
                  {FILTER_OPTIONS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setTypeFilter(f.value)}
                      className={`px-4 py-3.5 text-[9px] font-black uppercase tracking-widest border transition-all duration-200 cursor-pointer
                        ${typeFilter === f.value
                          ? 'border-[#c8b89a]/40 bg-[#c8b89a]/[0.08] text-[#c8b89a]'
                          : 'border-white/[0.04] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.08]'
                        }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              className="flex-1 overflow-y-auto pb-20"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,184,154,0.1) transparent' }}
            >
              {!selectedNode.isUnlocked || selectedNode.contents.length === 0 ? (
                <EmptyState nodeUnlocked={selectedNode.isUnlocked} />
              ) : filteredContents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">
                    Nenhum resultado para "{search}"
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-10">
                  {(['link', 'video', 'pdf', 'note'] as ContentType[]).map(type => {
                    const items = filteredContents.filter(c => c.type === type);
                    if (items.length === 0) return null;
                    const cfg = TYPE_CONFIG[type];
                    return (
                      <div key={type}>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="flex items-center gap-2" style={{ color: cfg.color }}>
                            {cfg.icon}
                            <span className="text-[9px] font-black uppercase tracking-[0.35em]">{cfg.label}s</span>
                          </div>
                          <div
                            className="h-[1px] flex-1"
                            style={{ background: `linear-gradient(to right, ${cfg.color}25, transparent)` }}
                          />
                          <span className="text-[9px] text-zinc-700 font-mono">{items.length}</span>
                        </div>

                        <div className="flex flex-col gap-3">
                          {items.map(c => <ContentCard key={c.id} content={c} />)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}