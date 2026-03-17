'use client';
import { useState, useMemo, useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { ReactFlow, ConnectionMode, type NodeTypes, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SkillNode as SkillNodeComponent, SvgDefs } from './ui/SkillNode';
import { SkillEdge, EdgeDefs } from './ui/SkillEdge';
import { EditSkillModal } from './features/editor/EditSkillModal';
import { NodeContextMenu } from './ui/NodeContextMenu';
import { RestoreViewportOnLoad, VIEWPORT_STORAGE_KEY } from './ui/RestoreViewportOnLoad';
import { SelectedNodeSummary } from './ui/SelectedNodeSummary';
import { TreeHeader } from './ui/TreeHeader';
import { TreeOnboarding } from './ui/TreeOnboarding';
import { TreeEmptyState } from './ui/TreeEmptyState';
import { TreeMiniMap } from './ui/TreeMiniMap';

import { usePawSpace, type SkillNode } from '@/contexts/PawSpaceContext';
import { useOverview } from '@/contexts/OverviewContext';
import { useSkillTree, SkillTreeProvider } from '@/contexts/SkillTreeContext';
import { useSkillDrag } from './hooks/useSkillDrag';
import { useSkillActions } from './hooks/useSkillActions';
import { PageBackground } from '../shared/PageBackground';
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
  style: { strokeWidth: 2 },
};

function SkillTreeInner() {
  const { theme } = useTheme();
  const { nodes, edges, isLoading: isLoadingTree } = useSkillTree();
  const { refreshPawSpace, setIsDirty, isDirty, setNodes, setEdges } = usePawSpace();
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
  const lastSavedViewportRef = useRef<{ x: number; y: number; zoom: number } | null>(null);
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
    refreshPawSpace(true);
  }, [refreshPawSpace]);

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
        await refreshPawSpace(false);
        invalidateOverview({ refetch: true });
      }
    } catch (error) {
      console.error('[Árvore] Erro crítico na sincronização:', error);
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

  const childCountByParent = useMemo(() => {
    const counts = new Map<string, number>();
    for (const node of nodes) {
      const parentId = node.data.parentId;
      if (!parentId) continue;
      counts.set(parentId, (counts.get(parentId) ?? 0) + 1);
    }
    return counts;
  }, [nodes]);

  const flowNodeCacheRef = useRef(
    new Map<
      string,
      {
        source: SkillNode;
        isChildOfSelected: boolean;
        hasChildren: boolean;
        flowNode: SkillNode;
      }
    >()
  );

  const flowNodes = useMemo(
    () => {
      const currentNodeIds = new Set(nodes.map((node) => node.id));
      const cache = flowNodeCacheRef.current;

      for (const cachedId of cache.keys()) {
        if (!currentNodeIds.has(cachedId)) {
          cache.delete(cachedId);
        }
      }

      return nodes.map((node) => {
        const isChildOfSelected = immediateChildIds.has(node.id);
        const hasChildren = (childCountByParent.get(node.id) ?? 0) > 0;
        const cached = cache.get(node.id);

        if (
          cached &&
          cached.source === node &&
          cached.isChildOfSelected === isChildOfSelected &&
          cached.hasChildren === hasChildren
        ) {
          return cached.flowNode;
        }

        const flowNode: SkillNode = {
          ...node,
          data: {
            ...node.data,
            isChildOfSelected,
            hasChildren,
          },
        };

        cache.set(node.id, {
          source: node,
          isChildOfSelected,
          hasChildren,
          flowNode,
        });

        return flowNode;
      });
    },
    [nodes, immediateChildIds, childCountByParent]
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

  const existingSkills = useMemo(
    () =>
      nodes.map((node) => ({
        id: node.id,
        name: node.data.label || node.data.name || '',
      })),
    [nodes]
  );

  if (isEmpty) {
    return <TreeEmptyState onCreate={handleCreateRoot} />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden select-none">
      <PageBackground src="/backgrounds/pages/cat2.webp" />

      {isLoadingTree && nodes.length === 0 && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--bg-base)]">
          <div className="relative flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[var(--border-visible)] border-t-[var(--text-primary)] rounded-full animate-spin" />
            <p className="button-label text-[var(--text-primary)] animate-pulse">
              Sincronizando PawSpace...
            </p>
          </div>
        </div>
      )}

      <SvgDefs />
      <EdgeDefs />

      <main className="relative z-10 py-8 pb-20">
        <div className="relative mx-auto max-w-6xl space-y-5 px-4 sm:px-6 xl:max-w-7xl xl:px-10 2xl:max-w-[1600px] 2xl:px-16">
          <TreeHeader
            nodesCount={nodes.length}
            rootNodesCount={rootNodesCount}
            nodesWithContentCount={nodesWithContentCount}
            selectedNode={selectedNode}
            canSave={canSave}
            isSaving={isSaving}
            onSaveAll={onSaveAll}
          />

          <section className="library-panel relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

            <div
              style={{
                width: '100%',
                height: 'clamp(520px, calc(100dvh - var(--navbar-height) - 184px), 920px)',
                opacity: isCanvasVisible ? 1 : 0,
                transition: 'opacity 250ms ease',
              }}
              className="relative p-2 sm:p-3 lg:p-4"
            >
              {selectedNode && (
                <SelectedNodeSummary
                  selectedNode={selectedNode}
                  childCount={immediateChildIds.size}
                  selectedContentsCount={selectedContentsCount}
                  selectedProgress={selectedProgress}
                />
              )}

              <TreeOnboarding
                className="absolute right-3 top-3 z-[60] sm:right-4 sm:top-4"
                direction="down"
                panelMaxHeight="min(60vh, 460px)"
              />

              <ReactFlow
                colorMode={isHydrated ? theme : 'dark'}
                nodes={flowNodes}
                edges={flowEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onlyRenderVisibleElements
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
                  const previous = lastSavedViewportRef.current;
                  if (
                    previous &&
                    previous.x === viewport.x &&
                    previous.y === viewport.y &&
                    previous.zoom === viewport.zoom
                  ) {
                    return;
                  }

                  lastSavedViewportRef.current = {
                    x: viewport.x,
                    y: viewport.y,
                    zoom: viewport.zoom,
                  };

                  try {
                    window.localStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify({
                      x: viewport.x,
                      y: viewport.y,
                      zoom: viewport.zoom,
                    }));
                  } catch {
                    // Se armazenamento falhar, apenas segue sem persistência.
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
        existingSkills={existingSkills}
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

