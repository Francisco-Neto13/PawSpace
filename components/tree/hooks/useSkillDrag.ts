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

      setNodes((nds) => {
        return applyNodeChanges(changes, nds as any) as any;
      });
    },
    [setNodes]
  );

  const saveLayout = async (currentNodes: any[]) => {
    setIsSaving(true);
    try {
      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      console.error('❌ [useSkillDrag] Erro ao processar layout:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    onNodesChange,
    hasUnsavedChanges,
    isSaving,
    saveLayout,
  };
}