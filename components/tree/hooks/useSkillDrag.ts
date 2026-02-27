'use client';
import { useCallback, useState } from 'react';
import { applyNodeChanges, type OnNodesChange, type Node } from '@xyflow/react';
import { useSkillTreeContext } from '../context/SkillTreeContext';
import { SkillData } from '../types';
import { updateManySkillPositions } from '@/app/actions/skills';

export function useSkillDrag() {
  const { setNodes } = useSkillTreeContext();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onNodesChange: OnNodesChange<Node<SkillData>> = useCallback((changes) => {
    setNodes(nds => applyNodeChanges(changes, nds));

    const positionChange = changes.find(
      c => c.type === 'position' && c.dragging === false && c.position
    );

    if (positionChange) {
      setHasUnsavedChanges(true);
    }
  }, [setNodes]);

  const saveLayout = useCallback(async (nodes: Node<SkillData>[]) => {
    if (nodes.length === 0) return;

    setIsSaving(true);

    const payload = nodes.map(n => ({
      skillId: n.id,
      x: Math.round(n.position.x),
      y: Math.round(n.position.y),
    }));

    try {
      const result = await updateManySkillPositions(payload);

      if (!result.success) {
        throw new Error('Falha na sincronização do Nexus');
      }

      setHasUnsavedChanges(false);
      
      console.log('[Nexus] Layout sincronizado com sucesso.');
    } catch (err) {
      console.error('[Nexus] Erro ao salvar layout:', err);

      setHasUnsavedChanges(true);
      alert('Sincronização Falhou: Verifique sua conexão com o Nexus.');
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { onNodesChange, hasUnsavedChanges, isSaving, saveLayout };
}