'use client';
import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { usePathname } from 'next/navigation';
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
  discardLocalChanges: () => void;
  globalStats: GlobalStats;
  refreshGlobalStats: () => Promise<void>;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

function isPublicRoute(pathname: string | null) {
  if (!pathname) return false;
  return pathname.startsWith('/login');
}

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

export function NexusProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const skipHydration = isPublicRoute(pathname);

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
  const skipHydrationRef = useRef(skipHydration);
  const persistedNodesRef = useRef<SkillNode[]>([]);
  const persistedEdgesRef = useRef<Edge[]>([]);

  useEffect(() => {
    skipHydrationRef.current = skipHydration;
  }, [skipHydration]);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const refreshGlobalStats = useCallback(async () => {
    if (skipHydration) return;
    const stats = await getGlobalStats();
    setGlobalStats(stats);
  }, [skipHydration]);

  const refreshNexus = useCallback(async (silent = false) => {
    if (skipHydration) {
      setIsLoading(false);
      return;
    }

    if (hasLoadedRef.current && silent) {
      console.log('[Pawspace] Dados já em memória, ignorando refresh silencioso.');
      return;
    }

    console.log(`[Pawspace] Refresh ${silent ? 'SILENCIOSO' : 'COMPLETO'} iniciado...`);
    if (!silent) setIsLoading(true);

    try {
      const [data, stats] = await Promise.all([
        getSkillsFull(),
        hasLoadedRef.current ? Promise.resolve(null) : getGlobalStats(),
      ]);

      if (skipHydrationRef.current) return;

      if (stats) setGlobalStats(stats);

      if (data && (data.nodes || data.edges)) {
        const incomingNodes = (data.nodes as SkillNode[]) || [];
        const incomingEdges = (data.edges as Edge[]) || [];
        persistedNodesRef.current = cloneValue(incomingNodes);
        persistedEdgesRef.current = cloneValue(incomingEdges);

        setNodes(prevNodes => {
          if (isDirtyRef.current && silent) {
            console.log('[Pawspace] Mantendo alterações locais (Silent mode + Dirty).');
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
          console.log(`[Pawspace] ${originalNodeIds.current.size} ids originais registrados.`);
        }

        hasLoadedRef.current = true;
      }
    } catch (error) {
      console.error('[Pawspace] Erro na sincronização:', error);
    } finally {
      setIsLoading(false);
      console.log('[Pawspace] Refresh finalizado.');
    }
  }, [skipHydration]);

  const discardLocalChanges = useCallback(() => {
    if (!hasLoadedRef.current) return;

    const nextNodes = cloneValue(persistedNodesRef.current);
    const nextEdges = cloneValue(persistedEdgesRef.current);
    setNodes(nextNodes);
    setEdges(nextEdges);
    setIsDirty(false);
    setIsSaving(false);
    originalNodeIds.current = new Set(nextNodes.map((node) => node.id));
  }, []);

  useEffect(() => {
    if (skipHydration) {
      setIsLoading(false);
      return;
    }

    void refreshNexus();
  }, [refreshNexus, skipHydration]);

  useEffect(() => {
    if (!skipHydration) return;

    hasLoadedRef.current = false;
    originalNodeIds.current = new Set();
    persistedNodesRef.current = [];
    persistedEdgesRef.current = [];
    setNodes([]);
    setEdges([]);
    setGlobalStats({ totalLibraryContents: 0, totalJournalEntries: 0 });
    setIsDirty(false);
    setIsSaving(false);
  }, [skipHydration]);

  const contextValue = useMemo(
    () => ({
      nodes, edges, setNodes, setEdges,
      isLoading, isDirty, setIsDirty,
      isSaving, setIsSaving,
      originalNodeIds, refreshNexus, discardLocalChanges,
      globalStats, refreshGlobalStats,
    }),
    [
      nodes,
      edges,
      isLoading,
      isDirty,
      isSaving,
      refreshNexus,
      discardLocalChanges,
      globalStats,
      refreshGlobalStats,
    ]
  );

  return (
    <NexusContext.Provider value={contextValue}>
      {children}
    </NexusContext.Provider>
  );
}

export function useNexus() {
  const context = useContext(NexusContext);
  if (!context) throw new Error('useNexus deve ser usado dentro do contexto Pawspace');
  return context;
}
