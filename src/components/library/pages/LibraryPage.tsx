'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { PawIcon } from '@/components/shared/PawIcon';
import { PageBackground } from '@/components/shared/PageBackground';

import { ContentType, SkillNode } from '../types';
import { LibraryContentList } from '../features/viewer/LibraryContentList';
import { LibraryFilters } from '../features/viewer/LibraryFilters';
import { LibraryNodeHeader } from '../features/viewer/LibraryNodeHeader';
import { AddContentModal } from '../features/editor/AddContentModal';
import { LibrarySidebar } from '../ui/LibrarySideBar';

import { usePawSpace } from '@/contexts/PawSpaceContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { useOverview } from '@/contexts/OverviewContext';
import { deleteContent } from '@/app/actions/library';
import { WorkspaceEmptyState } from '@/components/shared/WorkspaceEmptyState';

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const nodeIdFromUrl = searchParams.get('nodeId');

  const { nodes, isLoading: isLoadingPawSpace, refreshGlobalStats } = usePawSpace();
  const { invalidateOverview } = useOverview();
  const {
    nodeContents,
    loadingNodeId,
    loadNodeContents,
    refreshNodeContents,
    preloadAllContents,
    addNodeContent,
    removeNodeContent,
  } = useLibrary();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showAddContent, setShowAddContent] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all');
  const optimisticNodeByTempIdRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const isEmptyLibrary = !isLoadingPawSpace && nodes.length === 0;
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
  }, [isLoadingPawSpace, nodes.length]);

  const resolvedSelectedNodeId = useMemo(() => {
    if (isLoadingPawSpace || nodes.length === 0) return null;

    if (selectedNodeId && nodes.some((node) => node.id === selectedNodeId)) {
      return selectedNodeId;
    }

    if (nodeIdFromUrl && nodes.some((node) => node.id === nodeIdFromUrl)) {
      return nodeIdFromUrl;
    }

    return nodes[0]?.id ?? null;
  }, [isLoadingPawSpace, nodes, nodeIdFromUrl, selectedNodeId]);

  useEffect(() => {
    if (!resolvedSelectedNodeId) return;
    void loadNodeContents(resolvedSelectedNodeId);
  }, [resolvedSelectedNodeId, loadNodeContents]);

  useEffect(() => {
    if (!resolvedSelectedNodeId) return;
    const idleWindow = window as Window & typeof globalThis & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const idleId = idleWindow.requestIdleCallback(() => {
        void preloadAllContents();
      }, { timeout: 2400 });

      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timer = window.setTimeout(() => {
      void preloadAllContents();
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [resolvedSelectedNodeId, preloadAllContents]);

  const mappedNodes = useMemo(() => nodes.map(n => ({
    ...n,
    name: n.data.name || n.data.label || 'Sem Nome',
    icon: n.data.icon || '*',
    color: n.data.color || '#71717a',
    contents: nodeContents[n.id] ?? [],
  })) as SkillNode[], [nodes, nodeContents]);

  const selectedNode = useMemo(() =>
    mappedNodes.find(n => n.id === resolvedSelectedNodeId) ?? mappedNodes[0],
  [mappedNodes, resolvedSelectedNodeId]);

  const currentContents = useMemo(
    () => (resolvedSelectedNodeId ? nodeContents[resolvedSelectedNodeId] : []) ?? [],
    [nodeContents, resolvedSelectedNodeId]
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

  const isLoadingContents = loadingNodeId === resolvedSelectedNodeId;

  const handleDelete = async (id: string) => {
    if (!resolvedSelectedNodeId) return;
    const current = nodeContents[resolvedSelectedNodeId] ?? [];
    const removed = current.find((content) => content.id === id);

    removeNodeContent(resolvedSelectedNodeId, id);
    const result = await deleteContent(id);
    if (result.success) {
      invalidateOverview({ refetch: true });
      void refreshGlobalStats();
      return;
    }

    if (removed) {
      addNodeContent(resolvedSelectedNodeId, removed);
      return;
    }
    void refreshNodeContents(resolvedSelectedNodeId);
  };

  if (isLoadingPawSpace && nodes.length === 0) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--bg-base)]">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[var(--border-visible)] border-t-[var(--text-primary)] rounded-full animate-spin" />
          <p className="button-label text-[var(--text-primary)] animate-pulse">
            Sincronizando PawSpace...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoadingPawSpace && nodes.length === 0) {
    return (
      <WorkspaceEmptyState
        title="Estante vazia"
        description="Crie sua árvore para começar a guardar materiais por módulo."
        actionLabel="Ir para a árvore"
        actionHref="/tree"
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <PageBackground src="/cat3.webp" />

      <div className="relative z-10 py-8 pb-20">
        <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 2xl:px-16 space-y-5">
          <div className="flex items-center gap-3 reveal-fade delay-0">
            <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
            <span className="app-breadcrumb">
              PawSpace / Estante
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--shimmer-via)] to-transparent" />
          </div>

          <section className="library-panel library-panel-hover p-6 relative overflow-hidden reveal-up delay-100">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className="library-kicker mb-2">Estante da Patinha</p>
                <h1 className="page-display max-w-4xl mb-3">Estante do PawSpace</h1>
                <p className="page-summary">
                  Guarde links, vídeos, PDFs e notas por trilha. Escolha um caminho na lateral e mantenha cada material no lugar certo.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="library-chip">Trilhas: {nodes.length}</span>
                  <span className="library-chip">Materiais: {totalContents}</span>
                  <span className="library-chip">
                    Selecionado: {selectedNode?.name ?? 'Nenhum'}
                  </span>
                </div>
              </div>

            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-4 items-start">
            <div className="reveal-up delay-200">
              <LibrarySidebar
                nodes={mappedNodes}
                selectedNodeId={resolvedSelectedNodeId || ''}
                onSelect={(id) => {
                  setSelectedNodeId(id);
                  setSearch('');
                  setTypeFilter('all');
                  void loadNodeContents(id);
                }}
              />
            </div>

            <main
              className="library-panel relative overflow-hidden flex flex-col min-h-[calc(100dvh-var(--navbar-height)-140px)] reveal-up delay-300"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
              <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-[var(--text-primary)] opacity-[0.04] pointer-events-none" />

              <div className="shrink-0 px-5 md:px-7 pt-5 md:pt-6 pb-5 border-b border-[var(--border-subtle)] flex flex-col gap-4">
                {selectedNode && (
                  <LibraryNodeHeader
                    node={selectedNode}
                    contentsCount={currentContents.length}
                    isLoading={isLoadingContents}
                    onAddContent={() => setShowAddContent(true)}
                  />
                )}
                <LibraryFilters
                  search={search}
                  typeFilter={typeFilter}
                  onSearchChange={setSearch}
                  onTypeChange={setTypeFilter}
                />
              </div>

              <div className="flex-1 min-h-0 px-5 md:px-7 py-5 overview-scroll-area">
                <LibraryContentList
                  contents={filteredContents}
                  isLoading={isLoadingContents}
                  onDelete={handleDelete}
                  onAdd={() => setShowAddContent(true)}
                />
              </div>
            </main>
          </div>
        </div>
      </div>

      <AddContentModal
        isOpen={showAddContent}
        onClose={() => setShowAddContent(false)}
        onOptimisticCreate={(tempContent) => {
          const row = tempContent as { id?: string; skillId?: string };
          if (!row.id || !row.skillId) return;
          optimisticNodeByTempIdRef.current[row.id] = row.skillId;
          addNodeContent(row.skillId, tempContent);
        }}
        onOptimisticResolve={(tempId, createdContent) => {
          const nodeId =
            optimisticNodeByTempIdRef.current[tempId] ||
            (createdContent as { skillId?: string } | undefined)?.skillId;
          if (!nodeId) return;
          removeNodeContent(nodeId, tempId);
          delete optimisticNodeByTempIdRef.current[tempId];
          if (createdContent) {
            addNodeContent(nodeId, createdContent);
          }
          invalidateOverview({ refetch: true });
          void refreshGlobalStats();
        }}
        onOptimisticRollback={(tempId) => {
          const nodeId = optimisticNodeByTempIdRef.current[tempId];
          if (!nodeId) return;
          removeNodeContent(nodeId, tempId);
          delete optimisticNodeByTempIdRef.current[tempId];
        }}
        onSuccess={(createdContent) => {
          if (resolvedSelectedNodeId) {
            if (createdContent) {
              addNodeContent(resolvedSelectedNodeId, createdContent);
              invalidateOverview({ refetch: true });
              void refreshGlobalStats();
            }
          }
        }}
        skillId={resolvedSelectedNodeId || ''}
      />
    </div>
  );
}
