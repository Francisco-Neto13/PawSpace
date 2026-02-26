'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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

import { SkillData } from './types';
import { SkillNode, SvgDefs } from './SkillNode';
import { SkillEdge } from './SkillEdge';
import { SkillPanel } from './SkillPanel';
import { StarField } from './StarField';

import { HUDFrame }       from '@/components/ui/rpg/HUDFrame';
import { CharacterStats } from '@/components/ui/rpg/CharacterStats';
import { ExperienceBar }  from '@/components/ui/rpg/ExperienceBar';

import {
  generateTreeLayout,
  calculateRecursiveProgress,
  calculateGlobalProgress,
} from '@/utils/treeUtils';
import { SKILL_TREE_DATA } from '@/constants/skills';

const nodeTypes: NodeTypes = { skill: SkillNode };
const edgeTypes = { skill: SkillEdge };

const PROGRESS_KEY = 'skill-tree-progress-v1';
const LAYOUT_KEY   = 'skill-tree-layout-v1';

const defaultEdgeOptions = {
  type: 'skill',
  style: { strokeWidth: 2, transition: 'stroke 0.5s ease' },
};

export function SkillTree() {
  const initialData = useMemo(() => generateTreeLayout(SKILL_TREE_DATA), []);

  const [nodes, setNodes] = useState<Node<SkillData>[]>(initialData.nodes);
  const [edges, setEdges] = useState<Edge[]>(initialData.edges);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedProgress = localStorage.getItem(PROGRESS_KEY);
    const savedLayout   = localStorage.getItem(LAYOUT_KEY);

    let currentNodes = [...initialData.nodes];
    let unlockedIds: string[] = [];

    if (savedProgress) {
      try {
        unlockedIds = JSON.parse(savedProgress);
        currentNodes = currentNodes.map(node => ({
          ...node,
          data: { ...node.data, isUnlocked: unlockedIds.includes(node.id) },
        }));
      } catch (e) { console.error('Erro ao carregar progresso', e); }
    }

    if (savedLayout) {
      try {
        const layoutMap = JSON.parse(savedLayout) as { id: string; position: { x: number; y: number } }[];
        currentNodes = currentNodes.map(node => {
          const saved = layoutMap.find(l => l.id === node.id);
          return saved ? { ...node, position: saved.position } : node;
        });
      } catch (e) { console.error('Erro ao carregar layout', e); }
    }

    setNodes(calculateRecursiveProgress(currentNodes, initialData.edges));
    setEdges(initialData.edges.map(edge => ({
      ...edge,
      type: 'skill',
      data: { ...edge.data, unlocked: unlockedIds.includes(edge.target) },
    })));
  }, [initialData]);

  useEffect(() => {
    if (!isMounted) return;
    const unlockedIds = nodes.filter(n => n.data.isUnlocked).map(n => n.id);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(unlockedIds));
    window.dispatchEvent(
      new CustomEvent('skill-progress-update', { detail: calculateGlobalProgress(nodes) })
    );
  }, [nodes, isMounted]);

  const onNodesChange: OnNodesChange<Node<SkillData>> = useCallback((changes) => {
    setNodes(nds => {
      const updated = applyNodeChanges(changes, nds);
      const hasPosChange = changes.some(c => c.type === 'position' && c.dragging === false);
      if (hasPosChange) {
        localStorage.setItem(
          LAYOUT_KEY,
          JSON.stringify(updated.map(n => ({ id: n.id, position: n.position })))
        );
      }
      return updated;
    });
  }, []);

  const exportLayout = useCallback(() => {
    console.log('=== LAYOUT ===');
    console.log(JSON.stringify(nodes.map(n => ({ id: n.id, position: n.position })), null, 2));
    alert('Layout logado no console!');
  }, [nodes]);

  const handleToggleStatus = useCallback((nodeId: string) => {
    setNodes(prev => {
      const target = prev.find(n => n.id === nodeId);
      if (!target) return prev;
      const currentlyUnlocked = target.data.isUnlocked;

      if (currentlyUnlocked) {
        const childIds = edges.filter(e => e.source === nodeId).map(e => e.target);
        if (prev.some(n => childIds.includes(n.id) && n.data.isUnlocked)) {
          alert('Dependências ativas!');
          return prev;
        }
      }

      const nextNodes = prev.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, isUnlocked: !currentlyUnlocked } }
          : node
      );
      const finalNodes = calculateRecursiveProgress(nextNodes, edges);

      setEdges(prevEdges => prevEdges.map(edge => ({
        ...edge,
        data: { ...edge.data, unlocked: !!finalNodes.find(n => n.id === edge.target)?.data.isUnlocked },
      })));

      return finalNodes;
    });
  }, [edges]);

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedSkillId(node.id);
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

  if (!isMounted) return <div className="h-screen w-screen bg-[#030304]" />;

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-[#030304] select-none">
      <SvgDefs />
      <StarField />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        nodesDraggable
        panOnDrag
        zoomOnScroll
        minZoom={0.05}
        maxZoom={2}
        connectionMode={ConnectionMode.Loose}
        nodesConnectable={false}
      />

      <div className="absolute inset-0 z-40 pointer-events-none">
        <HUDFrame />
        <CharacterStats />
        <ExperienceBar onExportLayout={exportLayout} />
      </div>
      <SkillPanel
        data={panelData}
        onClose={() => setSelectedSkillId(null)}
        onToggleStatus={handleToggleStatus}
        isAvailable={isPanelAvailable}
      />
    </div>
  );
}