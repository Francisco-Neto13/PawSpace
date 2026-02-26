import { Node, Edge } from '@xyflow/react';
import { SkillData, SkillCategory } from '../components/tree/types';
import type { SkillRow } from '@/app/actions/skills';

const X_OFFSET = 250;
const Y_OFFSET = 180;


type SkillNode = SkillRow & { children: SkillNode[] };

export function buildHierarchy(skills: SkillRow[]): SkillNode[] {
  const map = new Map<string, SkillNode>();

  skills.forEach(skill => {
    map.set(skill.id, { ...skill, children: [] });
  });

  const roots: SkillNode[] = [];

  skills.forEach(skill => {
    const node = map.get(skill.id)!;
    if (skill.parentId && map.has(skill.parentId)) {
      map.get(skill.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function getSubtreeWidth(node: SkillNode): number {
  if (node.children.length === 0) return 1;
  return node.children.reduce((acc, child) => acc + getSubtreeWidth(child), 0);
}

export function generateTreeLayout(
  treeArray: SkillNode[],
  parentId: string | null = null,
  level: number = 0,
  startX: number = 0
): { nodes: Node<SkillData>[]; edges: Edge[] } {
  let nodes: Node<SkillData>[] = [];
  let edges: Edge[] = [];
  let currentX = startX;

  treeArray.forEach(skill => {
    const subtreeWidth = getSubtreeWidth(skill);
    const x = currentX + (subtreeWidth * X_OFFSET) / 2 - X_OFFSET / 2;
    const y = level * Y_OFFSET;

    const savedX = skill.positionX ?? 0;
    const savedY = skill.positionY ?? 0;
    const hasSavedPosition = savedX !== 0 || savedY !== 0;
    const finalX = hasSavedPosition ? savedX : x;
    const finalY = hasSavedPosition ? savedY : y;

    nodes.push({
      id: skill.id,
      type: 'skill',
      position: { x: finalX, y: finalY },
      data: {
        id: skill.id,
        userId: skill.userId,
        name: skill.name,
        positionX: x,
        positionY: y,
        label: skill.name,
        icon: skill.icon ?? '🔹',
        category: (skill.category ?? 'keystone') as SkillCategory,
        isUnlocked: skill.isUnlocked,
        description: skill.description ?? '',
        parentId: parentId ?? undefined,
        links: skill.contents ?? [],
      },
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${skill.id}`,
        source: parentId,
        target: skill.id,
        type: 'skill',
        data: {
          unlocked: skill.isUnlocked,
          category: skill.category,
        },
      });
    }

    if (skill.children.length > 0) {
      const childLayout = generateTreeLayout(skill.children, skill.id, level + 1, currentX);
      nodes = [...nodes, ...childLayout.nodes];
      edges = [...edges, ...childLayout.edges];
    }

    currentX += subtreeWidth * X_OFFSET;
  });

  return { nodes, edges };
}

export function calculateRecursiveProgress(
  nodes: Node<SkillData>[],
  edges: Edge[]
): Node<SkillData>[] {
  const getDescendantIds = (parentId: string): string[] => {
    const children = edges.filter(e => e.source === parentId).map(e => e.target);
    return children.reduce<string[]>(
      (acc, childId) => [...acc, childId, ...getDescendantIds(childId)],
      []
    );
  };

  return nodes.map(node => {
    const descendantIds = getDescendantIds(node.id);
    if (descendantIds.length === 0) return { ...node, data: { ...node.data, progress: 0 } };

    const unlockedCount = nodes.filter(
      n => descendantIds.includes(n.id) && n.data.isUnlocked
    ).length;

    return {
      ...node,
      data: { ...node.data, progress: unlockedCount / descendantIds.length },
    };
  });
}

export function calculateGlobalProgress(nodes: Node<SkillData>[]): number {
  if (nodes.length === 0) return 0;
  const unlocked = nodes.filter(n => n.data.isUnlocked).length;
  return Math.round((unlocked / nodes.length) * 100);
}