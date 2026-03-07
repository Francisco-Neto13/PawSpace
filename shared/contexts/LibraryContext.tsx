'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Content } from '@/components/library/types';

interface LibraryContextType {
  nodeContents: Record<string, Content[]>;
  loadingNodeId: string | null;
  loadNodeContents: (nodeId: string) => Promise<void>;
  refreshNodeContents: (nodeId: string) => Promise<void>;
  preloadAllContents: (focusNodeId?: string) => Promise<void>;
  addNodeContent: (nodeId: string, content: unknown) => void;
  removeNodeContent: (nodeId: string, contentId: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [nodeContents, setNodeContents] = useState<Record<string, Content[]>>({});
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedAllRef = useRef(false);

  const normalizeContent = useCallback((c: any): Content => ({
    ...c,
    type: c.type as Content['type'],
    createdAt: new Date(c.createdAt).toISOString().slice(0, 10),
  }), []);

  const groupBySkillId = useCallback((rows: any[]) => (
    rows.reduce<Record<string, Content[]>>((acc, c) => {
      const key = c.skillId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(normalizeContent(c));
      return acc;
    }, {})
  ), [normalizeContent]);

  const preloadAllContents = useCallback(async (focusNodeId?: string) => {
    if (hasLoadedAllRef.current) return;
    if (focusNodeId) setLoadingNodeId(focusNodeId);
    try {
      const { getAllContentsForLibrary } = await import('@/app/actions/library');
      const allContents = await getAllContentsForLibrary();
      const grouped = groupBySkillId(allContents as any[]);
      setNodeContents(prev => ({ ...prev, ...grouped }));
      hasLoadedAllRef.current = true;
    } catch (e) {
      console.error('[Library] Failed to preload all contents:', e);
    } finally {
      if (focusNodeId) setLoadingNodeId(null);
    }
  }, [groupBySkillId]);

  const loadNodeContents = useCallback(async (nodeId: string) => {
    if (nodeContents[nodeId] !== undefined) return;
    if (hasLoadedAllRef.current) {
      setNodeContents(prev => ({ ...prev, [nodeId]: prev[nodeId] ?? [] }));
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoadingNodeId(nodeId);

    try {
      const { getAllContentsForLibrary } = await import('@/app/actions/library');
      const allContents = await getAllContentsForLibrary();
      if (controller.signal.aborted) return;

      const grouped = groupBySkillId(allContents as any[]);
      setNodeContents(prev => ({
        ...prev,
        ...grouped,
        [nodeId]: grouped[nodeId] ?? [],
      }));
      hasLoadedAllRef.current = true;
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      try {
        const { getContentsBySkill } = await import('@/app/actions/library');
        const updated = await getContentsBySkill(nodeId);
        if (!controller.signal.aborted) {
          setNodeContents(prev => ({
            ...prev,
            [nodeId]: (updated as any[]).map(normalizeContent),
          }));
        }
      } catch (fallbackError) {
        console.error('[Library] Failed to load node contents:', fallbackError);
      }
    } finally {
      if (!controller.signal.aborted) setLoadingNodeId(null);
    }
  }, [nodeContents, normalizeContent, groupBySkillId]);

  const refreshNodeContents = useCallback(async (nodeId: string) => {
    setLoadingNodeId(nodeId);
    try {
      const { getContentsBySkill } = await import('@/app/actions/library');
      const updated = await getContentsBySkill(nodeId);
      setNodeContents(prev => ({
        ...prev,
        [nodeId]: (updated as any[]).map(normalizeContent),
      }));
    } finally {
      setLoadingNodeId(null);
    }
  }, [normalizeContent]);

  const addNodeContent = useCallback((nodeId: string, content: unknown) => {
    const normalized = normalizeContent(content);
    setNodeContents(prev => {
      const current = prev[nodeId] ?? [];
      return {
        ...prev,
        [nodeId]: [...current, normalized],
      };
    });
  }, [normalizeContent]);

  const removeNodeContent = useCallback((nodeId: string, contentId: string) => {
    setNodeContents(prev => {
      const current = prev[nodeId];
      if (!current) return prev;
      return {
        ...prev,
        [nodeId]: current.filter(c => c.id !== contentId),
      };
    });
  }, []);

  return (
    <LibraryContext.Provider value={{
      nodeContents,
      loadingNodeId,
      loadNodeContents,
      refreshNodeContents,
      preloadAllContents,
      addNodeContent,
      removeNodeContent,
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within LibraryProvider');
  return context;
}
