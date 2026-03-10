'use client';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ReactFlow, ConnectionMode, type NodeTypes, useReactFlow, ReactFlowProvider, useNodesInitialized } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Loader2, AlertCircle } from 'lucide-react';

import { SkillNode as SkillNodeComponent, SvgDefs } from './ui/SkillNode';
import { SkillEdge, EdgeDefs } from './ui/SkillEdge';
import { EditSkillModal } from './features/editor/EditSkillModal';
import { NodeContextMenu } from './ui/NodeContextMenu';
import { TreeOnboarding } from './ui/TreeOnboarding';
import { TreeEmptyState } from './ui/TreeEmptyState';

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

  const editingSkillData = useMemo(() => {
    const node = nodes.find((n) => n.id === editingSkillId);
    if (!node) return null;
    return { ...node.data, id: node.id } as SkillData & { id: string };
  }, [nodes, editingSkillId]);

  return (
    <div
      className="relative w-full bg-[var(--bg-base)] overflow-hidden select-none font-sans"
      style={{ height: 'calc(100dvh - var(--navbar-height) - var(--footer-height))' }}
    >
      <PageBackground src="/cat2.webp" />

      <div className="absolute top-8 left-0 right-0 z-30 pointer-events-none reveal-fade delay-0">
        <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 2xl:px-16">
          <div className="flex items-center gap-3">
            <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
            <span className="text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.4em]">
              Pawspace / Arvore
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border-subtle)] to-transparent" />
          </div>
        </div>
      </div>

      {isLoadingTree && nodes.length === 0 && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--bg-base)]">
          <div className="theme-grid-overlay absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
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

      {isEmpty && (
        <TreeEmptyState onCreate={handleCreateRoot} />
      )}

      {canSave && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 animate-in slide-in-from-bottom-5 duration-500">
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-strong)] border border-[var(--border-visible)] backdrop-blur-md shadow-2xl">
            <AlertCircle size={10} className="text-[var(--text-primary)] animate-pulse" />
            <span className="text-[7px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em]">
              Alterações Pendentes
            </span>
          </div>

          <button
            onClick={onSaveAll}
            disabled={isSaving}
            className={`flex items-center gap-3 px-8 py-4 border transition-all backdrop-blur-md shadow-2xl group
              ${isSaving
                ? 'border-[var(--border-visible)] bg-[var(--bg-surface)] text-[var(--text-faint)] cursor-not-allowed'
                : 'border-[var(--border-visible)] bg-[var(--bg-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--text-primary)] active:scale-95 cursor-pointer'
              }`}
          >
            {isSaving
              ? <Loader2 size={14} className="animate-spin" />
              : <Save size={14} className="group-hover:scale-110 transition-transform" />
            }
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </span>
          </button>
        </div>
      )}

      {selectedNode && (
        <div className="absolute left-6 bottom-8 z-40 w-[320px] pointer-events-none animate-in fade-in zoom-in-95 duration-200 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

          <div className="relative z-10 p-4">
            <p className="text-[8px] text-[var(--text-secondary)] uppercase tracking-[0.22em] font-black mb-2">
              Modulo Selecionado
            </p>
            <h3 className="text-[12px] text-[var(--text-primary)] font-black uppercase tracking-[0.18em] leading-snug mb-3">
              {selectedNode.data.label || selectedNode.data.name || 'Sem nome'}
            </h3>
            <div className="h-px bg-[var(--border-subtle)] mb-3" />
            <div className="grid grid-cols-3 gap-2">
              <div className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
                <p className="text-[8px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-black mb-1">Filhos</p>
                <p className="text-[14px] leading-none text-[var(--text-primary)] font-black font-mono tabular-nums">{immediateChildIds.size}</p>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[var(--border-muted)]" />
              </div>
              <div className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
                <p className="text-[8px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-black mb-1">Conteudos</p>
                <p className="text-[14px] leading-none text-[var(--text-primary)] font-black font-mono tabular-nums">{selectedContentsCount}</p>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[var(--border-muted)]" />
              </div>
              <div className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
                <p className="text-[8px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-black mb-1">Progresso</p>
                <p className="text-[14px] leading-none text-[var(--text-primary)] font-black font-mono tabular-nums">{selectedProgress}</p>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[var(--border-muted)]" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          width: '100%',
          height: '100%',
          opacity: isCanvasVisible ? 1 : 0,
          transition: 'opacity 250ms ease',
        }}
        className="relative"
      >
        <ReactFlow
          colorMode={theme}
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
        </ReactFlow>
      </div>

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

      <TreeOnboarding />
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

