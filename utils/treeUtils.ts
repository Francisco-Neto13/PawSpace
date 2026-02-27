import { Node, Edge } from '@xyflow/react';
import { SkillData, SkillCategory, SkillShape } from '../components/tree/types';
import type { SkillRow } from '@/app/actions/skills';

const X_OFFSET = 250;
const Y_OFFSET = 180;

type SkillNode = SkillRow & { children: SkillNode[] };

export function buildHierarchy(skills: SkillRow[]): SkillNode[] {
  const map = new Map<string, SkillNode>();

  skills.forEach(skill => map.set(skill.id, { ...skill, children: [] }));

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

export function getNewChildPosition(
  parentX: number,
  parentY: number,
  siblingCount: number
): { x: number; y: number } {
  const direction = siblingCount % 2 === 0 ? 1 : -1;
  const multiplier = Math.ceil(siblingCount / 2);

  return {
    x: parentX + direction * multiplier * (X_OFFSET * 0.8),
    y: parentY + Y_OFFSET,
  };
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
    const hasSavedPosition = skill.positionX !== null && skill.positionY !== null;

    const subtreeWidth = getSubtreeWidth(skill);
    const autoX = currentX + (subtreeWidth * X_OFFSET) / 2 - X_OFFSET / 2;
    const autoY = level * Y_OFFSET;

    const finalX = hasSavedPosition ? skill.positionX : autoX;
    const finalY = hasSavedPosition ? skill.positionY : autoY;

    const isRoot = !skill.parentId;
    const shape = isRoot ? 'hexagon' : ((skill.shape ?? 'hexagon') as SkillShape);

    nodes.push({
      id: skill.id,
      type: 'skill',
      position: { x: finalX, y: finalY },
      data: {
        id: skill.id,
        userId: skill.userId,
        name: skill.name,
        positionX: finalX,
        positionY: finalY,
        label: skill.name,
        icon: skill.icon ?? '🔹',
        category: (skill.category ?? 'keystone') as SkillCategory,
        shape,
        isUnlocked: skill.isUnlocked,
        description: skill.description ?? '',
        parentId: skill.parentId ?? undefined,
        links: (skill as any).contents ?? [],
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

    if (!hasSavedPosition) {
      currentX += subtreeWidth * X_OFFSET;
    } else {
      currentX += X_OFFSET;
    }
  });

  return { nodes, edges };
}

export function calculateRecursiveProgress(
  nodes: Node<SkillData>[],
  edges: Edge[]
): Node<SkillData>[] {
  const sourceToTargets = new Map<string, string[]>();
  edges.forEach(e => {
    const existing = sourceToTargets.get(e.source) ?? [];
    existing.push(e.target);
    sourceToTargets.set(e.source, existing);
  });

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const getDescendantIds = (parentId: string): string[] => {
    const result: string[] = [];
    const stack = [...(sourceToTargets.get(parentId) ?? [])];

    while (stack.length > 0) {
      const id = stack.pop()!;
      result.push(id);
      const children = sourceToTargets.get(id);
      if (children) stack.push(...children);
    }

    return result;
  };

  return nodes.map(node => {
    const descendantIds = getDescendantIds(node.id);
    if (descendantIds.length === 0) {
      return { ...node, data: { ...node.data, progress: 0 } };
    }

    let total = 0;
    let unlocked = 0;

    for (const id of descendantIds) {
      const n = nodeMap.get(id);
      if (n) {
        total++;
        if (n.data.isUnlocked) unlocked++;
      }
    }

    return {
      ...node,
      data: { ...node.data, progress: total > 0 ? unlocked / total : 0 },
    };
  });
}

export function calculateGlobalProgress(nodes: Node<SkillData>[]): number {
  if (nodes.length === 0) return 0;
  const unlocked = nodes.filter(n => n.data.isUnlocked).length;
  return Math.round((unlocked / nodes.length) * 100);
}