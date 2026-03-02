'use client';
import { useState, useRef, useCallback } from 'react';
import { Content } from '../types';

export function useNodeContents() {
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
      const { getContentsBySkill } = await import('@/app/actions/contents');
      const updated = await getContentsBySkill(nodeId);

      if (!controller.signal.aborted) {
        setNodeContents(prev => ({
          ...prev,
          [nodeId]: updated.map(c => ({
            ...c,
            type: c.type as Content['type'],
            // Formatação de data simplificada
            createdAt: new Date(c.createdAt).toISOString().slice(0, 10),
          })),
        }));
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error('❌ [Library Content Error]:', e);
    } finally {
      if (!controller.signal.aborted) setLoadingNodeId(null);
    }
  }, [nodeContents]); // Depende do nodeContents para saber o que já está em cache

  const refreshNodeContents = async (nodeId: string) => {
    setLoadingNodeId(nodeId);
    try {
      const { getContentsBySkill } = await import('@/app/actions/contents');
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
  };

  return { nodeContents, loadingNodeId, loadNodeContents, refreshNodeContents };
}