'use client';
import { useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { SkillNode } from '../types';
import { getSkillsForLibrary } from '@/app/actions/skills';

const supabase = createClient();

export function useLibraryNodes(nodeIdFromUrl: string | null) {
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [isLoadingNodes, setIsLoadingNodes] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');

  const loadNodes = useCallback(async (onLoaded?: (firstNodeId: string) => void) => {
    try {
      if (nodes.length === 0) {
        setIsLoadingNodes(true);
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) { 
        setIsLoadingNodes(false); 
        return; 
      }

      const raw = await getSkillsForLibrary(session.user.id);
      
      const mapped: SkillNode[] = raw.map(s => ({
        id: s.id,
        name: s.name,
        icon: s.icon ?? '✦',
        color: s.color ?? '#c8b89a',
        isUnlocked: s.isUnlocked,
        contents: [],
      }));

      setNodes(mapped);

      const targetId = nodeIdFromUrl
        ? (mapped.find(n => n.id === nodeIdFromUrl)?.id ?? mapped[0]?.id ?? '')
        : (mapped[0]?.id ?? '');

      setSelectedNodeId(targetId);
      
      if (targetId) onLoaded?.(targetId);
      
    } catch (e) {
      console.error('❌ [Library] Erro ao carregar skills:', e);
    } finally {
      setIsLoadingNodes(false);
    }
  }, [nodeIdFromUrl, nodes.length]); 

  return { 
    nodes, 
    isLoadingNodes, 
    selectedNodeId, 
    setSelectedNodeId, 
    loadNodes 
  };
}