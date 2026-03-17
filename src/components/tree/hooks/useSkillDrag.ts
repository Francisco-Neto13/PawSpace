'use client';
import { useState, useCallback, useRef } from 'react';
import { applyNodeChanges, type OnNodesChange, type NodeChange } from '@xyflow/react';
import { usePawSpace, type SkillNode } from '@/contexts/PawSpaceContext';

export function useSkillDrag() {
  const { setNodes } = usePawSpace();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasUnsavedChangesRef = useRef(false);

  const onNodesChange: OnNodesChange<SkillNode> = useCallback(
    (changes: NodeChange<SkillNode>[]) => {
      const isRealMovement = changes.some(
        (c) => c.type === 'position' && 'dragging' in c && c.dragging === true
      );
      if (isRealMovement && !hasUnsavedChangesRef.current) {
        hasUnsavedChangesRef.current = true;
        setHasUnsavedChanges(true);
      }
      setNodes((nds) => applyNodeChanges<SkillNode>(changes, nds));
    },
    [setNodes]
  );

  const resetDirty = useCallback(() => {
    hasUnsavedChangesRef.current = false;
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
