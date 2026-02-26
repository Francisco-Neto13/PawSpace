'use client';
import React, { useState, useCallback, useMemo, useEffect, useTransition } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  ConnectionMode,
  type Node,
  type Edge,
  type NodeTypes,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus } from 'lucide-react';

import { SkillData } from './types';
import { SkillNode, SvgDefs } from './SkillNode';
import { SkillEdge } from './SkillEdge';
import { SkillPanel } from './SkillPanel';
import { StarField } from './StarField';
import { AddSkillModal } from './AddSkillModal';
import { NodeContextMenu } from './NodeContextMenu';

import {
  generateTreeLayout,
  calculateRecursiveProgress,
  calculateGlobalProgress,
  buildHierarchy,
} from '@/utils/treeUtils';

import { createClient } from '@/utils/supabase/client';
import { getSkills, addSkill, toggleSkillStatus, updateSkillPosition, deleteSkill } from '@/app/actions/skills';

const nodeTypes: NodeTypes = { skill: SkillNode };
const edgeTypes = { skill: SkillEdge };
const defaultEdgeOptions = {
  type: 'skill',
  style: { strokeWidth: 2, transition: 'stroke 0.5s ease' },
};

interface ContextMenu {
  x: number;
  y: number;
  nodeId: string;
  nodeName: string;
}

