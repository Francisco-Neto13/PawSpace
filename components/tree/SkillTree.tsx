'use client';
import { useState, useMemo, useEffect } from 'react';
import { ReactFlow, ConnectionMode, type NodeTypes, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Save } from 'lucide-react';

import { SkillNode, SvgDefs } from './parts/SkillNode';
import { SkillEdge } from './parts/SkillEdge';
import { SkillPanel } from './parts/SkillPanel';
import { StarField } from './parts/StarField';
import { AddSkillModal } from './parts/AddSkillModal';
import { NodeContextMenu } from './parts/NodeContextMenu';

import { SkillTreeProvider } from './context/SkillTreeContext';
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
    fitView({
      nodes: [rootNode],
      padding: 0.4,
      duration: 800,
      maxZoom: 1  
    });

      setHasCentered(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [isLoading, nodes, hasCentered]);

  return null;
}

function SkillTreeInner() {
  const { nodes, edges, isLoading } = useSkillNodes();
  const { onNodesChange, hasUnsavedChanges, isSaving, saveLayout } = useSkillDrag();
  const { handleToggleStatus, handleDelete, handleCreateSkill } = useSkillActions();

  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [modalParentId, setModalParentId] = useState<string | null | undefined>(undefined);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedSkillId), [nodes, selectedSkillId]);
  const panelData = useMemo(() => selectedNode ? { ...selectedNode.data, id: selectedNode.id } : null, [selectedNode]);
  const isPanelAvailable = useMemo(() => {
    if (!selectedNode) return false;
    const parentId = selectedNode.data.parentId;
    if (!parentId) return true;
    return !!nodes.find(n => n.id === parentId)?.data.isUnlocked;
  }, [selectedNode, nodes]);

  return (
    <div className="relative w-full bg-[#030304] overflow-hidden select-none font-sans"
      style={{ height: 'calc(100vh - 160px)' }}>

      {isLoading && nodes.length === 0 && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#030304]/80 backdrop-blur-md pointer-events-none">
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
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 pointer-events-none">
          <button onClick={() => setModalParentId(null)}
            className="pointer-events-auto flex items-center gap-3 px-8 py-4 border border-[#c8b89a]/30 bg-[#c8b89a]/5 text-[#c8b89a] hover:bg-[#c8b89a]/10 transition-all">
            <Plus size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Criar Raiz do Nexus</span>
          </button>
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => saveLayout(nodes)}
            disabled={isSaving}
            className="flex items-center gap-3 px-6 py-3 border border-[#c8b89a]/40 bg-[#030304]/90 text-[#c8b89a] hover:bg-[#c8b89a]/10 transition-all backdrop-blur-sm disabled:opacity-50"
          >
            <Save size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isSaving ? 'Salvando...' : 'Salvar Layout'}
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
          onNodeClick={(_, node) => { setContextMenu(null); setSelectedSkillId(node.id); }}
          onNodeContextMenu={(e, node) => {
            e.preventDefault();
            setSelectedSkillId(null);
            setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id, nodeName: node.data.label ?? node.data.name });
          }}
          onPaneClick={() => { setContextMenu(null); setSelectedSkillId(null); }}
          defaultEdgeOptions={defaultEdgeOptions}
          nodesDraggable panOnDrag zoomOnScroll
          minZoom={0.05} maxZoom={2}
          connectionMode={ConnectionMode.Loose}
          nodesConnectable={false}
          style={{ background: 'transparent' }}
        >
          <CenterOnRoot nodes={nodes} isLoading={isLoading} />
        </ReactFlow>
      </div>

      {contextMenu && (
        <NodeContextMenu {...contextMenu}
          onAddChild={() => { setModalParentId(contextMenu.nodeId); setContextMenu(null); }}
          onDelete={() => { handleDelete(contextMenu.nodeId); setContextMenu(null); }}
          onClose={() => setContextMenu(null)}
        />
      )}

      <SkillPanel data={panelData} onClose={() => setSelectedSkillId(null)}
        onToggleStatus={handleToggleStatus} isAvailable={isPanelAvailable} />

      <AddSkillModal isOpen={modalParentId !== undefined} onClose={() => setModalParentId(undefined)}
        onAdd={async (data) => { await handleCreateSkill(data); setModalParentId(undefined); }}
        existingSkills={nodes.map(n => ({ id: n.id, name: n.data.label ?? n.data.name }))}
        preselectedParentId={modalParentId} />

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
