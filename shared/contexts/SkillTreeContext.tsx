'use client';
import { createContext, useContext, useEffect, useRef } from 'react';
import { type Edge } from '@xyflow/react';
import { useNexus, SkillNode } from './NexusContext';

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
  const lastProgressStateRef = useRef<{ total: number; unlocked: number } | null>(null);

  useEffect(() => {
    if (nodes.length === 0) return;
    const total = nodes.length;
    let unlocked = 0;
    for (const node of nodes) {
      const linksCount = Array.isArray(node.data.links) ? node.data.links.length : 0;
      const contentsCount = Array.isArray(node.data.contents) ? node.data.contents.length : 0;
      if (linksCount + contentsCount > 0) unlocked++;
    }

    const previous = lastProgressStateRef.current;
    if (previous && previous.total === total && previous.unlocked === unlocked) {
      return;
    }

    lastProgressStateRef.current = { total, unlocked };
    window.dispatchEvent(
      new CustomEvent('skill-progress-update', {
        detail: Math.round((unlocked / total) * 100),
      })
    );
  }, [nodes]);

  return (
    <SkillTreeContext.Provider value={{ nodes, edges, isLoading }}>
      {children}
    </SkillTreeContext.Provider>
  );
}
