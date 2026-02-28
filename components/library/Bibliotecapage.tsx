'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { ContentType } from './types';
import { BibliotecaNodeHeader } from './features/viewer/BibliotecaNodeHeader';
import { BibliotecaFilters } from './features/viewer/BibliotecaFilters';
import { BibliotecaContentList } from './features/viewer/BibliotecaContentList';
import { AddContentModal } from './features/editor/AddContentModal';
import { useLibraryNodes } from './hooks/useLibraryNodes';
import { useNodeContents } from './hooks/useNodeContents';
import { BibliotecaSidebar } from './ui/BibliotecaSideBar';

export default function BibliotecaPage() {
  const searchParams = useSearchParams();
  const nodeIdFromUrl = searchParams.get('nodeId');

  const { nodes, isLoadingNodes, selectedNodeId, setSelectedNodeId, loadNodes } =
    useLibraryNodes(nodeIdFromUrl);
  const { nodeContents, loadingNodeId, loadNodeContents, refreshNodeContents } =
    useNodeContents();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all');
  const [showAddContent, setShowAddContent] = useState(false);

  useEffect(() => {
    loadNodes(firstNodeId => loadNodeContents(firstNodeId, {}));
  }, []);

  useEffect(() => {
    if (!nodeIdFromUrl || nodes.length === 0) return;
    const target = nodes.find(n => n.id === nodeIdFromUrl);
    if (!target) return;
    setSelectedNodeId(nodeIdFromUrl);
    loadNodeContents(nodeIdFromUrl, nodeContents);
  }, [nodeIdFromUrl, nodes]);

  const selectedNode = useMemo(
    () => nodes.find(n => n.id === selectedNodeId) ?? nodes[0],
    [nodes, selectedNodeId]
  );

  const currentContents = useMemo(
    () => nodeContents[selectedNodeId] ?? [],
    [nodeContents, selectedNodeId]
  );

  const filteredContents = useMemo(() => currentContents.filter(c => {
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  }), [currentContents, typeFilter, search]);

  const totalContents = useMemo(
    () => Object.values(nodeContents).reduce((acc, c) => acc + c.length, 0),
    [nodeContents]
  );

  const isLoadingContents = loadingNodeId === selectedNodeId;

  if (isLoadingNodes && nodes.length === 0) {
    return (
      <div className="relative min-h-[calc(100vh-160px)] w-full bg-[#030304] flex items-center justify-center">
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
    <div className="relative min-h-[calc(100vh-160px)] w-full bg-[#030304] flex flex-col overflow-hidden">

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#c8b89a06_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full p-6 flex flex-col gap-10 flex-1">

        <header className="space-y-2 pt-2">
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
                { label: 'Desbloqueados', value: nodes.filter(n => n.isUnlocked).length },
              ].map((s, i) => (
                <div key={i} className="text-right">
                  <p className="text-white text-2xl font-black font-mono leading-none">{s.value}</p>
                  <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="flex gap-8 flex-1 min-h-0">

          <BibliotecaSidebar
            nodes={nodes.map(n => ({ ...n, contents: nodeContents[n.id] ?? [] }))}
            selectedNodeId={selectedNodeId}
            onSelect={id => {
              setSelectedNodeId(id);
              setSearch('');
              setTypeFilter('all');
              loadNodeContents(id, nodeContents);
            }}
          />

          <main className="flex-1 min-w-0 flex flex-col gap-6">
            <BibliotecaNodeHeader
              node={selectedNode}
              contentsCount={currentContents.length}
              isLoading={isLoadingContents}
              onAddContent={() => setShowAddContent(true)}
            />

            {selectedNode.isUnlocked && currentContents.length > 0 && (
              <BibliotecaFilters
                search={search}
                typeFilter={typeFilter}
                onSearchChange={setSearch}
                onTypeChange={setTypeFilter}
              />
            )}

            <div
              className="flex-1 overflow-y-auto pb-20"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,184,154,0.1) transparent' }}
            >
              <BibliotecaContentList
                contents={filteredContents}
                isLoading={isLoadingContents}
                isUnlocked={selectedNode.isUnlocked}
                search={search}
              />
            </div>
          </main>
        </div>
      </div>

      <AddContentModal
        isOpen={showAddContent}
        onClose={() => setShowAddContent(false)}
        onSuccess={() => refreshNodeContents(selectedNodeId)}
        skillId={selectedNodeId}
      />
    </div>
  );
}