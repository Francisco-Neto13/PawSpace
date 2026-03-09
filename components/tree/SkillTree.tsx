'use client';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ReactFlow, ConnectionMode, type NodeTypes, useReactFlow, ReactFlowProvider, useNodesInitialized } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Loader2, AlertCircle } from 'lucide-react';

import { SkillNode as SkillNodeComponent, SvgDefs } from './ui/SkillNode';
import { SkillEdge } from './ui/SkillEdge';
import { SkillPanel } from './features/panel/SkillPanel';
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
import type { SkillData } from './types';
import { useTheme } from '@/shared/contexts/ThemeContext';

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

function CenterOnRoot({ nodes, isLoading }: { nodes: SkillNode[]; isLoading: boolean }) {
  const { fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (isLoading || nodes.length === 0 || hasCenteredRef.current || !nodesInitialized) return;
    const rootNode = nodes.find(n => !n.data.parentId);
    if (!rootNode) return;
    const raf = requestAnimationFrame(() => {
      fitView({ nodes: [rootNode], padding: 0.4, maxZoom: 1 });
      hasCenteredRef.current = true;
    });
    return () => cancelAnimationFrame(raf);
  }, [isLoading, nodes, nodesInitialized, fitView]);

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

  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [hasStructuralChanges, setHasStructuralChanges] = useState(false);
  const [isCanvasVisible, setIsCanvasVisible] = useState(false);

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

  const selectedNode = useMemo(() =>
    nodes.find(n => n.id === selectedSkillId),
    [nodes, selectedSkillId]
  );

  const panelData = useMemo(() => {
    if (!selectedNode) return null;
    return { ...selectedNode.data, id: selectedNode.id } as SkillData & { id: string };
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
          <div className="relative flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[var(--border-visible)] border-t-[var(--text-primary)] rounded-full animate-spin" />
            <p className="text-[var(--text-primary)] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
              Sincronizando Pawspace...
            </p>
          </div>
        </div>
      )}

      <SvgDefs />

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
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onNodeClick={(_, node) => {
            setContextMenu(null);
            setSelectedSkillId(node.id);
          }}
          onNodeContextMenu={(e, node) => {
            e.preventDefault();
            setSelectedSkillId(null);
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              nodeId: node.id,
              nodeName: node.data.label || node.data.name || '',
            });
          }}
          onPaneClick={() => {
            setContextMenu(null);
            setSelectedSkillId(null);
          }}
          defaultEdgeOptions={defaultEdgeOptions}
          nodesDraggable
          panOnDrag
          zoomOnScroll
          minZoom={0.05}
          maxZoom={2}
          connectionMode={ConnectionMode.Loose}
          nodesConnectable={false}
          style={{ background: 'transparent' }}
        >
          <CenterOnRoot nodes={nodes} isLoading={isLoadingTree && nodes.length === 0} />
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
            handleDelete(contextMenu.nodeId);
            setHasStructuralChanges(true);
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      <SkillPanel
        data={panelData}
        onClose={() => setSelectedSkillId(null)}
      />

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

