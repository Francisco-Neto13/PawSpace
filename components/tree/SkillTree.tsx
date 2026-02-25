'use client';
import React, { useState } from 'react';
import { ReactFlow, Background, NodeTypes, Edge, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { SkillData } from './types';
import { SkillNode } from './SkillNode';
import { SkillEdge } from './SkillEdge';
import { SkillPanel } from './SkillPanel';
import { StarField } from './StarField';

const nodeTypes: NodeTypes = { skill: SkillNode as any };
const edgeTypes = { skill: SkillEdge };

export function SkillTree() {
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);

  const makeData = (d: Omit<SkillData, 'onSelect'>) => ({
    ...d,
    onSelect: setSelectedSkill,
  });

  const [nodes] = useNodesState([
    { id: '1', type: 'skill', position: { x: 250, y: 50  }, data: makeData({ label: 'Origin',       icon: '🔥', isUnlocked: true,  level: 10, xp: 80, xpToNextLevel: 100, description: 'The beginning of all paths' }) },
    { id: '2', type: 'skill', position: { x: 80,  y: 220 }, data: makeData({ label: 'Strength',     icon: '💪', isUnlocked: true,  level: 5,  xp: 30, xpToNextLevel: 100, description: 'Raw physical power' }) },
    { id: '3', type: 'skill', position: { x: 420, y: 220 }, data: makeData({ label: 'Arcane',       icon: '🔮', isUnlocked: false, level: 0,  xp: 0,  xpToNextLevel: 100, description: 'Requires Origin Lv.5' }) },
    { id: '4', type: 'skill', position: { x: -80, y: 400 }, data: makeData({ label: 'Berserker',    icon: '⚔️', isUnlocked: true,  level: 3,  xp: 60, xpToNextLevel: 100, description: 'Fury unleashed' }) },
    { id: '5', type: 'skill', position: { x: 240, y: 400 }, data: makeData({ label: 'Guardian',     icon: '🛡️', isUnlocked: false, level: 0,  xp: 0,  xpToNextLevel: 100, description: 'Requires Strength Lv.3' }) },
    { id: '6', type: 'skill', position: { x: 600, y: 400 }, data: makeData({ label: 'Elementalist', icon: '🌊', isUnlocked: false, level: 0,  xp: 0,  xpToNextLevel: 100, description: 'Master of elements' }) },
  ]);

  const [edges] = useEdgesState<Edge>([
    { id: 'e1-2', source: '1', target: '2', type: 'skill', data: { unlocked: true } },
    { id: 'e1-3', source: '1', target: '3', type: 'skill', data: { unlocked: false } },
    { id: 'e2-4', source: '2', target: '4', type: 'skill', data: { unlocked: true } },
    { id: 'e2-5', source: '2', target: '5', type: 'skill', data: { unlocked: false } },
    { id: 'e3-6', source: '3', target: '6', type: 'skill', data: { unlocked: false } },
  ]);

  const unlockedCount = nodes.filter(n => (n.data as SkillData).isUnlocked).length;

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#050505] relative">
      <style>{`
        .react-flow__attribution { display: none; }
        .react-flow__handle { pointer-events: none; }
      `}</style>

      <StarField />

      <div className="absolute top-7 left-7 z-10 pointer-events-none">
        <h1
          className="text-3xl font-black tracking-tighter text-white italic uppercase"
          style={{ textShadow: '0 0 30px rgba(168,85,247,0.6)' }}
        >
          ASCENSION <span className="text-purple-500">TREE</span>
        </h1>
        <p className="text-[11px] text-zinc-600 uppercase tracking-widest mt-1">
          {unlockedCount} / {nodes.length} Skills Unlocked
        </p>
      </div>

      <div className="absolute top-7 right-7 z-10 flex gap-2">
        {[
          { label: 'Total XP', value: nodes.reduce((acc, n) => acc + (n.data as SkillData).xp, 0) },
          { label: 'Avg Lv',   value: Math.round(nodes.filter(n => (n.data as SkillData).isUnlocked).reduce((acc, n) => acc + (n.data as SkillData).level, 0) / unlockedCount) },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-purple-500/20 bg-zinc-950/80 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-base font-extrabold text-purple-400">{s.value}</p>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="absolute bottom-6 left-6 z-10 text-[11px] text-zinc-700 uppercase tracking-widest pointer-events-none">
        Scroll to zoom · Drag to pan · Click node to inspect
      </p>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        colorMode="dark"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
      >
        <Background color="#111" gap={40} size={1} />
      </ReactFlow>

      <SkillPanel data={selectedSkill} onClose={() => setSelectedSkill(null)} />
    </main>
  );
}