'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  BackgroundVariant,
  type NodeTypes,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { SkillData } from './types';
import { SkillNode, SvgDefs } from './SkillNode';
import { SkillEdge } from './SkillEdge';
import { SkillPanel } from './SkillPanel';
import { StarField } from './StarField';

import { generateTreeLayout, calculateRecursiveProgress } from '@/utils/treeUtils';
import { SKILL_TREE_DATA } from '@/constants/skills';

const nodeTypes: NodeTypes = { skill: SkillNode };
const edgeTypes = { skill: SkillEdge };
const STORAGE_KEY = 'skill-tree-progress-v1';

export function SkillTree() {
  const initialData = useMemo(() => generateTreeLayout(SKILL_TREE_DATA), []);

  const [nodes, setNodes] = useState<Node<SkillData>[]>(initialData.nodes);
  const [edges, setEdges] = useState<Edge[]>(initialData.edges);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const unlockedIds = JSON.parse(savedProgress) as string[];
        const restoredNodes = initialData.nodes.map(node => ({
          ...node,
          data: { ...node.data, isUnlocked: unlockedIds.includes(node.id) },
        }));
        setNodes(calculateRecursiveProgress(restoredNodes, initialData.edges));
        setEdges(initialData.edges.map(edge => ({
          ...edge,
          data: { ...edge.data, unlocked: unlockedIds.includes(edge.target) },
        })));
      } catch (e) {
        console.error('Erro ao carregar:', e);
      }
    } else {
      setNodes(calculateRecursiveProgress(initialData.nodes, initialData.edges));
    }
  }, [initialData]);

  useEffect(() => {
    if (!isMounted) return;
    const unlockedIds = nodes.filter(n => n.data.isUnlocked).map(n => n.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedIds));
  }, [nodes, isMounted]);

  const handleToggleStatus = useCallback((nodeId: string) => {
    setNodes(prev => {
      const target = prev.find(n => n.id === nodeId);
      if (!target) return prev;

      const currentlyUnlocked = target.data.isUnlocked;

      if (currentlyUnlocked) {
        const childIds = edges.filter(e => e.source === nodeId).map(e => e.target);
        const hasUnlockedChildren = prev.some(n => childIds.includes(n.id) && n.data.isUnlocked);
        if (hasUnlockedChildren) {
          alert('Não é possível esquecer esta habilidade enquanto houver especializações ativas abaixo dela!');
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
    <main className="h-screen w-screen overflow-hidden relative bg-[#030304] select-none text-[#c8b89a]">
      <SvgDefs />

      <StarField />

      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-3xl font-serif italic tracking-tighter text-[#c8b89a] drop-shadow-2xl">
          Learning Path
        </h1>
        <div className="h-[1px] w-48 bg-gradient-to-r from-[#c8b89a] to-transparent mt-1 opacity-30" />
        <p className="text-[10px] uppercase tracking-[0.2em] mt-2 text-[#c8b89a]/50">
          Personal Knowledge Map
        </p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        fitView
        nodesDraggable={false}
        panOnDrag
        zoomOnScroll
        connectionMode={ConnectionMode.Loose}
      >
        <Background variant={BackgroundVariant.Dots} gap={40} size={1} color="#1a1a1e" />
      </ReactFlow>

      <SkillPanel
        data={panelData}
        onClose={() => setSelectedSkillId(null)}
        onToggleStatus={handleToggleStatus}
        isAvailable={isPanelAvailable}
      />

      <button
        onClick={() => {
          if (confirm('Resetar todo o progresso?')) {
            localStorage.clear();
            window.location.reload();
          }
        }}
        className="absolute bottom-6 left-6 z-10 text-[9px] uppercase tracking-widest text-[#3a3a45] hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
      >
        Reset Journey
      </button>
    </main>
  );
}