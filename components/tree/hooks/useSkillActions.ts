'use client';
import { useCallback, useEffect } from 'react';
import { useSkillTreeContext } from '../context/SkillTreeContext';
import { toggleSkillStatus, deleteSkill, addSkill, saveNexusChanges } from '@/app/actions/skills';
import { calculateRecursiveProgress, getNewChildPosition } from '@/utils/treeUtils';
import { SkillShape } from '../types';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export function useSkillActions() {
  const { nodes, edges, setNodes, setEdges, loadTreeData } = useSkillTreeContext();

  useEffect(() => {
    const handlePreview = (e: Event) => {
      const { skillId, label, color, icon } = (e as CustomEvent).detail;
      if (!skillId) return;
      setNodes(prev => prev.map(n =>
        n.id === skillId
          ? {
              ...n,
              data: {
                ...n.data,
                ...(label !== undefined && { label, name: label }),
                ...(color !== undefined && { color }),
                ...(icon  !== undefined && { icon }),
              },
            }
          : n
      ));
    };

    window.addEventListener('skill-preview', handlePreview);
    return () => window.removeEventListener('skill-preview', handlePreview);
  }, [setNodes]);

  const handleToggleStatus = useCallback((nodeId: string) => {
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

    setNodes(prev => {
      const nextNodes = prev.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, isUnlocked: nextUnlocked } } : n
      );
      const finalNodes = calculateRecursiveProgress(nextNodes, edges);
      setEdges(prevEdges =>
        prevEdges.map(edge => ({
          ...edge,
          data: {
            ...edge.data,
            unlocked: !!finalNodes.find(n => n.id === edge.target)?.data.isUnlocked,
          },
        }))
      );
      return finalNodes;
    });

    toggleSkillStatus(nodeId, nextUnlocked).then(result => {
      if (!result.success) loadTreeData();
    });
  }, [nodes, edges, setNodes, setEdges, loadTreeData]);

  const handleDelete = useCallback(async (nodeId: string) => {
    if (!confirm('Eliminar este nó e todos os protocolos dependentes?')) return;

    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));

    const result = await deleteSkill(nodeId);
    if (!result.success) {
      alert('Erro na sincronização. Recarregando Nexus...');
      loadTreeData();
    }
  }, [setNodes, setEdges, loadTreeData]);

  const handleCreateQuickSkill = useCallback(async (parentId: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    let positionX = 0, positionY = 0;
    const parentNode = parentId ? nodes.find(n => n.id === parentId) : null;

    if (parentNode) {
      const siblingCount = edges.filter(e => e.source === parentId).length;
      const pos = getNewChildPosition(parentNode.position.x, parentNode.position.y, siblingCount);
      positionX = pos.x;
      positionY = pos.y;
    }

    const tempId = `temp-${Date.now()}`;
    const tempNode = {
      id: tempId,
      type: 'skill',
      position: { x: positionX, y: positionY },
      data: {
        id: tempId,
        userId: user.id,
        name: 'Novo Protocolo',
        label: 'Novo Protocolo',
        description: 'Defina as diretrizes deste nó através do menu de edição.',
        icon: '⚡',
        color: '#c8b89a',
        shape: 'hexagon' as SkillShape,
        category: 'keystone' as any,
        isUnlocked: false,
        parentId: parentId ?? undefined,
        positionX,
        positionY,
        progress: 0,
      },
    };

    setNodes(nds => [...nds, tempNode as any]);

    if (parentId) {
      setEdges(eds => [...eds, {
        id: `e-${parentId}-${tempId}`,
        source: parentId,
        target: tempId,
        type: 'skill',
        data: {
          unlocked: false,
          category: parentNode?.data.category ?? 'keystone',
        },
      } as any]);
    }

    const result = await addSkill({
      name: 'Novo Protocolo',
      description: 'Defina as diretrizes deste nó através do menu de edição.',
      icon: '⚡',
      color: '#c8b89a',
      shape: 'hexagon',
      category: 'keystone',
      parentId,
      userId: user.id,
      positionX,
      positionY,
    });

    if (result.success && result.skill) {
      const s = result.skill;
      setNodes(nds => nds.map(n =>
        n.id === tempId
          ? { ...n, id: s.id, data: { ...n.data, id: s.id } }
          : n
      ));
      setEdges(eds => eds.map(e => ({
        ...e,
        id: e.id.includes(tempId) ? `e-${parentId}-${s.id}` : e.id,
        target: e.target === tempId ? s.id : e.target,
      })));
      return s.id;
    } else {
      setNodes(nds => nds.filter(n => n.id !== tempId));
      setEdges(eds => eds.filter(e => e.target !== tempId));
      return null;
    }
  }, [nodes, edges, setNodes, setEdges]);

  const handleUpdateSkill = useCallback(async (skillId: string, data: any) => {
    setNodes(prev => prev.map(n =>
      n.id === skillId
        ? { ...n, data: { ...n.data, ...data, label: data.name || data.label || n.data.label } }
        : n
    ));
  }, [setNodes]);

  const handleGlobalSave = useCallback(async () => {
    const result = await saveNexusChanges(nodes);
    if (!result.success) {
      alert('Erro ao sincronizar mudanças com o servidor.');
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