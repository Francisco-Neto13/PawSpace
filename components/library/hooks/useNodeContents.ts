'use client';
import { useState } from 'react';
import { Content } from '../types';

export function useNodeContents() {
  const [nodeContents, setNodeContents] = useState<Record<string, Content[]>>({});
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);

  const loadNodeContents = async (
    nodeId: string,
    cache: Record<string, Content[]> = nodeContents
  ) => {
    if (cache[nodeId] !== undefined) return;
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