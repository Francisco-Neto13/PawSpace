'use client';
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import { SkillData } from '@/components/tree/types';
import { getSkillsFull } from '@/app/actions/skills';
import { getGlobalStats } from '@/app/actions/stats';

export type SkillNode = Node<SkillData>;

interface GlobalStats {
  totalLibraryContents: number;
  totalJournalEntries: number;
}

interface NexusContextType {
  nodes: SkillNode[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<SkillNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  isLoading: boolean;
  isDirty: boolean;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  originalNodeIds: React.MutableRefObject<Set<string>>;
  refreshNexus: (silent?: boolean) => Promise<void>;
  globalStats: GlobalStats;
  refreshGlobalStats: () => Promise<void>;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

export function NexusProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalLibraryContents: 0,
    totalJournalEntries: 0,
  });

  const isDirtyRef = useRef(isDirty);
  const hasLoadedRef = useRef(false);
  const originalNodeIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const refreshGlobalStats = useCallback(async () => {
    const stats = await getGlobalStats();
    setGlobalStats(stats);
  }, []);

  const refreshNexus = useCallback(async (silent = false) => {
    if (hasLoadedRef.current && silent) {
      console.log('✅ [Nexus] Dados já em memória, ignorando refresh silencioso.');
      return;
    }
    console.log(`🔄 [Nexus] Refresh ${silent ? 'SILENCIOSO' : 'COMPLETO'} iniciado...`);
    if (!silent) setIsLoading(true);
    try {
      const [data, stats] = await Promise.all([
        getSkillsFull(),
        hasLoadedRef.current ? Promise.resolve(null) : getGlobalStats(),
      ]);

      if (stats) setGlobalStats(stats);

      if (data && (data.nodes || data.edges)) {
        const incomingNodes = (data.nodes as SkillNode[]) || [];
        const incomingEdges = (data.edges as Edge[]) || [];
        setNodes(prevNodes => {
          if (isDirtyRef.current && silent) {
            console.log('⚠️ [Nexus] Mantendo alterações locais (Silent mode + Dirty).');
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
          originalNodeIds.current = new Set(incomingNodes.map(n => n.id));
          console.log(`📋 [Nexus] ${originalNodeIds.current.size} ids originais registrados.`);
        }
        hasLoadedRef.current = true;
      }
    } catch (error) {
      console.error('❌ [Nexus] Erro na sincronização:', error);
    } finally {
      setIsLoading(false);
      console.log('✅ [Nexus] Refresh finalizado.');
    }
  }, []);

  useEffect(() => {
    refreshNexus();
  }, [refreshNexus]);

  return (
    <NexusContext.Provider
      value={{
        nodes, edges, setNodes, setEdges,
        isLoading, isDirty, setIsDirty,
        isSaving, setIsSaving,
        originalNodeIds, refreshNexus,
        globalStats, refreshGlobalStats,
      }}
    >
      {children}
    </NexusContext.Provider>
  );
}

export function useNexus() {
  const context = useContext(NexusContext);
  if (!context) throw new Error('useNexus deve ser usado dentro de um NexusProvider');
  return context;
}