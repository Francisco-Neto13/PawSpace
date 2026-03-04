'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';

import { ContentType, SkillNode } from './types';
import { BibliotecaContentList } from './features/viewer/BibliotecaContentList';
import { BibliotecaFilters } from './features/viewer/BibliotecaFilters';
import { AddContentModal } from './features/editor/AddContentModal';
import { BibliotecaSidebar } from './ui/BibliotecaSideBar';

import { useNexus } from '@/contexts/NexusContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { deleteContent } from '@/app/actions/library';

export default function BibliotecaPage() {
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
    color: n.data.color || '#c8b89a',
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
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#030304]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#c8b89a06_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
        </div>
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#c8b89a]/20 border-t-[#c8b89a] rounded-full animate-spin" />
          <p className="text-[#c8b89a] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
            Sincronizando Nexus...
          </p>
        </div>
      </div>
    );
  }

  if (!selectedNode) return null;

  return (
    <div
      className="relative min-h-screen w-full bg-[#030304]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#c8b89a06_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />

      <div className="relative z-10 w-full py-8 pb-20 space-y-6">

        <header>
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
                className="flex items-center gap-2 px-4 py-2.5 border border-[#c8b89a]/30 bg-[#c8b89a]/[0.06] text-[#c8b89a] text-[9px] font-black uppercase tracking-widest hover:bg-[#c8b89a]/10 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={11} />
                Nova Entrada
              </button>
            </div>
          </div>
        </header>

        <div className="flex gap-8" style={{ minHeight: 'calc(100dvh - var(--navbar-height) - 120px)' }}>
          <BibliotecaSidebar
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
                  <span className="text-xl">{selectedNode.icon}</span>
                  <div>
                    <p className="text-white text-xl font-black tracking-wide">{selectedNode.name}</p>
                    <p className="text-zinc-600 text-[9px] font-mono mt-0.5">
                      {currentContents.length} {currentContents.length === 1 ? 'item' : 'itens'} indexados
                    </p>
                  </div>
                </div>
                {!selectedNode.isUnlocked && (
                  <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest border border-white/[0.04] px-3 py-1">
                    🔒 Bloqueado
                  </span>
                )}
              </div>

              {selectedNode.isUnlocked && (
                <BibliotecaFilters
                  search={search}
                  typeFilter={typeFilter}
                  onSearchChange={setSearch}
                  onTypeChange={setTypeFilter}
                />
              )}
            </div>

            <div
              className="flex-1 overflow-y-auto px-8 py-6"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,184,154,0.1) transparent' }}
            >
              <BibliotecaContentList
                contents={filteredContents}
                isLoading={isLoadingContents}
                isUnlocked={selectedNode.isUnlocked}
                search={search}
                onDelete={handleDelete}
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