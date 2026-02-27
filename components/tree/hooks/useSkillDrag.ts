'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Importar o router
import { applyNodeChanges, type OnNodesChange, type Node } from '@xyflow/react';
import { useSkillTreeContext } from '../context/SkillTreeContext';
import { SkillData } from '../types';
import { updateManySkillPositions } from '@/app/actions/skills';

export function useSkillDrag() {
  const { setNodes } = useSkillTreeContext();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter(); 

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
    setHasUnsavedChanges(false);

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

      router.refresh(); 

      console.log('✅ Layout sincronizado e cache atualizado');
    } catch (err) {
      console.error('❌ Erro ao salvar layout:', err);
      setHasUnsavedChanges(true);
      alert('Sistema Nexus: Falha na sincronização.');
    } finally {
      setIsSaving(false);
    }
  }, [router]);

  return { onNodesChange, hasUnsavedChanges, isSaving, saveLayout };
}