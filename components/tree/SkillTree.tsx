'use client';
import React, { useState, useCallback } from 'react';
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

const nodeTypes: NodeTypes = { skill: SkillNode };
const edgeTypes = { skill: SkillEdge };

export function SkillTree() {
  const [nodes] = useState<Node<SkillData>[]>(INITIAL_NODES);
  const [edges] = useState<Edge[]>(INITIAL_EDGES);
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const onNodeClick = useCallback((_: any, node: Node) => {
    const data = node.data as SkillData;
    setSelectedSkill(data);
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden relative bg-[#030304] select-none text-[#c8b89a]">
      <StarField />

      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-3xl font-serif italic tracking-tighter text-[#c8b89a] drop-shadow-2xl">
          Skill Tree
        </h1>
        <div className="h-[1px] w-32 bg-gradient-to-r from-[#c8b89a] to-transparent mt-1 opacity-30" />
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
        <Background variant={BackgroundVariant.Dots} gap={30} size={1} color="#1a1a1e" />
      </ReactFlow>

      <SkillPanel data={selectedSkill} onClose={() => setSelectedSkill(null)} />
    </main>
  );
}

const INITIAL_NODES: Node<SkillData>[] = [
  { id: '1', type: 'skill', position: { x: 300, y: 300 }, data: { label: 'The Nexus', icon: '⚜️', isUnlocked: true, level: 10, xp: 0, xpToNextLevel: 100, description: 'The starting point of all fate.', category: 'keystone', onSelect: () => {} } },
  { id: '2', type: 'skill', position: { x: 150, y: 150 }, data: { label: 'Raw Might', icon: '👊', isUnlocked: true, level: 1, xp: 40, xpToNextLevel: 100, description: '+10 Strength.', category: 'strength', onSelect: () => {} } },
  { id: '3', type: 'skill', position: { x: 450, y: 150 }, data: { label: 'Quickness', icon: '👟', isUnlocked: true, level: 1, xp: 20, xpToNextLevel: 100, description: '+10 Dexterity.', category: 'dexterity', onSelect: () => {} } },
  { id: '4', type: 'skill', position: { x: 300, y: 500 }, data: { label: 'Insight', icon: '🧠', isUnlocked: true, level: 1, xp: 70, xpToNextLevel: 100, description: '+10 Intelligence.', category: 'intelligence', onSelect: () => {} } },
  { id: '5', type: 'skill', position: { x: -20, y: 80 }, data: { label: 'Iron Grip', icon: '🛡️', isUnlocked: true, level: 5, xp: 10, xpToNextLevel: 100, description: 'Strength bonus applies to projectiles.', category: 'strength', onSelect: () => {} } },
  { id: '6', type: 'skill', position: { x: 100, y: -50 }, data: { label: 'Bloodlust', icon: '🩸', isUnlocked: true, level: 5, xp: 85, xpToNextLevel: 100, description: 'Life leech on physical hits.', category: 'strength', onSelect: () => {} } },
  { id: '7', type: 'skill', position: { x: 500, y: -50 }, data: { label: 'Deadeye', icon: '🎯', isUnlocked: true, level: 5, xp: 30, xpToNextLevel: 100, description: 'Critical strikes never miss.', category: 'dexterity', onSelect: () => {} } },
  { id: '8', type: 'skill', position: { x: 620, y: 80 }, data: { label: 'Wind Walker', icon: '💨', isUnlocked: true, level: 5, xp: 60, xpToNextLevel: 100, description: 'Chance to dodge spells.', category: 'dexterity', onSelect: () => {} } },
  { id: '9', type: 'skill', position: { x: 150, y: 650 }, data: { label: 'Void Battery', icon: '🔮', isUnlocked: true, level: 5, xp: 45, xpToNextLevel: 100, description: 'Mana regenerates based on level.', category: 'intelligence', onSelect: () => {} } },
  { id: '10', type: 'skill', position: { x: 450, y: 650 }, data: { label: 'Static Shock', icon: '⚡', isUnlocked: true, level: 5, xp: 90, xpToNextLevel: 100, description: 'Lightning spells chain once more.', category: 'intelligence', onSelect: () => {} } },
  { id: '11', type: 'skill', position: { x: -150, y: -150 }, data: { label: 'Unstoppable Force', icon: '🌋', isUnlocked: true, level: 1, xp: 0, xpToNextLevel: 100, description: 'Cannot be slowed. Physical damage is doubled.', category: 'keystone', onSelect: () => {} } },
  { id: '12', type: 'skill', position: { x: 750, y: -150 }, data: { label: 'Ghost Dance', icon: '👻', isUnlocked: true, level: 1, xp: 0, xpToNextLevel: 100, description: '30% chance to take no damage when hit.', category: 'keystone', onSelect: () => {} } },
  { id: '13', type: 'skill', position: { x: 300, y: 800 }, data: { label: 'Chaos Inoculation', icon: '☣️', isUnlocked: true, level: 1, xp: 0, xpToNextLevel: 100, description: 'Immune to Chaos. Maximum Life becomes 1.', category: 'keystone', onSelect: () => {} } },
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'skill', data: { unlocked: true, category: 'strength' } },
  { id: 'e1-3', source: '1', target: '3', type: 'skill', data: { unlocked: true, category: 'dexterity' } },
  { id: 'e1-4', source: '1', target: '4', type: 'skill', data: { unlocked: true, category: 'intelligence' } },
  { id: 'e2-5', source: '2', target: '5', type: 'skill', data: { unlocked: true, category: 'strength' } },
  { id: 'e2-6', source: '2', target: '6', type: 'skill', data: { unlocked: true, category: 'strength' } },
  { id: 'e3-7', source: '3', target: '7', type: 'skill', data: { unlocked: true, category: 'dexterity' } },
  { id: 'e3-8', source: '3', target: '8', type: 'skill', data: { unlocked: true, category: 'dexterity' } },
  { id: 'e4-9', source: '4', target: '9', type: 'skill', data: { unlocked: true, category: 'intelligence' } },
  { id: 'e4-10', source: '4', target: '10', type: 'skill', data: { unlocked: true, category: 'intelligence' } },
  { id: 'e5-11', source: '5', target: '11', type: 'skill', data: { unlocked: true, category: 'keystone' } },
  { id: 'e7-12', source: '7', target: '12', type: 'skill', data: { unlocked: true, category: 'keystone' } },
  { id: 'e9-13', source: '9', target: '13', type: 'skill', data: { unlocked: true, category: 'keystone' } },
];