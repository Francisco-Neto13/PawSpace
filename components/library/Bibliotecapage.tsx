'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Tipos e UI
import { ContentType, SkillNode } from './types';
import { BibliotecaNodeHeader } from './features/viewer/BibliotecaNodeHeader';
import { BibliotecaFilters } from './features/viewer/BibliotecaFilters';
import { BibliotecaContentList } from './features/viewer/BibliotecaContentList';
import { AddContentModal } from './features/editor/AddContentModal';
import { BibliotecaSidebar } from './ui/BibliotecaSideBar';

// Hooks Globais e de Conteúdo
import { useNexus } from '@/contexts/NexusContext';
import { useNodeContents } from './hooks/useNodeContents';

export default function BibliotecaPage() {
  const searchParams = useSearchParams();
  const nodeIdFromUrl = searchParams.get('nodeId');

  // 1. Consome o estado global do Nexus
  const { nodes, isLoading: isLoadingNexus, refreshNexus } = useNexus();

  // 2. Hook de conteúdos
  const { nodeContents, loadingNodeId, loadNodeContents, refreshNodeContents } = useNodeContents();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all');
  const [showAddContent, setShowAddContent] = useState(false);

  // 3. Sincronização de seleção baseada no Contexto Global
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

  /**
   * CORREÇÃO DE TIPAGEM: 
   * Mapeamos os nodes do Nexus para o formato SkillNode esperado pelos subcomponentes,
   * extraindo os campos de dentro de 'data'.
   */
  const mappedNodes = useMemo(() => {
    return nodes.map(n => ({
      ...n,
      name: n.data.name || n.data.label || 'Sem Nome',
      icon: n.data.icon || '✦',
      color: n.data.color || '#c8b89a',
      isUnlocked: !!n.data.isUnlocked,
      contents: nodeContents[n.id] ?? []
    })) as SkillNode[];
  }, [nodes, nodeContents]);

  // 4. Preparação do nó selecionado para exibição usando o mapeamento corrigido
  const selectedNode = useMemo(() => {
    return mappedNodes.find(n => n.id === selectedNodeId) ?? mappedNodes[0];
  }, [mappedNodes, selectedNodeId]);

  // Filtros de conteúdo
  const currentContents = useMemo(
    () => (selectedNodeId ? nodeContents[selectedNodeId] : []) ?? [],
    [nodeContents, selectedNodeId]
  );

  const filteredContents = useMemo(() => currentContents.filter(c => {
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  }), [currentContents, typeFilter, search]);

  // Estatísticas rápidas
  const totalContents = useMemo(
    () => Object.values(nodeContents).reduce((acc, c) => acc + (c?.length || 0), 0),
    [nodeContents]
  );

  const isLoadingContents = loadingNodeId === selectedNodeId;

  // --- OVERLAY GLOBAL ---
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
      className="relative w-full bg-[#030304] flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 160px)' }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#c8b89a06_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full p-6 flex flex-col gap-10 flex-1 min-h-0">
        <header className="shrink-0">
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
                { label: 'Módulos',      value: nodes.length },
                { label: 'Conteúdos',     value: totalContents },
                { label: 'Desbloqueados', value: nodes.filter(n => n.data.isUnlocked).length },
              ].map((s, i) => (
                <div key={i} className="text-right">
                  <p className="text-white text-2xl font-black font-mono leading-none">{s.value}</p>
                  <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="flex gap-8 flex-1 min-h-0 overflow-hidden">
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

          <main className="flex-1 min-w-0 flex flex-col gap-6 overflow-hidden">
            <div className="shrink-0 flex flex-col gap-6">
              <BibliotecaNodeHeader
                node={selectedNode}
                contentsCount={currentContents.length}
                isLoading={isLoadingContents}
                onAddContent={() => setShowAddContent(true)}
              />

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
              className="flex-1 overflow-y-auto pb-20 pr-2 custom-scrollbar"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,184,154,0.1) transparent' }}
            >
              <BibliotecaContentList
                contents={filteredContents}
                isLoading={isLoadingContents}
                isUnlocked={selectedNode.isUnlocked}
                search={search}
                // @ts-ignore - Caso o componente espere 'node' em vez de apenas contents
                node={selectedNode}
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
              refreshNexus()
            ]);
          }
        }}
        skillId={selectedNodeId || ''}
      />
    </div>
  );
}