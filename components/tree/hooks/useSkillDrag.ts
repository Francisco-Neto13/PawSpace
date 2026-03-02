'use client';
import { useState, useCallback } from 'react';
import { applyNodeChanges, type OnNodesChange, type NodeChange } from '@xyflow/react';
import { useNexus } from '@/contexts/NexusContext';

export function useSkillDrag() {
  const { setNodes } = useNexus();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const isRealMovement = changes.some(
        (c) => c.type === 'position' && 'dragging' in c && c.dragging === true
      );
      if (isRealMovement) {
        setHasUnsavedChanges(true);
      }
      setNodes((nds) => applyNodeChanges(changes, nds as any) as any);
    },
    [setNodes]
  );

  const resetDirty = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  return {
    onNodesChange,
    hasUnsavedChanges,
    isSaving,
    setIsSaving,
    resetDirty,
  };
}