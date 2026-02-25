'use client';
import React, { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { SkillData, CATEGORY_THEME, SkillCategory } from './types';

type CompatibleSkillNode = Node<SkillData & { [key: string]: unknown }>;

export function SvgDefs() {
  return (
    <svg width={0} height={0} style={{ position: 'absolute' }}>
      <defs>
        <filter id="glow-keystone" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-notable" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

function SkillNodeComponent({ data }: NodeProps<CompatibleSkillNode>) {
  const { isUnlocked, level, xp, xpToNextLevel, icon, label, category } = data;

  const theme = useMemo(
    () => CATEGORY_THEME[category as SkillCategory] || CATEGORY_THEME.keystone,
    [category]
  );

  const isKeystone = category === 'keystone';
  const isNotable  = data.parentId === 'nexus' && !isKeystone;

  const nodeR   = isKeystone ? 32 : isNotable ? 26 : 20;
  const arcR    = nodeR + 3;
  const arcC    = 2 * Math.PI * arcR;
  const xpFill  = xpToNextLevel > 0 ? Math.min(xp / xpToNextLevel, 1) * arcC : 0;

  const handleStyle: React.CSSProperties = {
    background: 'transparent', border: 'none',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    position: 'absolute', opacity: 0, pointerEvents: 'none',
  };

  return (
    <div className="group relative flex flex-col items-center">
      <Handle type="target" position={Position.Top}    style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />

      <svg width={100} height={100} viewBox="-50 -50 100 100" className="overflow-visible z-10">

        {isUnlocked && (
          <circle
            r={nodeR + 7}
            fill="none"
            stroke={theme.color}
            strokeWidth="1"
            className={isKeystone ? 'node-pulse-ks' : 'node-pulse'}
          />
        )}

        {isKeystone ? (
          <polygon
            points="0,-32 28,-16 28,16 0,32 -28,16 -28,-16"
            fill={isUnlocked ? '#111115' : '#070709'}
            stroke={isUnlocked ? theme.border : '#222'}
            strokeWidth={3}
            filter={isUnlocked ? 'url(#glow-keystone)' : undefined}
          />
        ) : (
          <circle
            r={nodeR}
            fill={isUnlocked ? '#111115' : '#070709'}
            stroke={isUnlocked ? theme.border : '#222'}
            strokeWidth={isNotable ? 2.5 : 1.5}
            filter={isNotable && isUnlocked ? 'url(#glow-notable)' : undefined}
          />
        )}

        {isUnlocked && xpFill > 0 && (
          <circle
            r={arcR}
            fill="none"
            stroke={theme.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${xpFill} ${arcC}`}
            transform="rotate(-90)"
            opacity={0.85}
            style={{ transition: 'stroke-dasharray 0.6s ease-in-out' }}
          />
        )}

        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={isKeystone ? 22 : 16}
          className="pointer-events-none"
          style={{
            fill: isUnlocked ? 'white' : '#333',
            userSelect: 'none',
            opacity: isUnlocked ? 1 : 0.4,
          }}
        >
          {isUnlocked ? icon : '?'}
        </text>

        {isUnlocked && level > 0 && (
          <g transform={`translate(${nodeR * 0.8}, ${-nodeR * 0.8})`}>
            <circle r={8} fill="#000" stroke={theme.border} strokeWidth="1" />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={7}
              fontWeight="bold"
              fill={theme.color}
            >
              {level}
            </text>
          </g>
        )}
      </svg>

      <div className={`
        mt-1 text-[10px] uppercase tracking-[0.2em] font-medium text-center max-w-[120px]
        ${isUnlocked ? 'text-[#c8b89a]' : 'text-[#3a3830]'}
      `}>
        {label}
      </div>
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);