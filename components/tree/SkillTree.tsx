'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ReactFlow, ConnectionMode, type NodeTypes, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Loader2, AlertCircle } from 'lucide-react';

import { SkillNode as SkillNodeComponent, SvgDefs } from './ui/SkillNode';
import { SkillEdge } from './ui/SkillEdge';
import { SkillPanel } from './features/panel/SkillPanel';
import { EditSkillModal } from './features/editor/EditSkillModal';
import { NodeContextMenu } from './ui/NodeContextMenu';
import { TreeOnboarding } from './ui/TreeOnboarding';
import { TreeEmptyState } from './ui/TreeEmptyState';

import { useNexus } from '@/contexts/NexusContext';
import { useSkillTree, SkillTreeProvider } from '@/contexts/SkillTreeContext';
import { useSkillDrag } from './hooks/useSkillDrag';
import { useSkillActions } from './hooks/useSkillActions';
import { PageBackground } from '../shared/PageBackground';

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

function CenterOnRoot({ nodes, isLoading }: { nodes: any[]; isLoading: boolean }) {
  const { fitView } = useReactFlow();
  const [hasCentered, setHasCentered] = useState(false);

  useEffect(() => {
    if (isLoading || nodes.length === 0 || hasCentered) return;
    const rootNode = nodes.find(n => !n.data.parentId);
    if (!rootNode) return;
    const timer = setTimeout(() => {
      fitView({ nodes: [rootNode], padding: 0.4, duration: 800, maxZoom: 1 });
      setHasCentered(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [isLoading, nodes, hasCentered, fitView]);

  return null;
}

function SkillTreeInner() {
  const { nodes, edges, isLoading: isLoadingTree } = useSkillTree();
  const { refreshNexus, setIsDirty, isDirty, setNodes, setEdges } = useNexus();

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

  const canSave = isDirty || hasDragChanges || hasStructuralChanges;
  const isEmpty = !isLoadingTree && nodes.length === 0;

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
    return { ...selectedNode.data, id: selectedNode.id } as any;
  }, [selectedNode]);

  return (
    <div
      className="relative w-full bg-[#0a0a0a] overflow-hidden select-none font-sans"
      style={{ height: 'calc(100dvh - var(--navbar-height) - var(--footer-height))' }}
    >
      <PageBackground src="/cat2.webp" />

      {isLoadingTree && nodes.length === 0 && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#0a0a0a]">
          <div className="relative flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#ffffff]/20 border-t-[#ffffff] rounded-full animate-spin" />
            <p className="text-[#ffffff] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
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
          <div className="flex items-center gap-2 px-3 py-1 bg-black/80 border border-[#ffffff]/20 backdrop-blur-md shadow-2xl">
            <AlertCircle size={10} className="text-[#ffffff] animate-pulse" />
            <span className="text-[7px] text-[#ffffff]/70 font-black uppercase tracking-[0.2em]">
              Alterações Pendentes
            </span>
          </div>

          <button
            onClick={onSaveAll}
            disabled={isSaving}
            className={`flex items-center gap-3 px-8 py-4 border transition-all backdrop-blur-md shadow-2xl group
              ${isSaving
                ? 'border-[#ffffff]/20 bg-[#0a0a0a]/60 text-[#ffffff]/40 cursor-not-allowed'
                : 'border-[#ffffff]/40 bg-[#0a0a0a]/90 text-[#ffffff] hover:bg-[#ffffff]/10 hover:border-[#ffffff] active:scale-95 cursor-pointer'
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

      <div style={{ width: '100%', height: '100%' }} className="relative">
        <ReactFlow
          nodes={nodes as any}
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
              nodeName: (node.data as any).label || (node.data as any).name || '',
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
        skillData={nodes.find(n => n.id === editingSkillId)?.data as any}
        existingSkills={nodes.map(n => ({
          id: n.id,
          name: (n.data as any).label || (n.data as any).name || '',
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

