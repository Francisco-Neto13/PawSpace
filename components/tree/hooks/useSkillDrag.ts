import { useCallback, useRef, useState } from 'react';
import { applyNodeChanges, type OnNodesChange, type Node } from '@xyflow/react';
import { useSkillTreeContext } from '../context/SkillTreeContext';
import { SkillData } from '../types';

export function useSkillDrag() {
  const { setNodes } = useSkillTreeContext();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onNodesChange: OnNodesChange<Node<SkillData>> = useCallback((changes) => {
    setNodes(nds => applyNodeChanges(changes, nds));

    const positionChange = changes.find(
      c => c.type === 'position' && c.dragging === false && c.position
    );

    if (positionChange?.type === 'position') {
      setHasUnsavedChanges(true);
    }
  }, [setNodes]);

  const saveLayout = useCallback(async (nodes: Node<SkillData>[]) => {
    setIsSaving(true);
    try {
      await fetch('/api/skills/positions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positions: nodes.map(n => ({
            skillId: n.id,
            x: n.position.x,
            y: n.position.y,
          })),
        }),
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Erro ao salvar layout:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { onNodesChange, hasUnsavedChanges, isSaving, saveLayout };
}