export function SkillTree() {
  const [nodes, setNodes] = useState<Node<SkillData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [modalParentId, setModalParentId] = useState<string | null | undefined>(undefined);

  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  const [, startTransition] = useTransition();
  const supabase = useMemo(() => createClient(), []);


  const loadTreeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const rawSkills = await getSkills(user.id);

      if (rawSkills.length > 0) {
        const hierarchy = buildHierarchy(rawSkills);
        const { nodes: layoutNodes, edges: layoutEdges } = generateTreeLayout(hierarchy);
        const nodesWithProgress = calculateRecursiveProgress(layoutNodes, layoutEdges);
        setNodes(nodesWithProgress);
        setEdges(layoutEdges);
      } else {
        setNodes([]);
        setEdges([]);
      }
    } catch (error) {
      console.error('Erro ao carregar árvore:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => { loadTreeData(); }, [loadTreeData]);


  useEffect(() => {
    if (nodes.length === 0) return;
    window.dispatchEvent(
      new CustomEvent('skill-progress-update', { detail: calculateGlobalProgress(nodes) })
    );
  }, [nodes]);


  const onNodesChange: OnNodesChange<Node<SkillData>> = useCallback((changes) => {
    setNodes(nds => applyNodeChanges(changes, nds));

    const positionChanges = changes.filter(
      c => c.type === 'position' && c.dragging === false && c.position
    );
    if (positionChanges.length > 0) {
      startTransition(() => {
        positionChanges.forEach(c => {
          if (c.type === 'position' && c.position) {
            updateSkillPosition(c.id, c.position.x, c.position.y);
          }
        });
      });
    }
  }, [startTransition]);


  const handleToggleStatus = useCallback((nodeId: string) => {
    let nextUnlocked = false;

    setNodes(prev => {
      const target = prev.find(n => n.id === nodeId);
      if (!target) return prev;

      const currentlyUnlocked = target.data.isUnlocked;

      if (currentlyUnlocked) {
        const childIds = edges.filter(e => e.source === nodeId).map(e => e.target);
        if (prev.some(n => childIds.includes(n.id) && n.data.isUnlocked)) {
          alert('ACCESS DENIED: Active dependencies detected.');
          return prev;
        }
      }

      nextUnlocked = !currentlyUnlocked;

      const nextNodes = prev.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, isUnlocked: nextUnlocked } }
          : node
      );
      const finalNodes = calculateRecursiveProgress(nextNodes, edges);

      setEdges(prevEdges => prevEdges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          unlocked: !!finalNodes.find(n => n.id === edge.target)?.data.isUnlocked,
        },
      })));

      return finalNodes;
    });

    startTransition(() => {
      toggleSkillStatus(nodeId, nextUnlocked).then(result => {
        if (!result.success) {
          console.error('Falha ao persistir toggle — revertendo do banco');
          loadTreeData();
        }
      });
    });
  }, [edges, loadTreeData, startTransition]);


  const handleDelete = useCallback((nodeId: string) => {
    if (!confirm('Deletar este nó e todos os seus filhos?')) return;
    startTransition(() => {
      deleteSkill(nodeId).then(() => loadTreeData());
    });
  }, [loadTreeData, startTransition]);


  const handleCreateSkill = async (data: {
    name: string;
    description?: string;
    icon?: string;
    category: string;
    parentId: string | null;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await addSkill({ ...data, userId: user.id });
      if (!result.success) throw new Error(String(result.error));

      await loadTreeData();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Erro ao criar skill:', message);
      alert(`Erro: ${message}`);
    }
  };


  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setContextMenu(null);
    setSelectedSkillId(node.id);
  }, []);


  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setSelectedSkillId(null);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
      nodeName: (node.data as SkillData).label ?? (node.data as SkillData).name,
    });
  }, []);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
    setSelectedSkillId(null);
  }, []);


  const selectedNode = useMemo(
    () => nodes.find(n => n.id === selectedSkillId),
    [nodes, selectedSkillId]
  );

  const panelData = useMemo(
    () => selectedNode ? { ...selectedNode.data, id: selectedNode.id } : null,
    [selectedNode]
  );

  const isPanelAvailable = useMemo(() => {
    if (!selectedNode) return false;
    const parentId = selectedNode.data.parentId;
    if (!parentId) return true;
    return !!nodes.find(n => n.id === parentId)?.data.isUnlocked;
  }, [selectedNode, nodes]);

  const isModalOpen = modalParentId !== undefined;

  return (
    <div
      className="relative w-full bg-[#030304] overflow-hidden select-none font-sans"
      style={{ height: 'calc(100vh - 160px)' }}
    >
      {isLoading && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#030304]/80 backdrop-blur-md pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#c8b89a]/20 border-t-[#c8b89a] rounded-full animate-spin" />
            <p className="text-[#c8b89a] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
              Sincronizando Nexus...
            </p>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#c8b89a]/30 to-transparent" />
          </div>
        </div>
      )}

      <SvgDefs />
      <StarField />

      {!isLoading && nodes.length === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-[#c8b89a]/40 text-[10px] font-black uppercase tracking-[0.4em]">
              Nexus Vazio
            </p>
            <p className="text-zinc-600 text-xs max-w-[220px]">
              Crie o nó raiz para iniciar sua árvore de conhecimento
            </p>
          </div>
          <button
            onClick={() => setModalParentId(null)}
            className="pointer-events-auto flex items-center gap-3 px-8 py-4 border border-[#c8b89a]/30 bg-[#c8b89a]/5 text-[#c8b89a] hover:bg-[#c8b89a]/10 hover:border-[#c8b89a]/60 transition-all group"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Criar Raiz do Nexus
            </span>
          </button>
        </div>
      )}

      <div style={{ width: '100%', height: 'calc(100vh - 160px)' }} className="relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          nodesDraggable
          panOnDrag
          zoomOnScroll
          minZoom={0.05}
          maxZoom={2}
          connectionMode={ConnectionMode.Loose}
          nodesConnectable={false}
          style={{ background: 'transparent' }}
        />
      </div>

      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeName={contextMenu.nodeName}
          onAddChild={() => setModalParentId(contextMenu.nodeId)}
          onDelete={() => handleDelete(contextMenu.nodeId)}
          onClose={() => setContextMenu(null)}
        />
      )}

      <SkillPanel
        data={panelData}
        onClose={() => setSelectedSkillId(null)}
        onToggleStatus={handleToggleStatus}
        isAvailable={isPanelAvailable}
      />

      <AddSkillModal
        isOpen={isModalOpen}
        onClose={() => setModalParentId(undefined)}
        onAdd={handleCreateSkill}
        existingSkills={nodes.map(n => ({ id: n.id, name: n.data.label ?? n.data.name }))}
        preselectedParentId={modalParentId}
      />
    </div>
  );
}