'use client';
import { useCallback, useEffect } from 'react';
import { useNexus, SkillNode } from '@/contexts/NexusContext';
import { SkillData } from '@/components/tree/types';
import { toggleSkillStatus, updateSkill, saveNexusChanges, deleteSkill, addSkill } from '@/app/actions/skills';
import { calculateRecursiveProgress, getNewChildPosition } from '@/utils/treeUtils';
import { SkillShape } from '../types';
import { Edge } from '@xyflow/react';

export function useSkillActions() {
  const { nodes, edges, setNodes, setEdges, refreshNexus, originalNodeIds } = useNexus();

  useEffect(() => {
    const handlePreview = (e: Event) => {
      const { skillId, label, color, icon } = (e as CustomEvent).detail;
      if (!skillId) return;

      setNodes((prev) => prev.map(n =>
        n.id === skillId
          ? ({
              ...n,
              data: {
                ...n.data,
                ...(label !== undefined && { label, name: label }),
                ...(color !== undefined && { color }),
                ...(icon  !== undefined && { icon }),
              },
            } as SkillNode)
          : n
      ));
    };

    window.addEventListener('skill-preview', handlePreview);
    return () => window.removeEventListener('skill-preview', handlePreview);
  }, [setNodes]);

  const handleToggleStatus = useCallback(async (nodeId: string) => {
    const target = nodes.find(n => n.id === nodeId);
    if (!target) return;

    const currentlyUnlocked = target.data.isUnlocked;

    if (currentlyUnlocked) {
      const childIds = edges.filter(e => e.source === nodeId).map(e => e.target);
      const hasActiveChildren = nodes.some(n => childIds.includes(n.id) && n.data.isUnlocked);
      if (hasActiveChildren) {
        alert('ACCESS DENIED: Dependências ativas detectadas.');
        return;
      }
    }

    const nextUnlocked = !currentlyUnlocked;

    setNodes((prev) => {
      const nextNodes = prev.map(n =>
        n.id === nodeId ? ({ ...n, data: { ...n.data, isUnlocked: nextUnlocked } } as SkillNode) : n
      );

      const finalNodes = calculateRecursiveProgress(nextNodes as any, edges);

      setEdges((prevEdges: Edge[]) =>
        prevEdges.map(edge => ({
          ...edge,
          data: {
            ...edge.data,
            unlocked: !!(finalNodes as any[]).find(n => n.id === edge.target)?.data.isUnlocked,
          },
        }))
      );

      return finalNodes as SkillNode[];
    });

    const result = await toggleSkillStatus(nodeId, nextUnlocked);
    if (!result.success) {
      await refreshNexus();
    }
  }, [nodes, edges, setNodes, setEdges, refreshNexus]);

  const handleDelete = useCallback((nodeId: string) => {
    if (!confirm('Eliminar este nó e todos os protocolos dependentes?')) return;
    setNodes((prev) => prev.filter(n => n.id !== nodeId));
    setEdges((prev) => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleCreateQuickSkill = useCallback((parentId: string | null) => {
    let positionX = 0, positionY = 0;
    const parentNode = parentId ? nodes.find(n => n.id === parentId) : null;

    if (parentNode) {
      const siblingCount = edges.filter(e => e.source === parentId).length;
      const pos = getNewChildPosition(parentNode.position.x, parentNode.position.y, siblingCount);
      positionX = pos.x;
      positionY = pos.y;
    }

    const tempId = `temp-${Date.now()}`;

    const newData: SkillData = {
      id: tempId,
      name: 'Novo Protocolo',
      label: 'Novo Protocolo',
      description: 'Defina as diretrizes deste nó.',
      icon: '⚡',
      color: '#c8b89a',
      shape: 'hexagon' as SkillShape,
      category: 'keystone' as any,
      isUnlocked: false,
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
      setEdges((eds) => [...eds, {
        id: `e-${parentId}-${tempId}`,
        source: parentId,
        target: tempId,
        type: 'skill',
        data: {
          unlocked: false,
          category: parentNode?.data.category ?? 'keystone',
        },
      }] as Edge[]);
    }

    return tempId;
  }, [nodes, edges, setNodes, setEdges]);

  const handleUpdateSkill = useCallback(async (skillId: string, data: Partial<SkillData>) => {
    setNodes((prev) => prev.map(n =>
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

    const result = await updateSkill(skillId, data);
    if (!result.success) {
      console.error('❌ [SkillActions] Erro ao atualizar skill, recarregando...');
      await refreshNexus();
    }
  }, [setNodes, refreshNexus]);

  const handleGlobalSave = useCallback(async () => {
    try {
      const currentIds = new Set(nodes.map(n => n.id));

      const toCreate = nodes.filter(n => n.id.startsWith('temp-'));

      const toDelete = [...originalNodeIds.current].filter(id => !currentIds.has(id));

      const toUpdate = nodes.filter(n => !n.id.startsWith('temp-'));

      const tempToReal: Record<string, string> = {};
      for (const node of toCreate) {
        const result = await addSkill({
          name: node.data.name,
          description: node.data.description || '',
          icon: node.data.icon,
          color: node.data.color,
          shape: node.data.shape as string,
          category: node.data.category as string,
          parentId: node.data.parentId || null,
          positionX: node.position.x,
          positionY: node.position.y,
        });

        if (result.success && result.skill) {
          tempToReal[node.id] = result.skill.id;
        }
      }

      for (const id of toDelete) {
        await deleteSkill(id);
      }

      if (toUpdate.length > 0) {
        await saveNexusChanges(toUpdate as any);
      }

      if (Object.keys(tempToReal).length > 0) {
        setNodes(prev => prev.map(n => {
          const realId = tempToReal[n.id];
          if (!realId) return n;
          return { ...n, id: realId, data: { ...n.data, id: realId } } as SkillNode;
        }));
        setEdges(prev => prev.map(e => ({
          ...e,
          id: tempToReal[e.target] ? `e-${e.source}-${tempToReal[e.target]}` : e.id,
          target: tempToReal[e.target] || e.target,
          source: tempToReal[e.source] || e.source,
        })));
      }

      return true;
    } catch (error) {
      console.error('❌ [SkillActions] Erro no save global:', error);
      alert('Erro ao sincronizar mudanças.');
      return false;
    }
  }, [nodes, setNodes, setEdges, refreshNexus]);

  return {
    handleToggleStatus,
    handleDelete,
    handleCreateQuickSkill,
    handleUpdateSkill,
    handleGlobalSave,
  };
}