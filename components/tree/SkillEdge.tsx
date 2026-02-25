'use client';
import React from 'react';
import { EdgeProps, BaseEdge, getBezierPath } from '@xyflow/react';
import { SkillEdgeData } from './types';

export function SkillEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps & { data?: SkillEdgeData }) {
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  const unlocked = data?.unlocked ?? false;

  return (
    <>
      {unlocked && (
        <BaseEdge
          id={`${id}-glow`}
          path={path}
          style={{ stroke: '#a855f7', strokeWidth: 8, opacity: 0.15 }}
        />
      )}

      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: unlocked ? '#a855f7' : '#27272a',
          strokeWidth: unlocked ? 2 : 1.5,
          strokeDasharray: unlocked ? undefined : '5 5',
          opacity: unlocked ? 0.8 : 0.4,
        }}
      />

      {unlocked && (
        <circle r={3} fill="#e879f9" opacity={0.9}>
          <animateMotion dur="2.5s" repeatCount="indefinite" path={path} />
        </circle>
      )}
    </>
  );
}