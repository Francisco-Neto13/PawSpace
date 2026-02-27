'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { type Node, type Edge } from '@xyflow/react';
import { SkillData } from '../types';
import { createClient } from '@/utils/supabase/client';
import { getSkills } from '@/app/actions/skills';
import {
  generateTreeLayout,
  calculateRecursiveProgress,
  calculateGlobalProgress,
  buildHierarchy,
} from '@/utils/treeUtils';

interface SkillTreeContextValue {
  nodes: Node<SkillData>[];
  edges: Edge[];
  isLoading: boolean;
  setNodes: React.Dispatch<React.SetStateAction<Node<SkillData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  loadTreeData: () => Promise<void>;
}

const SkillTreeContext = createContext<SkillTreeContextValue | null>(null);

export function useSkillTreeContext() {
  const ctx = useContext(SkillTreeContext);
  if (!ctx) throw new Error('Fora do SkillTreeProvider');
  return ctx;
}

export function SkillTreeProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<Node<SkillData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const loadTreeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const rawSkills = await getSkills(user.id);
console.log('Posições do banco:', rawSkills.map(s => ({ 
  name: s.name, 
  x: s.positionX, 
  y: s.positionY 
})));

      if (rawSkills?.length > 0) {
        const hierarchy = buildHierarchy(rawSkills);
        const { nodes: layoutNodes, edges: layoutEdges } = generateTreeLayout(hierarchy);
        const nodesWithProgress = calculateRecursiveProgress(layoutNodes, layoutEdges);
        setNodes(nodesWithProgress);
        setEdges(layoutEdges);
      } else {
        setNodes([]);
        setEdges([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (nodes.length === 0) return;
    window.dispatchEvent(
      new CustomEvent('skill-progress-update', {
        detail: calculateGlobalProgress(nodes),
      })
    );
  }, [nodes]);

  return (
    <SkillTreeContext.Provider value={{ nodes, edges, isLoading, setNodes, setEdges, loadTreeData }}>
      {children}
    </SkillTreeContext.Provider>
  );
}