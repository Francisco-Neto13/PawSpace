'use client';
import { useCallback, useEffect } from 'react';
import type { Edge } from '@xyflow/react';
import { useNexus, type SkillNode } from '@/contexts/NexusContext';
import type { SkillData, SkillShape } from '@/components/tree/types';
import { updateSkill, saveNexusChanges, deleteSkill, addSkill } from '@/app/actions/skills';
import { getNewChildPosition } from '@/utils/treeUtils';
import { useConfirmDialog } from '@/shared/contexts/ConfirmDialogContext';

interface SkillPreviewDetail {
  skillId: string;
  label?: string;
  color?: string;
  icon?: string;
}

export function useSkillActions() {
  const { nodes, edges, setNodes, setEdges, refreshNexus, originalNodeIds } = useNexus();
  const confirmDialog = useConfirmDialog();

  useEffect(() => {
    const handlePreview = (e: Event) => {
      const detail = (e as CustomEvent<SkillPreviewDetail>).detail;
      if (!detail?.skillId) return;

      const { skillId, label, color, icon } = detail;

      setNodes((prev) => prev.map((n) =>
        n.id === skillId
          ? ({
              ...n,
              data: {
                ...n.data,
                ...(label !== undefined ? { label, name: label } : {}),
                ...(color !== undefined ? { color } : {}),
                ...(icon !== undefined ? { icon } : {}),
              },
            } as SkillNode)
          : n
      ));
    };

    window.addEventListener('skill-preview', handlePreview);
    return () => window.removeEventListener('skill-preview', handlePreview);
  }, [setNodes]);

  const handleDelete = useCallback(async (nodeId: string) => {
    const node = nodes.find((item) => item.id === nodeId);
    const isConfirmed = await confirmDialog({
      title: 'Remover módulo',
      description: `O módulo "${node?.data.label || node?.data.name || 'Sem nome'}" e todas as conexões serão removidos.`,
      confirmLabel: 'Remover',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    });
    if (!isConfirmed) return false;
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    return true;
  }, [confirmDialog, nodes, setNodes, setEdges]);

  const handleCreateQuickSkill = useCallback((parentId: string | null) => {
    let positionX = 0;
    let positionY = 0;
    const parentNode = parentId ? nodes.find((n) => n.id === parentId) : null;

    if (parentNode) {
      const siblingCount = edges.filter((e) => e.source === parentId).length;
      const pos = getNewChildPosition(parentNode.position.x, parentNode.position.y, siblingCount);
      positionX = pos.x;
      positionY = pos.y;
    }

    const tempId = `temp-${Date.now()}`;

    const newData: SkillData = {
      id: tempId,
      name: 'Novo Módulo',
      label: 'Novo Módulo',
      description: 'Defina os objetivos deste módulo.',
      icon: '*',
      color: null,
      shape: 'hexagon' as SkillShape,
      category: 'keystone',
      parentId: parentId ?? undefined,
      positionX,
      positionY,
      progress: 0,
      userId: '',
    };

    const tempNode: SkillNode = {
      id: tempId,
      type: 'skill',
      position: { x: positionX, y: positionY },
      data: newData,
    };

    setNodes((nds) => [...nds, tempNode]);

    if (parentId) {
      const edge: Edge = {
        id: `e-${parentId}-${tempId}`,
        source: parentId,
        target: tempId,
        type: 'skill',
        data: {
          category: parentNode?.data.category ?? 'keystone',
        },
      };
      setEdges((eds) => [...eds, edge]);
    }

    return tempId;
  }, [nodes, edges, setNodes, setEdges]);

  const handleUpdateSkill = useCallback(async (skillId: string, data: Partial<SkillData>) => {
    setNodes((prev) => prev.map((n) =>
      n.id === skillId
        ? ({
            ...n,
            data: {
              ...n.data,
              ...data,
              label: data.name || data.label || n.data.label,
            },
          } as SkillNode)
        : n
    ));

    if (skillId.startsWith('temp-')) return;

    const result = await updateSkill(skillId, data);
    if (!result.success) {
      console.error('[SkillActions] Erro ao atualizar skill, recarregando...');
      await refreshNexus();
    }
  }, [setNodes, refreshNexus]);

  const handleGlobalSave = useCallback(async () => {
    try {
      const currentIds = new Set(nodes.map((n) => n.id));

      const toCreate = nodes.filter((n) => n.id.startsWith('temp-'));
      const toDelete = [...originalNodeIds.current].filter((id) => !currentIds.has(id));
      const toUpdate = nodes.filter((n) => !n.id.startsWith('temp-'));

      const tempToReal: Record<string, string> = {};
      for (const node of toCreate) {
        const result = await addSkill({
          name: node.data.name,
          description: node.data.description || '',
          icon: node.data.icon,
          color: node.data.color,
          shape: node.data.shape,
          category: typeof node.data.category === 'string' ? node.data.category : 'keystone',
          parentId: node.data.parentId || null,
          positionX: node.position.x,
          positionY: node.position.y,
        });

        if (!result.success) {
          const msg = 'error' in result && typeof result.error === 'string'
            ? result.error
            : 'Erro ao criar módulo.';
          alert(msg);
          return false;
        }

        if (result.skill) {
          tempToReal[node.id] = result.skill.id;
        }
      }

      for (const id of toDelete) {
        await deleteSkill(id);
      }

      if (toUpdate.length > 0) {
        await saveNexusChanges(toUpdate);
      }

      if (Object.keys(tempToReal).length > 0) {
        setNodes((prev) => prev.map((n) => {
          const realId = tempToReal[n.id];
          if (!realId) return n;
          return { ...n, id: realId, data: { ...n.data, id: realId } } as SkillNode;
        }));
        setEdges((prev) => prev.map((e) => ({
          ...e,
          id: tempToReal[e.target] ? `e-${e.source}-${tempToReal[e.target]}` : e.id,
          target: tempToReal[e.target] || e.target,
          source: tempToReal[e.source] || e.source,
        })));
      }

      return true;
    } catch (error) {
      console.error('[SkillActions] Erro no save global:', error);
      alert('Erro ao sincronizar mudancas.');
      return false;
    }
  }, [nodes, setNodes, setEdges, originalNodeIds]);

  return {
    handleDelete,
    handleCreateQuickSkill,
    handleUpdateSkill,
    handleGlobalSave,
  };
}
