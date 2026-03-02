'use client';
import { useState, useMemo, useEffect } from 'react';
import { ReactFlow, ConnectionMode, type NodeTypes, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Loader2, AlertCircle } from 'lucide-react';

import { SkillNode as SkillNodeComponent, SvgDefs } from './ui/SkillNode';
import { SkillEdge } from './ui/SkillEdge';
import { SkillPanel } from './features/panel/SkillPanel';
import { StarField } from './ui/StarField';
import { EditSkillModal } from './features/editor/EditSkillModal';
import { NodeContextMenu } from './ui/NodeContextMenu';
import { TreeOnboarding } from './ui/TreeOnboarding';

import { useNexus } from '@/contexts/NexusContext';
import { useSkillTree, SkillTreeProvider } from '@/contexts/SkillTreeContext';
import { useSkillDrag } from './hooks/useSkillDrag';
import { useSkillActions } from './hooks/useSkillActions';

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
  const { refreshNexus, setIsDirty, isDirty } = useNexus();

  const { onNodesChange, hasUnsavedChanges: hasDragChanges, isSaving, setIsSaving, resetDirty } = useSkillDrag();
  const {
    handleToggleStatus,
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

  useEffect(() => {
    refreshNexus(true);
  }, [refreshNexus]);

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
      console.error('❌ [SkillTree] Erro crítico na sincronização:', error);
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

  const isPanelAvailable = useMemo(() => {
    if (!selectedNode) return false;
    const parentId = selectedNode.data.parentId;
    if (!parentId) return true;
    return !!nodes.find(n => n.id === parentId)?.data.isUnlocked;
  }, [selectedNode, nodes]);

  return (
    <div
      className="relative w-full bg-[#030304] overflow-hidden select-none font-sans"
      style={{ height: 'calc(100dvh - var(--navbar-height) - var(--footer-height))' }}
    >
      {isLoadingTree && nodes.length === 0 && (
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
      )}

      <SvgDefs />
      <StarField />

      {canSave && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 animate-in slide-in-from-bottom-5 duration-500">
          <div className="flex items-center gap-2 px-3 py-1 bg-black/80 border border-[#c8b89a]/20 backdrop-blur-md shadow-2xl">
            <AlertCircle size={10} className="text-[#c8b89a] animate-pulse" />
            <span className="text-[7px] text-[#c8b89a]/70 font-black uppercase tracking-[0.2em]">
              Protocolos pendentes de consolidação
            </span>
          </div>

          <button
            onClick={onSaveAll}
            disabled={isSaving}
            className={`flex items-center gap-3 px-8 py-4 border transition-all backdrop-blur-md shadow-2xl group
              ${isSaving
                ? 'border-[#c8b89a]/20 bg-[#030304]/60 text-[#c8b89a]/40 cursor-not-allowed'
                : 'border-[#c8b89a]/40 bg-[#030304]/90 text-[#c8b89a] hover:bg-[#c8b89a]/10 hover:border-[#c8b89a] active:scale-95 cursor-pointer'
              }`}
          >
            {isSaving
              ? <Loader2 size={14} className="animate-spin" />
              : <Save size={14} className="group-hover:scale-110 transition-transform" />
            }
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isSaving ? 'Consolidando...' : 'Consolidar Protocolos'}
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
        onToggleStatus={handleToggleStatus}
        isAvailable={isPanelAvailable}
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