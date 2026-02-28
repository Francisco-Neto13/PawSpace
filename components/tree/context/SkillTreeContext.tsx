'use client';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { type Node, type Edge } from '@xyflow/react';
import { SkillData } from '../types';
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
  setIsLoading: (loading: boolean) => void; 
  setInitialData: (skills: any[]) => void;
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

  const setInitialData = useCallback((skills: any[]) => {
    if (!skills || skills.length === 0) {
      setNodes([]);
      setEdges([]);
      setIsLoading(false);
      return;
    }

    try {
      const hierarchy = buildHierarchy(skills);
      const { nodes: layoutNodes, edges: layoutEdges } = generateTreeLayout(hierarchy);
      const nodesWithProgress = calculateRecursiveProgress(layoutNodes, layoutEdges);
      
      setNodes(nodesWithProgress);
      setEdges(layoutEdges);
    } catch (error) {
      console.error('❌ [Nexus Layout Error]:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (nodes.length === 0) return;
    window.dispatchEvent(
      new CustomEvent('skill-progress-update', {
        detail: calculateGlobalProgress(nodes),
      })
    );
  }, [nodes]);

  return (
    <SkillTreeContext.Provider
      value={{ 
        nodes, 
        edges, 
        isLoading, 
        setNodes, 
        setEdges, 
        setIsLoading, 
        setInitialData 
      }}
    >
      {children}
    </SkillTreeContext.Provider>
  );
}