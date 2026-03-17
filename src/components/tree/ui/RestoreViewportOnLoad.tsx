'use client';

import { useEffect, useRef } from 'react';
import { useNodesInitialized, useReactFlow } from '@xyflow/react';

import type { SkillNode } from '@/contexts/PawSpaceContext';

export const VIEWPORT_STORAGE_KEY = 'pawspace.tree.viewport.v1';

interface RestoreViewportOnLoadProps {
  nodes: SkillNode[];
  isLoading: boolean;
}

export function RestoreViewportOnLoad({ nodes, isLoading }: RestoreViewportOnLoadProps) {
  const { fitView, setViewport } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    if (isLoading || nodes.length === 0 || hasRestoredRef.current || !nodesInitialized) return;

    try {
      const raw = window.localStorage.getItem(VIEWPORT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { x?: number; y?: number; zoom?: number };
        if (
          Number.isFinite(parsed.x) &&
          Number.isFinite(parsed.y) &&
          Number.isFinite(parsed.zoom)
        ) {
          setViewport(
            { x: parsed.x as number, y: parsed.y as number, zoom: parsed.zoom as number },
            { duration: 0 }
          );
          hasRestoredRef.current = true;
          return;
        }
      }
    } catch {
      // Ignora erro de leitura/parsing do estado salvo e segue com fallback.
    }

    const rootNode = nodes.find((node) => !node.data.parentId);
    if (!rootNode) {
      hasRestoredRef.current = true;
      return;
    }

    const raf = requestAnimationFrame(() => {
      fitView({ nodes: [rootNode], padding: 0.4, maxZoom: 1 });
      hasRestoredRef.current = true;
    });

    return () => cancelAnimationFrame(raf);
  }, [fitView, isLoading, nodes, nodesInitialized, setViewport]);

  return null;
}
