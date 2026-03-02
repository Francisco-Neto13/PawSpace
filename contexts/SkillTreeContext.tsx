'use client';
import { createContext, useContext, useEffect } from 'react';
import { type Node, type Edge } from '@xyflow/react';
import { useNexus, SkillNode } from './NexusContext';
import { SkillData } from '@/components/tree/types';
import { calculateGlobalProgress } from '@/utils/treeUtils';

interface SkillTreeContextValue {
  nodes: SkillNode[];
  edges: Edge[];
  isLoading: boolean;
}

const SkillTreeContext = createContext<SkillTreeContextValue | null>(null);

export function useSkillTree() {
  const ctx = useContext(SkillTreeContext);
  if (!ctx) throw new Error('useSkillTree deve ser usado dentro de um SkillTreeProvider');
  return ctx;
}

export function SkillTreeProvider({ children }: { children: React.ReactNode }) {
  const { nodes, edges, isLoading } = useNexus();

  useEffect(() => {
    if (nodes.length === 0) return;
    window.dispatchEvent(
      new CustomEvent('skill-progress-update', {
        detail: calculateGlobalProgress(nodes as Node<SkillData>[]),
      })
    );
  }, [nodes]);

  return (
    <SkillTreeContext.Provider value={{ nodes, edges, isLoading }}>
      {children}
    </SkillTreeContext.Provider>
  );
}