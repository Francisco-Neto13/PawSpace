import { Node, Edge } from '@xyflow/react';
import { SkillData } from '../components/tree/types';

const RADIUS_STEP = 280;

export function generateTreeLayout(
  tree: any,
  parentId: string | null = null,
  startAngle: number = 0,
  endAngle: number = 360,
  level: number = 0
) {
  let nodes: Node<SkillData>[] = [];
  let edges: Edge[] = [];

  const keys = Object.keys(tree);
  if (keys.length === 0) return { nodes, edges };

  const angleStep = (endAngle - startAngle) / keys.length;

  keys.forEach((key, index) => {
    const skill = tree[key];
    const id = parentId ? `${parentId}-${key}` : key;
    
    const currentAngle = startAngle + angleStep * index + angleStep / 2;
    const angleRad = (currentAngle * Math.PI) / 180;
    const radius = level * RADIUS_STEP;

    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;
    
    const isUnlockedInitial = level === 0;

    nodes.push({
      id,
      type: 'skill',
      position: { x, y },
      data: {
        label: skill.label,
        icon: skill.icon || '🔹',
        category: skill.category || 'keystone',
        isUnlocked: isUnlockedInitial, 
        description: skill.description || 'No description provided.',
        parentId: parentId || undefined,
        links: skill.links || [], 
      },
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'skill',
        data: { 
          unlocked: isUnlockedInitial, 
          category: skill.category 
        }
      });
    }

    if (skill.children) {
      const { nodes: childNodes, edges: childEdges } = generateTreeLayout(
        skill.children,
        id,
        startAngle + angleStep * index,
        startAngle + angleStep * (index + 1),
        level + 1
      );
      nodes = [...nodes, ...childNodes];
      edges = [...edges, ...childEdges];
    }
  });

  return { nodes, edges };
}

export function calculateRecursiveProgress(nodes: Node<SkillData>[], edges: Edge[]): Node<SkillData>[] {
  const getDescendantIds = (parentId: string): string[] => {
    const directChildren = edges
      .filter((e) => e.source === parentId)
      .map((e) => e.target);

    let descendants = [...directChildren];
    directChildren.forEach((childId) => {
      descendants = [...descendants, ...getDescendantIds(childId)];
    });
    
    return descendants;
  };

  return nodes.map((node) => {
    const descendantIds = getDescendantIds(node.id);

    if (descendantIds.length === 0) {
      return { ...node, data: { ...node.data, progress: 0 } };
    }

    const unlockedCount = nodes.filter(
      (n) => descendantIds.includes(n.id) && n.data.isUnlocked
    ).length;

    return {
      ...node,
      data: {
        ...node.data,
        progress: unlockedCount / descendantIds.length,
      },
    };
  });
}