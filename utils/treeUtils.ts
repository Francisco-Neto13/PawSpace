import { Node, Edge } from '@xyflow/react';
import { SkillData, SkillCategory } from '../components/tree/types';


const RADIUS_STEP = 280; 

/**
 * @param tree Objeto aninhado de skills
 * @param parentId ID do nó pai (para recursão)
 * @param startAngle Ângulo inicial da "fatia" (0-360)
 * @param endAngle Ângulo final da "fatia" (0-360)
 * @param level Nível de profundidade (0 = Nexus)
 */

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

    nodes.push({
      id,
      type: 'skill',
      position: { x, y },
      data: {
        label: skill.label,
        icon: skill.icon || '🔹',
        category: skill.category || 'keystone',
        isUnlocked: true,
        level: skill.level || 0,
        xp: 0,
        xpToNextLevel: 100,
        description: skill.description || 'No description provided.',
        parentId: parentId || undefined,
      },
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'skill',
        data: { 
          unlocked: true, 
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