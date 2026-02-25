'use client';
import React, { memo } from 'react';
import { EdgeProps, BaseEdge, getBezierPath, type Edge } from '@xyflow/react';
import { SkillEdgeData, CATEGORY_THEME, SkillCategory } from './types';

type CompatibleSkillEdge = Edge<SkillEdgeData & { [key: string]: unknown }>;
type SkillEdgeProps = EdgeProps<CompatibleSkillEdge>;

function SkillEdgeComponent({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data,
}: SkillEdgeProps) {
  const [path] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    curvature: 0.15,
  });

  const unlocked  = data?.unlocked ?? false;
  const category  = data?.category as SkillCategory;
  const color     = category && CATEGORY_THEME[category]
    ? CATEGORY_THEME[category].color
    : '#2a2a35';

  return (
    <>
      <BaseEdge
        id={`${id}-shadow`}
        path={path}
        style={{
          stroke: '#000',
          strokeWidth: unlocked ? 5 : 3,
          opacity: 0.5,
        }}
      />

      <path
        d={path}
        fill="none"
        stroke={unlocked ? color : '#1e1e24'}
        strokeWidth={unlocked ? 1.5 : 1}
        strokeDasharray={unlocked ? undefined : '2 4'}
        strokeLinecap="round"
        opacity={unlocked ? 0.85 : 0.3}
        className="pointer-events-none"
      />

      {unlocked && (
        <path
          d={path}
          fill="none"
          stroke="white"
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray="2 36"
          opacity={0.55}
          className="edge-flow pointer-events-none"
        />
      )}
    </>
  );
}

export const SkillEdge = memo(SkillEdgeComponent);