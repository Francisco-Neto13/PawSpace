'use client';
import { useState, useMemo, useEffect } from 'react';
import { ReactFlow, ConnectionMode, type NodeTypes, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Save, Loader2 } from 'lucide-react';

import { SkillNode, SvgDefs } from './ui/SkillNode';
import { SkillEdge } from './ui/SkillEdge';
import { SkillPanel } from './features/panel/SkillPanel';
import { StarField } from './ui/StarField';
import { EditSkillModal } from './features/editor/EditSkillModal';
import { NodeContextMenu } from './ui/NodeContextMenu';
import { TreeOnboarding } from './ui/TreeOnboarding';

import { SkillTreeProvider, useSkillTreeContext } from './context/SkillTreeContext';
import { useSkillNodes } from './hooks/useSkillNodes';
import { useSkillDrag } from './hooks/useSkillDrag';
import { useSkillActions } from './hooks/useSkillActions';

interface ContextMenu {
  x: number;
  y: number;
  nodeId: string;
  nodeName: string;
}

const nodeTypes: NodeTypes = { skill: SkillNode };
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

function SkillTreeInner({ initialSkills }: { initialSkills?: any[] }) {
  const { nodes, edges, isLoading, userId } = useSkillTreeContext();
  useSkillNodes(initialSkills);
  const { onNodesChange, hasUnsavedChanges: hasDragChanges, isSaving, saveLayout } = useSkillDrag();
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
  const [hasDataChanges, setHasDataChanges] = useState(false);

  const canSave = hasDragChanges || hasDataChanges;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (canSave || isSaving) {
        e.preventDefault();
        e.returnValue = 'Existem protocolos não sincronizados no Nexus.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [canSave, isSaving]);

  const onSaveAll = async () => {
    const success = await handleGlobalSave();
    if (success) {
      setHasDataChanges(false);
      saveLayout(nodes);
    }
  };

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedSkillId), [nodes, selectedSkillId]);
  const panelData = useMemo(() => selectedNode ? { ...selectedNode.data, id: selectedNode.id } : null, [selectedNode]);

  const isPanelAvailable = useMemo(() => {
    if (!selectedNode) return false;
    const parentId = selectedNode.data.parentId;
    if (!parentId) return true;
    return !!nodes.find(n => n.id === parentId)?.data.isUnlocked;
  }, [selectedNode, nodes]);

  return (
    <div
      className="relative w-full bg-[#030304] overflow-hidden select-none font-sans"
      style={{ height: 'calc(100vh - 160px)' }}
    >

      {isLoading && nodes.length === 0 && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#030304]/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#c8b89a]/20 border-t-[#c8b89a] rounded-full animate-spin" />
            <p className="text-[#c8b89a] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
              Sincronizando Nexus...
            </p>
          </div>
        </div>
      )}

      <SvgDefs />
      <StarField />

      {!isLoading && nodes.length === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6">
          <button
            onClick={() => handleCreateQuickSkill(null)}
            className="flex items-center gap-3 px-8 py-4 border border-[#c8b89a]/30 bg-[#c8b89a]/5 text-[#c8b89a] hover:bg-[#c8b89a]/10 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Iniciar Protocolo Primário</span>
          </button>
        </div>
      )}

      {canSave && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={onSaveAll}
            disabled={isSaving}
            className={`flex items-center gap-3 px-6 py-3 border transition-all backdrop-blur-sm shadow-2xl
              ${isSaving
                ? 'border-[#c8b89a]/20 bg-[#030304]/60 text-[#c8b89a]/40 cursor-not-allowed'
                : 'border-[#c8b89a]/40 bg-[#030304]/90 text-[#c8b89a] hover:bg-[#c8b89a]/10 active:scale-95 cursor-pointer'
              }`}
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isSaving ? 'Sincronizando...' : 'Salvar Alterações'}
            </span>
          </button>
        </div>
      )}

      <div style={{ width: '100%', height: '100%' }} className="relative">
        <ReactFlow
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
              nodeName: node.data.label ?? node.data.name,
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
          <CenterOnRoot nodes={nodes} isLoading={isLoading} />
        </ReactFlow>
      </div>

      {contextMenu && (
        <NodeContextMenu
          {...contextMenu}
          onAddChild={() => { handleCreateQuickSkill(contextMenu.nodeId); setContextMenu(null); }}
          onEdit={() => { setEditingSkillId(contextMenu.nodeId); setContextMenu(null); }}
          onDelete={() => { handleDelete(contextMenu.nodeId); setContextMenu(null); }}
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
          setHasDataChanges(true);
        }}
        skillData={nodes.find(n => n.id === editingSkillId)?.data}
        existingSkills={nodes.map(n => ({ id: n.id, name: n.data.label ?? n.data.name }))}
      />

      <TreeOnboarding />

    </div>
  );
}

export function SkillTree({ initialSkills }: { initialSkills?: any[] }) {
  return (
    <SkillTreeProvider>
      <ReactFlowProvider>
        <SkillTreeInner initialSkills={initialSkills} />
      </ReactFlowProvider>
    </SkillTreeProvider>
  );
}