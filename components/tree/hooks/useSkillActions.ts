import { useCallback, useTransition } from 'react';
import { useSkillTreeContext } from '../context/SkillTreeContext';
import { toggleSkillStatus, deleteSkill, addSkill } from '@/app/actions/skills';
import { calculateRecursiveProgress, getNewChildPosition } from '@/utils/treeUtils';
import { SkillShape } from '../types';
import { createClient } from '@/utils/supabase/client';

export function useSkillActions() {
  const { nodes, edges, setNodes, setEdges, loadTreeData } = useSkillTreeContext();
  const [, startTransition] = useTransition();
  const supabase = createClient();

  const handleToggleStatus = useCallback((nodeId: string) => {
    const target = nodes.find(n => n.id === nodeId);
    if (!target) return;

    const currentlyUnlocked = target.data.isUnlocked;

    if (currentlyUnlocked) {
      const childIds = edges.filter(e => e.source === nodeId).map(e => e.target);
      const hasActiveChildren = nodes.some(n => childIds.includes(n.id) && n.data.isUnlocked);
      if (hasActiveChildren) {
        alert('ACCESS DENIED: Active dependencies detected.');
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

  const handleDelete = useCallback((nodeId: string) => {
    if (!confirm('Deletar este nó e todos os seus filhos?')) return;
    startTransition(() => {
      deleteSkill(nodeId).then(() => loadTreeData());
    });
  }, [loadTreeData]);

  const handleCreateSkill = useCallback(async (data: {
    name: string;
    description?: string;
    icon?: string;
    shape: SkillShape;
    parentId: string | null;
  }) => {
    const nameExists = nodes.some(
      n => (n.data.label || n.data.name).toLowerCase() === data.name.toLowerCase()
    );
    if (nameExists) {
      alert(`ERRO: O protocolo "${data.name}" já está registrado no Nexus.`);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let positionX = 0, positionY = 0;
    if (data.parentId) {
      const parentNode = nodes.find(n => n.id === data.parentId);
      if (parentNode) {
        const siblingCount = edges.filter(e => e.source === data.parentId).length;
        const pos = getNewChildPosition(parentNode.position.x, parentNode.position.y, siblingCount);
        positionX = pos.x;
        positionY = pos.y;
      }
    }

    const result = await addSkill({ ...data, userId: user.id, positionX, positionY });
    if (!result.success) throw new Error(String(result.error));

    await loadTreeData();
  }, [nodes, edges, supabase, loadTreeData]);

  return { handleToggleStatus, handleDelete, handleCreateSkill };
}