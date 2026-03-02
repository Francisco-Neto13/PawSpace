'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Content } from '@/components/library/types';

interface LibraryContextType {
  nodeContents: Record<string, Content[]>;
  loadingNodeId: string | null;
  loadNodeContents: (nodeId: string) => Promise<void>;
  refreshNodeContents: (nodeId: string) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [nodeContents, setNodeContents] = useState<Record<string, Content[]>>({});
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadNodeContents = useCallback(async (nodeId: string) => {
    if (nodeContents[nodeId] !== undefined) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoadingNodeId(nodeId);

    try {
      const { getContentsBySkill } = await import('@/app/actions/library');
      const updated = await getContentsBySkill(nodeId);

      if (!controller.signal.aborted) {
        setNodeContents(prev => ({
          ...prev,
          [nodeId]: updated.map(c => ({
            ...c,
            type: c.type as Content['type'],
            createdAt: new Date(c.createdAt).toISOString().slice(0, 10),
          })),
        }));
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error('❌ [Library] Erro ao carregar conteúdos:', e);
    } finally {
      if (!controller.signal.aborted) setLoadingNodeId(null);
    }
  }, [nodeContents]);

  const refreshNodeContents = useCallback(async (nodeId: string) => {
    setLoadingNodeId(nodeId);
    try {
      const { getContentsBySkill } = await import('@/app/actions/library');
      const updated = await getContentsBySkill(nodeId);
      setNodeContents(prev => ({
        ...prev,
        [nodeId]: updated.map(c => ({
          ...c,
          type: c.type as Content['type'],
          createdAt: new Date(c.createdAt).toISOString().slice(0, 10),
        })),
      }));
    } finally {
      setLoadingNodeId(null);
    }
  }, []);

  return (
    <LibraryContext.Provider value={{ nodeContents, loadingNodeId, loadNodeContents, refreshNodeContents }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary deve ser usado dentro de um LibraryProvider');
  return context;
}