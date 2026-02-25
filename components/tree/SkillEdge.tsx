'use client';
import React, { memo } from 'react';
import { EdgeProps, BaseEdge, getBezierPath, type Edge } from '@xyflow/react';
import { SkillEdgeData, CATEGORY_THEME, SkillCategory } from './types';

type CompatibleSkillEdge = Edge<SkillEdgeData & { [key: string]: unknown }>;
type SkillEdgeProps = EdgeProps<CompatibleSkillEdge>;

function SkillEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: SkillEdgeProps) {
  
  const [path] = getBezierPath({ 
    sourceX, 
    sourceY, 
    targetX, 
    targetY, 
    sourcePosition, 
    targetPosition,
    curvature: 0.15 
  });

  const unlocked = data?.unlocked ?? false;
  const category = data?.category as SkillCategory;
  const theme = category ? CATEGORY_THEME[category] : { color: '#2a2a35', glow: 'rgba(42,42,53,0.3)' };

  return (
    <>
      <defs>
        <filter id={`edge-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: '#000',
          strokeWidth: unlocked ? 5 : 0,
          opacity: 0.4,
          filter: 'blur(2px)',
        }}
      />

      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: unlocked ? '#1a1a1f' : '#111',
          strokeWidth: unlocked ? 3.5 : 2,
          opacity: 0.9,
        }}
      />

      <path
        d={path}
        fill="none"
        stroke={unlocked ? theme.color : '#222228'}
        strokeWidth={unlocked ? 1.5 : 1}
        strokeDasharray={unlocked ? undefined : '2 4'}
        style={{
          opacity: unlocked ? 1 : 0.3,
          transition: 'all 0.5s ease-in-out',
          filter: unlocked ? `drop-shadow(0 0 3px ${theme.color})` : 'none'
        }}
        className="pointer-events-none"
      />

      {unlocked && (
        <path
          d={path}
          fill="none"
          stroke="white"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeDasharray="1, 40"
          className="edge-flow"
          style={{ 
            opacity: 0.9,
            filter: `drop-shadow(0 0 2px white)`
          }}
        />
      )}
      
      {unlocked && (
        <path
          d={path}
          fill="none"
          stroke={theme.color}
          strokeWidth={8}
          opacity={0.1}
          className="pointer-events-none"
          style={{ filter: 'blur(6px)' }}
        />
      )}
    </>
  );
}

export const SkillEdge = memo(SkillEdgeComponent);