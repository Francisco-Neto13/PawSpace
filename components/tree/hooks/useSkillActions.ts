'use client';
import { useCallback, useEffect } from 'react';
import { useNexus, SkillNode, SkillData } from '@/contexts/NexusContext'; 
import { toggleSkillStatus, deleteSkill, addSkill, saveNexusChanges } from '@/app/actions/skills';
import { calculateRecursiveProgress, getNewChildPosition } from '@/utils/treeUtils';
import { SkillShape } from '../types';
import { Edge, Node } from '@xyflow/react';

export function useSkillActions() {
  const { nodes, edges, setNodes, setEdges, refreshNexus } = useNexus();

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

  const handleDelete = useCallback(async (nodeId: string) => {
    if (!confirm('Eliminar este nó e todos os protocolos dependentes?')) return;

    setNodes((prev) => prev.filter(n => n.id !== nodeId));
    setEdges((prev) => prev.filter(e => e.source !== nodeId && e.target !== nodeId));

    const result = await deleteSkill(nodeId);
    if (!result.success) {
      alert('Erro na sincronização. Recarregando Nexus...');
      await refreshNexus();
    }
  }, [setNodes, setEdges, refreshNexus]);

  const handleCreateQuickSkill = useCallback(async (parentId: string | null) => {
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

    const result = await addSkill({
      name: newData.name,
      description: newData.description || '',
      icon: newData.icon,
      color: newData.color,
      shape: newData.shape as string,
      category: newData.category as string,
      parentId,
      positionX,
      positionY,
    });

    if (result.success && result.skill) {
      const s = result.skill;
      setNodes((nds) => nds.map(n =>
        n.id === tempId
          ? ({ ...n, id: s.id, data: { ...n.data, id: s.id } } as SkillNode)
          : n
      ));
      setEdges((eds) => eds.map(e => ({
        ...e,
        id: e.id.includes(tempId) ? `e-${parentId}-${s.id}` : e.id,
        target: e.target === tempId ? s.id : e.target,
      })));
      return s.id;
    } else {
      await refreshNexus();
      return null;
    }
  }, [nodes, edges, setNodes, setEdges, refreshNexus]);

  const handleUpdateSkill = useCallback(async (skillId: string, data: Partial<SkillData>) => {
    setNodes((prev) => prev.map(n =>
      n.id === skillId
        ? ({ 
            ...n, 
            data: { 
              ...n.data, 
              ...data, 
              label: data.name || data.label || n.data.label 
            } 
          } as SkillNode)
        : n
    ));
  }, [setNodes]);

  const handleGlobalSave = useCallback(async () => {
    const result = await saveNexusChanges(nodes as any);
    if (!result.success) {
      alert('Erro ao sincronizar mudanças.');
    }
    return result.success;
  }, [nodes]);

  return {
    handleToggleStatus,
    handleDelete,
    handleCreateQuickSkill,
    handleUpdateSkill,
    handleGlobalSave,
  };
}