'use client';
import React, { memo } from 'react';
import { EdgeProps, BaseEdge, getStraightPath, type Edge } from '@xyflow/react';
import { SkillEdgeData, CATEGORY_THEME, SkillCategory } from '../types';

type CompatibleSkillEdge = Edge<SkillEdgeData & { [key: string]: unknown }>;
type SkillEdgeProps = EdgeProps<CompatibleSkillEdge>;

function SkillEdgeComponent({
  id,
  sourceX, sourceY, targetX, targetY,
  data,
}: SkillEdgeProps) {
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  const unlocked = data?.unlocked ?? false;
  const category = data?.category as SkillCategory;

  const themeColor = category && CATEGORY_THEME[category]
    ? CATEGORY_THEME[category].color
    : '#c8b89a'; 

  const strokeColor = unlocked ? themeColor : '#1a1a1f';

  return (
    <>
      <BaseEdge
        id={`${id}-shadow`}
        path={path}
        style={{
          stroke: '#000',
          strokeWidth: unlocked ? 5 : 3,
          opacity: 0.9,
          transition: 'stroke-width 0.3s ease',
        }}
      />
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={unlocked ? 2.5 : 1.5}
        strokeLinecap="butt"
        opacity={unlocked ? 1 : 0.6}
        className="pointer-events-none"
        style={{ transition: 'stroke 0.5s ease, stroke-width 0.3s ease, opacity 0.3s ease' }}
      />
      {unlocked && (
        <path
          d={path}
          fill="none"
          stroke="#fff"
          strokeWidth={1}
          strokeLinecap="butt"
          strokeDasharray="4 60"
          opacity={0.5}
          className="edge-flow pointer-events-none"
        />
      )}
    </>
  );
}

export const SkillEdge = memo(SkillEdgeComponent);