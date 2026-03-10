'use client';
import { useState, useMemo, useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { ReactFlow, ConnectionMode, type NodeTypes, useReactFlow, ReactFlowProvider, useNodesInitialized } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Loader2, AlertCircle } from 'lucide-react';

import { SkillNode as SkillNodeComponent, SvgDefs } from './ui/SkillNode';
import { SkillEdge, EdgeDefs } from './ui/SkillEdge';
import { EditSkillModal } from './features/editor/EditSkillModal';
import { NodeContextMenu } from './ui/NodeContextMenu';
import { TreeOnboarding } from './ui/TreeOnboarding';
import { TreeEmptyState } from './ui/TreeEmptyState';
import { TreeMiniMap } from './ui/TreeMiniMap';

import { useNexus, type SkillNode } from '@/contexts/NexusContext';
import { useOverview } from '@/contexts/OverviewContext';
import { useSkillTree, SkillTreeProvider } from '@/contexts/SkillTreeContext';
import { useSkillDrag } from './hooks/useSkillDrag';
import { useSkillActions } from './hooks/useSkillActions';
import { PageBackground } from '../shared/PageBackground';
import { PawIcon } from '../shared/PawIcon';
import { useTheme } from '@/shared/contexts/ThemeContext';
import type { SkillData } from './types';

interface ContextMenu {
  x: number;
  y: number;
  nodeId: string;
  nodeName: string;
}

const nodeTypes: NodeTypes = { skill: SkillNodeComponent };
const edgeTypes = { skill: SkillEdge };
const defaultEdgeOptions = {
  type: 'skill',
  style: { strokeWidth: 2, transition: 'stroke 0.5s ease' },
};

const VIEWPORT_STORAGE_KEY = 'pawspace.tree.viewport.v1';

function RestoreViewportOnLoad({ nodes, isLoading }: { nodes: SkillNode[]; isLoading: boolean }) {
  const { fitView, setViewport } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    if (isLoading || nodes.length === 0 || hasRestoredRef.current || !nodesInitialized) return;

    try {
      const raw = window.localStorage.getItem(VIEWPORT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { x?: number; y?: number; zoom?: number };
        if (
          Number.isFinite(parsed.x) &&
          Number.isFinite(parsed.y) &&
          Number.isFinite(parsed.zoom)
        ) {
          setViewport({ x: parsed.x as number, y: parsed.y as number, zoom: parsed.zoom as number }, { duration: 0 });
          hasRestoredRef.current = true;
          return;
        }
      }
    } catch {
      // Ignora erro de leitura/parsing do estado salvo e segue com fallback.
    }

    const rootNode = nodes.find((n) => !n.data.parentId);
    if (!rootNode) {
      hasRestoredRef.current = true;
      return;
    }

    const raf = requestAnimationFrame(() => {
      fitView({ nodes: [rootNode], padding: 0.4, maxZoom: 1 });
      hasRestoredRef.current = true;
    });
    return () => cancelAnimationFrame(raf);
  }, [isLoading, nodes, nodesInitialized, fitView, setViewport]);

  return null;
}

