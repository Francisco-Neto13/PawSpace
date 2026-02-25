'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  type Node, 
  type Edge, 
  BackgroundVariant, 
  type NodeTypes,
  ConnectionMode 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { SkillData } from './types';
import { SkillNode } from './SkillNode';
import { SkillEdge } from './SkillEdge';
import { SkillPanel } from './SkillPanel';
import { StarField } from './StarField';

import { generateTreeLayout } from '@/utils/treeUtils';
import { SKILL_TREE_DATA } from '@/constants/skills';

const nodeTypes: NodeTypes = { skill: SkillNode };
const edgeTypes = { skill: SkillEdge };

export function SkillTree() {
  const initialData = useMemo(() => generateTreeLayout(SKILL_TREE_DATA), []);

  const [nodes, setNodes] = useState<Node<SkillData>[]>(initialData.nodes);
  const [edges, setEdges] = useState<Edge[]>(initialData.edges);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const selectedSkill = useMemo(() => {
    return nodes.find(n => n.id === selectedSkillId)?.data || null;
  }, [nodes, selectedSkillId]);

  const handleGainXp = useCallback((nodeId: string) => {
    const xpGain = 25;

    setNodes((nds) => {
      const targetNode = nds.find((n) => n.id === nodeId);
      if (!targetNode) return nds;

      return nds.map((node) => {
        let addedXp = 0;

        if (node.id === nodeId) addedXp = xpGain;
        else if (node.id === targetNode.data.parentId) addedXp = xpGain * 0.5;
        else if (node.id === 'nexus') addedXp = xpGain * 0.2;

        if (addedXp > 0) {
          let newXp = node.data.xp + addedXp;
          let newLevel = node.data.level;
          let newXpToNext = node.data.xpToNextLevel;

          if (newXp >= newXpToNext) {
            newXp = newXp - newXpToNext;
            newLevel += 1;
            newXpToNext = Math.floor(newXpToNext * 1.5);
          }

          return {
            ...node,
            data: { ...node.data, xp: newXp, level: newLevel, xpToNextLevel: newXpToNext }
          };
        }

        return node;
      });
    });
  }, []);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedSkillId(node.id);
    handleGainXp(node.id);
  }, [handleGainXp]);

  return (
    <main className="h-screen w-screen overflow-hidden relative bg-[#030304] select-none text-[#c8b89a]">
      <StarField />

      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-3xl font-serif italic tracking-tighter text-[#c8b89a] drop-shadow-2xl">
          Web Dev Mastery
        </h1>
        <div className="h-[1px] w-48 bg-gradient-to-r from-[#c8b89a] to-transparent mt-1 opacity-30" />
        <p className="text-[10px] uppercase tracking-[0.2em] mt-2 text-[#c8b89a]/50">
          Knowledge Path Progression
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
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={40} 
          size={1} 
          color="#1a1a1e" 
        />
      </ReactFlow>

      <SkillPanel 
        data={selectedSkill} 
        onClose={() => setSelectedSkillId(null)} 
      />
    </main>
  );
}