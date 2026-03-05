'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';

import { ContentType, SkillNode } from './types';
import { LibraryContentList } from './features/viewer/LibraryContentList';
import { LibraryFilters } from './features/viewer/LibraryFilters';
import { AddContentModal } from './features/editor/AddContentModal';
import { LibrarySidebar } from './ui/LibrarySideBar';

import { useNexus } from '@/contexts/NexusContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { deleteContent } from '@/app/actions/library';

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const nodeIdFromUrl = searchParams.get('nodeId');

  const { nodes, isLoading: isLoadingNexus, refreshNexus } = useNexus();
  const { nodeContents, loadingNodeId, loadNodeContents, refreshNodeContents } = useLibrary();

  const [visible, setVisible] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showAddContent, setShowAddContent] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const isEmptyLibrary = !isLoadingNexus && nodes.length === 0;
    if (!isEmptyLibrary) return;

    const prevBodyOverflowY = document.body.style.overflowY;
    const prevHtmlOverflowY = document.documentElement.style.overflowY;

    window.scrollTo({ top: 0, behavior: 'auto' });
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflowY = 'hidden';

    return () => {
      document.body.style.overflowY = prevBodyOverflowY;
      document.documentElement.style.overflowY = prevHtmlOverflowY;
    };
  }, [isLoadingNexus, nodes.length]);

  useEffect(() => {
    if (isLoadingNexus || nodes.length === 0) return;
    const targetId = (nodeIdFromUrl && nodes.find(n => n.id === nodeIdFromUrl))
      ? nodeIdFromUrl
      : (selectedNodeId || nodes[0].id);
    if (targetId !== selectedNodeId) {
      setSelectedNodeId(targetId);
      loadNodeContents(targetId);
    }
  }, [nodes, isLoadingNexus, nodeIdFromUrl, selectedNodeId, loadNodeContents]);

  const mappedNodes = useMemo(() => nodes.map(n => ({
    ...n,
    name: n.data.name || n.data.label || 'Sem Nome',
    icon: n.data.icon || '✦',
    color: n.data.color || '#2dd4bf',
    isUnlocked: !!n.data.isUnlocked,
    contents: nodeContents[n.id] ?? [],
  })) as SkillNode[], [nodes, nodeContents]);

  const selectedNode = useMemo(() =>
    mappedNodes.find(n => n.id === selectedNodeId) ?? mappedNodes[0],
  [mappedNodes, selectedNodeId]);

  const currentContents = useMemo(
    () => (selectedNodeId ? nodeContents[selectedNodeId] : []) ?? [],
    [nodeContents, selectedNodeId]
  );

  const filteredContents = useMemo(() => currentContents.filter(c => {
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  }), [currentContents, typeFilter, search]);

  const totalContents = useMemo(
    () => Object.values(nodeContents).reduce((acc, c) => acc + (c?.length || 0), 0),
    [nodeContents]
  );

  const isLoadingContents = loadingNodeId === selectedNodeId;

  const handleDelete = async (id: string) => {
    const result = await deleteContent(id);
    if (result.success && selectedNodeId) {
      await Promise.all([
        refreshNodeContents(selectedNodeId),
        refreshNexus(),
      ]);
    }
  };

  if (isLoadingNexus && nodes.length === 0) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#06090f]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2dd4bf06_1px,transparent_1px),linear-gradient(to_bottom,#2dd4bf06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
        </div>
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#2dd4bf]/20 border-t-[#2dd4bf] rounded-full animate-spin" />
          <p className="text-[#2dd4bf] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
            Sincronizando Nexus...
          </p>
        </div>
      </div>
    );
  }

  // Banco vazio — nenhum nó cadastrado ainda
  if (!isLoadingNexus && nodes.length === 0) {
    return (
      <div
        className="relative w-full bg-[#06090f] overflow-hidden"
        style={{
          height: 'calc(100dvh - var(--navbar-height) - var(--footer-height))',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#2dd4bf06_1px,transparent_1px),linear-gradient(to_bottom,#2dd4bf06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 text-center pointer-events-none">
          <div className="space-y-2">
            <p className="text-zinc-300 text-[11px] font-black uppercase tracking-[0.4em]">
              Skill Tree Vazia
            </p>
            <p className="text-zinc-600 text-[11px] font-normal max-w-[260px] leading-relaxed">
              Crie sua Skill Tree primeiro para começar a organizar conteúdos por módulo.
            </p>
          </div>
          <a
            href="/tree"
            className="pointer-events-auto flex items-center gap-2 px-6 py-3 border border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.06] text-[#2dd4bf] text-[9px] font-black uppercase tracking-widest hover:bg-[#2dd4bf]/10 hover:border-[#2dd4bf]/50 transition-all duration-200 active:scale-95"
          >
            Ir para Skill Tree
          </a>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full bg-[#06090f]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#2dd4bf06_1px,transparent_1px),linear-gradient(to_bottom,#2dd4bf06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />

      <div className="relative z-10 w-full py-8 pb-20 space-y-4">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-4 bg-[#2dd4bf]" />
          <span className="text-[#2dd4bf] text-[9px] font-black uppercase tracking-[0.4em]">
            Nexus / Biblioteca
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#2dd4bf]/15 to-transparent" />
        </div>

        <header>
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-8">
              {[
                { label: 'Módulos',       value: nodes.length },
                { label: 'Conteúdos',     value: totalContents },
                { label: 'Desbloqueados', value: nodes.filter(n => n.data.isUnlocked).length },
              ].map((s, i, arr) => (
                <div key={i} className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-white text-2xl font-black font-mono leading-none tracking-tighter">
                      {s.value.toString().padStart(2, '0')}
                    </p>
                    <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-1">{s.label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="w-[1px] h-6 bg-white/[0.06]" />}
                </div>
              ))}
              <button
                onClick={() => selectedNode?.isUnlocked && setShowAddContent(true)}
                disabled={!selectedNode?.isUnlocked}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.06] text-[#2dd4bf] text-[9px] font-black uppercase tracking-widest hover:bg-[#2dd4bf]/10 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={11} />
                Novo Conteúdo
              </button>
            </div>
          </div>
        </header>

        <div className="flex gap-8" style={{ minHeight: 'calc(100dvh - var(--navbar-height) - 120px)' }}>
          <LibrarySidebar
            nodes={mappedNodes}
            selectedNodeId={selectedNodeId || ''}
            onSelect={id => {
              setSelectedNodeId(id);
              setSearch('');
              setTypeFilter('all');
              loadNodeContents(id);
            }}
          />

          <main
            className="flex-1 min-w-0 border border-white/[0.04] bg-white/[0.01] flex flex-col relative rounded-sm shadow-2xl"
            style={{
              height: 'calc(100dvh - var(--navbar-height) - 120px)',
              position: 'sticky',
              top: 'calc(var(--navbar-height) + 24px)',
            }}
          >
            <div className="shrink-0 px-8 pt-8 pb-6 border-b border-white/[0.04] flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{selectedNode?.icon}</span>
                  <div>
                    <p className="text-white text-xl font-black tracking-wide">{selectedNode?.name}</p>
                    <p className="text-zinc-600 text-[9px] font-mono mt-0.5">
                      {currentContents.length} {currentContents.length === 1 ? 'item' : 'itens'} indexados
                    </p>
                  </div>
                </div>
                {selectedNode && !selectedNode.isUnlocked && (
                  <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest border border-white/[0.04] px-3 py-1">
                    🔒 Bloqueado
                  </span>
                )}
              </div>

              {selectedNode?.isUnlocked && (
                <LibraryFilters
                  search={search}
                  typeFilter={typeFilter}
                  onSearchChange={setSearch}
                  onTypeChange={setTypeFilter}
                />
              )}
            </div>

            <div
              className="flex-1 overflow-y-auto px-8 py-6"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(45,212,191,0.1) transparent' }}
            >
              <LibraryContentList
                contents={filteredContents}
                isLoading={isLoadingContents}
                isUnlocked={selectedNode?.isUnlocked ?? false}
                search={search}
                onDelete={handleDelete}
                onAdd={() => selectedNode?.isUnlocked && setShowAddContent(true)}
              />
            </div>
          </main>
        </div>
      </div>

      <AddContentModal
        isOpen={showAddContent}
        onClose={() => setShowAddContent(false)}
        onSuccess={async () => {
          if (selectedNodeId) {
            await Promise.all([
              refreshNodeContents(selectedNodeId),
              refreshNexus(),
            ]);
          }
        }}
        skillId={selectedNodeId || ''}
      />
    </div>
  );
}