function SkillTreeInner() {
  const { theme } = useTheme();
  const { nodes, edges, isLoading: isLoadingTree } = useSkillTree();
  const { refreshNexus, setIsDirty, isDirty, setNodes, setEdges } = useNexus();
  const { invalidateOverview } = useOverview();

  const { onNodesChange, hasUnsavedChanges: hasDragChanges, isSaving, setIsSaving, resetDirty } = useSkillDrag();
  const {
    handleDelete,
    handleCreateQuickSkill,
    handleUpdateSkill,
    handleGlobalSave,
  } = useSkillActions();

  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [hasStructuralChanges, setHasStructuralChanges] = useState(false);
  const [isCanvasVisible, setIsCanvasVisible] = useState(false);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const isContextMenuOpen = contextMenu !== null;

  const canSave = isDirty || hasDragChanges || hasStructuralChanges;
  const isEmpty = !isLoadingTree && nodes.length === 0;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsCanvasVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    refreshNexus(true);
  }, [refreshNexus]);

  useEffect(() => {
    return () => {
      setNodes(prev => prev.filter(n => !n.id.startsWith('temp-')));
      setEdges(prev => prev.filter(e =>
        !e.source.startsWith('temp-') && !e.target.startsWith('temp-')
      ));
      setIsDirty(false);
    };
  }, [setNodes, setEdges, setIsDirty]);

  useEffect(() => {
    if (hasStructuralChanges || hasDragChanges) {
      setIsDirty(true);
    }
  }, [hasStructuralChanges, hasDragChanges, setIsDirty]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (canSave) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [canSave]);

  const handleCreateRoot = useCallback(() => {
    handleCreateQuickSkill(null);
    setHasStructuralChanges(true);
  }, [handleCreateQuickSkill]);

  const onSaveAll = async () => {
    setIsSaving(true);
    try {
      const success = await handleGlobalSave();
      if (success) {
        resetDirty();
        setHasStructuralChanges(false);
        setIsDirty(false);
        await refreshNexus(false);
        invalidateOverview();
      }
    } catch (error) {
      console.error('[Árvore] Erro critico na sincronizacao:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedNode = useMemo(
    () => nodes.find((node) => node.selected) ?? null,
    [nodes]
  );

  const selectedNodeId = selectedNode?.id ?? null;

  const immediateChildIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    return new Set(
      nodes
        .filter((node) => node.data.parentId === selectedNodeId)
        .map((node) => node.id)
    );
  }, [nodes, selectedNodeId]);

  const flowNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isChildOfSelected: immediateChildIds.has(node.id),
        },
      })),
    [nodes, immediateChildIds]
  );

  const flowEdges = useMemo(() => {
    if (!selectedNodeId) {
      return edges.map((edge) => ({
        ...edge,
        data: {
          ...edge.data,
          isHighlighted: false,
          isDimmed: false,
        },
      }));
    }

    return edges.map((edge) => {
      const isHighlighted = edge.source === selectedNodeId || edge.target === selectedNodeId;
      return {
        ...edge,
        data: {
          ...edge.data,
          isHighlighted,
          isDimmed: !isHighlighted,
        },
      };
    });
  }, [edges, selectedNodeId]);

  const selectedContentsCount = useMemo(() => {
    if (!selectedNode) return 0;
    const linksCount = Array.isArray(selectedNode.data.links) ? selectedNode.data.links.length : 0;
    const contentsCount = Array.isArray(selectedNode.data.contents) ? selectedNode.data.contents.length : 0;
    return linksCount + contentsCount;
  }, [selectedNode]);

  const selectedProgress = useMemo(() => {
    if (!selectedNode || typeof selectedNode.data.progress !== 'number') return '0%';
    const raw = selectedNode.data.progress <= 1 ? selectedNode.data.progress * 100 : selectedNode.data.progress;
    const clamped = Math.max(0, Math.min(100, Math.round(raw)));
    return `${clamped}%`;
  }, [selectedNode]);

  const rootNodesCount = useMemo(
    () => nodes.filter((node) => !node.data.parentId).length,
    [nodes]
  );

  const nodesWithContentCount = useMemo(
    () =>
      nodes.filter((node) => {
        const linksCount = Array.isArray(node.data.links) ? node.data.links.length : 0;
        const contentsCount = Array.isArray(node.data.contents) ? node.data.contents.length : 0;
        return linksCount + contentsCount > 0;
      }).length,
    [nodes]
  );

  const editingSkillData = useMemo(() => {
    const node = nodes.find((n) => n.id === editingSkillId);
    if (!node) return null;
    return { ...node.data, id: node.id } as SkillData & { id: string };
  }, [nodes, editingSkillId]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden select-none">
      <PageBackground src="/cat2.webp" />

      {isLoadingTree && nodes.length === 0 && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--bg-base)]">
          <div className="relative flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[var(--border-visible)] border-t-[var(--text-primary)] rounded-full animate-spin" />
            <p className="text-[var(--text-primary)] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
              Sincronizando Pawspace...
            </p>
          </div>
        </div>
      )}

      <SvgDefs />
      <EdgeDefs />

      <main className="relative z-10 py-8 pb-20">
        <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 2xl:px-16 space-y-5">
          <div className="flex items-center gap-3 reveal-fade delay-0">
            <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
            <span className="text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.4em]">
              Pawspace / Arvore
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--shimmer-via)] to-transparent" />
          </div>

          <section className="library-panel library-panel-hover p-6 relative overflow-hidden reveal-up delay-100">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className="library-kicker mb-2">Nucleo Estrutural</p>
                <h1 className="overview-title text-2xl md:text-3xl mb-2">Arvore de Habilidades</h1>
                <p className="library-subtitle max-w-2xl">
                  Organize seus modulos por dependencia, ajuste a hierarquia no canvas e mantenha a base de conhecimento sincronizada.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="library-chip">Modulos: {nodes.length}</span>
                  <span className="library-chip">Raizes: {rootNodesCount}</span>
                  <span className="library-chip">Com Conteudo: {nodesWithContentCount}</span>
                  <span className="library-chip">
                    Selecionado: {selectedNode?.data.label || selectedNode?.data.name || 'Nenhum'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-2 w-full sm:w-auto sm:min-w-[230px]">
                <div className="h-8 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center gap-2">
                  <AlertCircle size={11} className={canSave ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'} />
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    {canSave ? 'Alteracoes Pendentes' : 'Arvore Sincronizada'}
                  </span>
                </div>

                <button
                  onClick={onSaveAll}
                  disabled={isSaving || !canSave}
                  className={`h-10 shrink-0 flex items-center justify-center gap-2 px-4 border border-[var(--border-visible)] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-[0.98]
                    ${
                      isSaving || !canSave
                        ? 'bg-[var(--bg-surface)] text-[var(--text-faint)] cursor-not-allowed'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-input)] cursor-pointer'
                    }`}
                >
                  {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  {isSaving ? 'Salvando...' : 'Salvar Alteracoes'}
                </button>
              </div>
            </div>
          </section>

          <section className="library-panel relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

            <div
              style={{
                width: '100%',
                height: 'calc(100dvh - var(--navbar-height) - 200px)',
                minHeight: '620px',
                opacity: isCanvasVisible ? 1 : 0,
                transition: 'opacity 250ms ease',
              }}
              className="relative"
            >
              {isEmpty && (
                <TreeEmptyState onCreate={handleCreateRoot} />
              )}

              {selectedNode && (
                <div className="absolute left-3 bottom-3 z-40 w-[296px] max-w-[calc(100%-0.75rem)] pointer-events-none animate-in fade-in zoom-in-95 duration-200 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

                  <div className="relative z-10 p-3">
                    <p className="text-[7px] text-[var(--text-secondary)] uppercase tracking-[0.2em] font-black mb-1.5">Modulo Selecionado</p>
                    <h3 className="text-[11px] text-[var(--text-primary)] font-black uppercase tracking-[0.16em] leading-snug mb-2 truncate">
                      {selectedNode.data.label || selectedNode.data.name || 'Sem nome'}
                    </h3>
                    <div className="h-px bg-[var(--border-subtle)] mb-2" />
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="relative rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
                        <p className="text-[7px] uppercase tracking-[0.14em] text-[var(--text-muted)] font-black mb-1">Filhos</p>
                        <p className="text-[12px] leading-none text-[var(--text-primary)] font-black font-mono tabular-nums">{immediateChildIds.size}</p>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[var(--border-muted)]" />
                      </div>
                      <div className="relative rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
                        <p className="text-[7px] uppercase tracking-[0.14em] text-[var(--text-muted)] font-black mb-1">Conteudos</p>
                        <p className="text-[12px] leading-none text-[var(--text-primary)] font-black font-mono tabular-nums">{selectedContentsCount}</p>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[var(--border-muted)]" />
                      </div>
                      <div className="relative rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
                        <p className="text-[7px] uppercase tracking-[0.14em] text-[var(--text-muted)] font-black mb-1">Progresso</p>
                        <p className="text-[12px] leading-none text-[var(--text-primary)] font-black font-mono tabular-nums">{selectedProgress}</p>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[var(--border-muted)]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <TreeOnboarding
                className="absolute top-4 right-4 z-[60]"
                direction="down"
                panelMaxHeight="min(60vh, 460px)"
              />

              <ReactFlow
                colorMode={isHydrated ? theme : 'dark'}
                nodes={flowNodes}
                edges={flowEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onNodeClick={() => {
                  setContextMenu(null);
                  setEditingSkillId(null);
                }}
                onNodeContextMenu={(e, node) => {
                  e.preventDefault();
                  setEditingSkillId(null);
                  const target = e.currentTarget as HTMLElement | null;
                  const menuWidth = 220;
                  const margin = 12;
                  let x = e.clientX;
                  let y = e.clientY;

                  if (target) {
                    const rect = target.getBoundingClientRect();
                    x = rect.left + rect.width / 2 - menuWidth / 2;
                    y = rect.bottom + 8;
                  }

                  const maxX = window.innerWidth - menuWidth - margin;
                  const clampedX = Math.max(margin, Math.min(x, maxX));
                  const maxY = window.innerHeight - margin;
                  const clampedY = Math.max(margin, Math.min(y, maxY));

                  setContextMenu({
                    x: clampedX,
                    y: clampedY,
                    nodeId: node.id,
                    nodeName: node.data.label || node.data.name || '',
                  });
                }}
                onPaneClick={() => {
                  setContextMenu(null);
                  setEditingSkillId(null);
                }}
                defaultEdgeOptions={defaultEdgeOptions}
                nodesDraggable={!isContextMenuOpen}
                panOnDrag={!isContextMenuOpen}
                zoomOnScroll={!isContextMenuOpen}
                zoomOnPinch={!isContextMenuOpen}
                zoomOnDoubleClick={!isContextMenuOpen}
                minZoom={0.05}
                maxZoom={2}
                connectionMode={ConnectionMode.Loose}
                nodesConnectable={false}
                onMoveEnd={(_, viewport) => {
                  if (!viewport) return;
                  try {
                    window.localStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify({
                      x: viewport.x,
                      y: viewport.y,
                      zoom: viewport.zoom,
                    }));
                  } catch {
                    // Se armazenamento falhar, apenas segue sem persistencia.
                  }
                }}
                style={{ background: 'transparent' }}
              >
                <RestoreViewportOnLoad nodes={nodes} isLoading={isLoadingTree && nodes.length === 0} />
                <TreeMiniMap selectedNodeId={selectedNodeId} />
              </ReactFlow>
            </div>
          </section>
        </div>
      </main>

      {contextMenu && (
        <NodeContextMenu
          {...contextMenu}
          onAddChild={() => {
            handleCreateQuickSkill(contextMenu.nodeId);
            setHasStructuralChanges(true);
            setContextMenu(null);
          }}
          onEdit={() => { setEditingSkillId(contextMenu.nodeId); setContextMenu(null); }}
          onDelete={() => {
            const nodeId = contextMenu.nodeId;
            setContextMenu(null);
            void (async () => {
              const didDelete = await handleDelete(nodeId);
              if (didDelete) {
                setHasStructuralChanges(true);
              }
            })();
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      <EditSkillModal
        isOpen={editingSkillId !== null}
        onClose={() => setEditingSkillId(null)}
        onUpdate={async (id, data) => {
          await handleUpdateSkill(id, data);
        }}
        skillData={editingSkillData}
        existingSkills={nodes.map(n => ({
          id: n.id,
          name: n.data.label || n.data.name || '',
        }))}
      />
    </div>
  );
}

export function SkillTree() {
  return (
    <SkillTreeProvider>
      <ReactFlowProvider>
        <SkillTreeInner />
      </ReactFlowProvider>
    </SkillTreeProvider>
  );
}

