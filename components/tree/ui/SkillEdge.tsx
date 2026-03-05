'use client';
import React, { memo } from 'react';
import { EdgeProps, BaseEdge, getStraightPath, type Edge } from '@xyflow/react';
import { SkillEdgeData } from '../types';

type CompatibleSkillEdge = Edge<SkillEdgeData & { [key: string]: unknown }>;
type SkillEdgeProps = EdgeProps<CompatibleSkillEdge>;

const DEFAULT_EDGE_COLOR = '#2dd4bf';

function SkillEdgeComponent({
  id,
  sourceX, sourceY, targetX, targetY,
  data,
}: SkillEdgeProps) {
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const strokeColor = data?.color || DEFAULT_EDGE_COLOR;

  return (
    <>
      <BaseEdge
        id={`${id}-shadow`}
        path={path}
        style={{
          stroke: '#000',
          strokeWidth: 5,
          opacity: 0.9,
          transition: 'stroke-width 0.3s ease',
        }}
      />

      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2.5}
        strokeLinecap="butt"
        opacity={1}
        className="pointer-events-none"
        style={{
          transition: 'stroke 0.5s ease, stroke-width 0.3s ease, opacity 0.3s ease',
        }}
      />

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
    </>
  );
}

export const SkillEdge = memo(SkillEdgeComponent);
