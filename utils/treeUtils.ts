import { Node, Edge } from '@xyflow/react';
import { SkillData } from '../components/tree/types';

const X_OFFSET = 140; 
const Y_OFFSET = 160;

function getSubtreeWidth(node: any): number {
  if (!node.children || Object.keys(node.children).length === 0) {
    return 1;
  }
  return Object.values(node.children).reduce(
    (acc: number, child: any) => acc + getSubtreeWidth(child),
    0
  );
}

export function generateTreeLayout(
  tree: any,
  parentId: string | null = null,
  level: number = 0,
  startX: number = 0
) {
  let nodes: Node<SkillData>[] = [];
  let edges: Edge[] = [];

  const keys = Object.keys(tree);
  let currentX = startX;

  keys.forEach((key) => {
    const skill = tree[key];
    const id = parentId ? `${parentId}-${key}` : key;
    
    const subtreeWidth = getSubtreeWidth(skill);
    
    const x = currentX + (subtreeWidth * X_OFFSET) / 2 - X_OFFSET / 2;
    const y = level * Y_OFFSET;

    const isUnlockedInitial = id === 'nexus';

    nodes.push({
      id,
      type: 'skill',
      position: { x, y },
      data: {
        label: skill.label,
        icon: skill.icon || '🔹',
        category: skill.category || 'keystone',
        isUnlocked: isUnlockedInitial, 
        description: skill.description || '',
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
      const childLayout = generateTreeLayout(
        skill.children,
        id,
        level + 1,
        currentX
      );
      nodes = [...nodes, ...childLayout.nodes];
      edges = [...edges, ...childLayout.edges];
    }

    currentX += subtreeWidth * X_OFFSET;
  });

  return { nodes, edges };
}

export function calculateRecursiveProgress(nodes: Node<SkillData>[], edges: Edge[]): Node<SkillData>[] {
  const getDescendantIds = (parentId: string): string[] => {
    const directChildren = edges.filter((e) => e.source === parentId).map((e) => e.target);
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

export function calculateGlobalProgress(nodes: Node<SkillData>[]): number {
  if (nodes.length === 0) return 0;
  const unlockedCount = nodes.filter((n) => n.data.isUnlocked).length;
  return Math.round((unlockedCount / nodes.length) * 100);
}