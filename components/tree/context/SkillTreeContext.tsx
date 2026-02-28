'use client';
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { type Node, type Edge } from '@xyflow/react';
import { SkillData } from '../types';
import { createClient } from '@/utils/supabase/client';
import { getSkillsFull } from '@/app/actions/skills';
import {
  generateTreeLayout,
  calculateRecursiveProgress,
  calculateGlobalProgress,
  buildHierarchy,
} from '@/utils/treeUtils';

const supabase = createClient();

interface SkillTreeContextValue {
  nodes: Node<SkillData>[];
  edges: Edge[];
  isLoading: boolean;
  userId: string | null;
  setNodes: React.Dispatch<React.SetStateAction<Node<SkillData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  loadTreeData: () => Promise<void>;
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
  const [userId, setUserId] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  const setInitialData = useCallback((skills: any[]) => {
    if (!skills || skills.length === 0) {
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
      console.error('Erro na hidratação do Nexus:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTreeData = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const rawSkills = await getSkillsFull(user.id);
      if (rawSkills && rawSkills.length > 0) {
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
      console.error('Erro ao carregar dados do Nexus:', error);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
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
      value={{ nodes, edges, isLoading, userId, setNodes, setEdges, loadTreeData, setInitialData }}
    >
      {children}
    </SkillTreeContext.Provider>
  );
}