'use client';
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import { getSkillsFull } from '@/app/actions/skills';

export interface SkillData {
  id: string;
  name: string;
  label: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
  description?: string;
  category?: string;
  progress?: number;
  parentId?: string;
  [key: string]: any; 
}

export type SkillNode = Node<SkillData>;

interface NexusContextType {
  nodes: SkillNode[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<SkillNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  isLoading: boolean;
  isDirty: boolean; 
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>; 
  refreshNexus: (silent?: boolean) => Promise<void>;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

export function NexusProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    isDirtyRef.current = isDirty;
    console.log(`🔔 [NexusContext] Estado isDirty: ${isDirty}`);
  }, [isDirty]);

  const refreshNexus = useCallback(async (silent = false) => {
    console.log(`🌐 [Nexus] Refresh ${silent ? 'SILENCIOSO' : 'COMPLETO'} iniciado...`);
    
    if (!silent) setIsLoading(true);
    
    try {
      const data = await getSkillsFull();
      
      if (data && (data.nodes || data.edges)) {
        const incomingNodes = (data.nodes as SkillNode[]) || [];
        const incomingEdges = (data.edges as Edge[]) || [];

        setNodes(prevNodes => {
            if (isDirtyRef.current && silent) {
                console.log("💾 [Nexus] Mantendo alterações locais (Silent mode + Dirty).");
                return prevNodes;
            }
            return incomingNodes;
        });

        setEdges(prevEdges => {
            if (isDirtyRef.current && silent) return prevEdges;
            return incomingEdges;
        });
        
        if (!isDirtyRef.current) {
          setIsDirty(false);
        }
      }
    } catch (error) {
      console.error("❌ [Nexus] Erro na sincronização:", error);
    } finally {
      setIsLoading(false);
      console.log("🏁 [Nexus] Refresh finalizado.");
    }
  }, []); 

  useEffect(() => {
    refreshNexus();
  }, [refreshNexus]);

  return (
    <NexusContext.Provider 
      value={{ 
        nodes, 
        edges, 
        setNodes, 
        setEdges, 
        isLoading, 
        isDirty,    
        setIsDirty, 
        refreshNexus 
      }}
    >
      {children}
    </NexusContext.Provider>
  );
}

export function useNexus() {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error('useNexus deve ser usado dentro de um NexusProvider');
  }
  return context;
}