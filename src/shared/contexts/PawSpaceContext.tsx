'use client';
import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { usePathname } from 'next/navigation';
import { SkillData } from '@/components/tree/types';
import { getSkillsFull } from '@/app/actions/skills';
import { getGlobalStats } from '@/app/actions/stats';

export type SkillNode = Node<SkillData>;

interface GlobalStats {
  totalSkills: number;
  totalLibraryContents: number;
  totalJournalEntries: number;
}

interface PawSpaceGraphContextType {
  nodes: SkillNode[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<SkillNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  isLoading: boolean;
  originalNodeIds: React.MutableRefObject<Set<string>>;
  refreshPawSpace: (silent?: boolean) => Promise<void>;
}

interface PawSpaceMetaContextType {
  isDirty: boolean;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  discardLocalChanges: () => void;
  globalStats: GlobalStats;
  refreshGlobalStats: () => Promise<void>;
}

const PawSpaceGraphContext = createContext<PawSpaceGraphContextType | undefined>(undefined);
const PawSpaceMetaContext = createContext<PawSpaceMetaContextType | undefined>(undefined);

function isPublicRoute(pathname: string | null) {
  if (!pathname) return false;
  return pathname.startsWith('/login') || pathname.startsWith('/landing');
}

function shouldHydrateGraph(pathname: string | null) {
  if (!pathname) return false;
  return (
    pathname.startsWith('/overview') ||
    pathname.startsWith('/tree') ||
    pathname.startsWith('/library') ||
    pathname.startsWith('/journal') ||
    pathname.startsWith('/achievements')
  );
}

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

export function PawSpaceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = isPublicRoute(pathname);
  const needsGraph = shouldHydrateGraph(pathname);
  const skipHydration = isPublic || !needsGraph;

  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalSkills: 0,
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
    if (isPublic) return;
    const stats = await getGlobalStats();
    setGlobalStats(stats);
  }, [isPublic]);

  const refreshPawSpace = useCallback(async (silent = false) => {
    if (skipHydration) {
      setIsLoading(false);
      return;
    }

    if (hasLoadedRef.current && silent) {
      return;
    }

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

        setNodes((prevNodes) => {
          if (isDirtyRef.current && silent) {
            return prevNodes;
          }
          return incomingNodes;
        });

        setEdges((prevEdges) => {
          if (isDirtyRef.current && silent) return prevEdges;
          return incomingEdges;
        });

        if (!isDirtyRef.current) {
          setIsDirty(false);
          originalNodeIds.current = new Set(incomingNodes.map((node) => node.id));
        }

        hasLoadedRef.current = true;
      }
    } catch (error) {
      console.error('[PawSpace] Erro na sincronização:', error);
    } finally {
      setIsLoading(false);
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

    void refreshPawSpace();
  }, [refreshPawSpace, skipHydration]);

  useEffect(() => {
    if (!isPublic) return;

    hasLoadedRef.current = false;
    originalNodeIds.current = new Set();
    persistedNodesRef.current = [];
    persistedEdgesRef.current = [];
    setNodes([]);
    setEdges([]);
    setGlobalStats({ totalSkills: 0, totalLibraryContents: 0, totalJournalEntries: 0 });
    setIsDirty(false);
    setIsSaving(false);
  }, [isPublic]);

  const graphContextValue = useMemo(
    () => ({
      nodes,
      edges,
      setNodes,
      setEdges,
      isLoading,
      originalNodeIds,
      refreshPawSpace,
    }),
    [nodes, edges, isLoading, refreshPawSpace]
  );

  const metaContextValue = useMemo(
    () => ({
      isDirty,
      setIsDirty,
      isSaving,
      setIsSaving,
      discardLocalChanges,
      globalStats,
      refreshGlobalStats,
    }),
    [isDirty, isSaving, discardLocalChanges, globalStats, refreshGlobalStats]
  );

  return (
    <PawSpaceGraphContext.Provider value={graphContextValue}>
      <PawSpaceMetaContext.Provider value={metaContextValue}>
        {children}
      </PawSpaceMetaContext.Provider>
    </PawSpaceGraphContext.Provider>
  );
}

export function usePawSpace() {
  const graph = useContext(PawSpaceGraphContext);
  const meta = useContext(PawSpaceMetaContext);
  if (!graph || !meta) throw new Error('usePawSpace deve ser usado dentro do contexto PawSpace');
  return {
    ...graph,
    ...meta,
  };
}

export function usePawSpaceGraph() {
  const context = useContext(PawSpaceGraphContext);
  if (!context) throw new Error('usePawSpaceGraph deve ser usado dentro do contexto PawSpace');
  return context;
}

export function usePawSpaceMeta() {
  const context = useContext(PawSpaceMetaContext);
  if (!context) throw new Error('usePawSpaceMeta deve ser usado dentro do contexto PawSpace');
  return context;
}
