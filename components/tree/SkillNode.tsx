'use client';
import React, { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { SkillData, CATEGORY_THEME, SkillCategory } from './types';

type CompatibleSkillNode = Node<SkillData>;

export function SvgDefs() {
  return (
    <svg width={0} height={0} style={{ position: 'absolute' }}>
      <defs>
        <filter id="glow-keystone" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-notable" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

function SkillNodeComponent({ data, selected }: NodeProps<CompatibleSkillNode>) {
  const { isUnlocked, icon, label, category, progress = 0 } = data;

  const theme = useMemo(
    () => CATEGORY_THEME[category as SkillCategory] || CATEGORY_THEME.keystone,
    [category]
  );

  const isKeystone = category === 'keystone';
  const isNotable  = data.parentId === 'nexus' && !isKeystone;
  const nodeR      = isKeystone ? 32 : isNotable ? 26 : 20;
  const arcR       = nodeR + 8;
  const circumference = 2 * Math.PI * arcR;

  const strokeDashoffset = useMemo(
    () => circumference - (progress * circumference),
    [progress, circumference]
  );

  const handleStyle: React.CSSProperties = useMemo(() => ({
    background: 'transparent', border: 'none',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    position: 'absolute', opacity: 0, pointerEvents: 'none',
  }), []);

  const progressPercent = Math.round(progress * 100);

  return (
    <div className={`group relative flex flex-col items-center ${selected ? 'z-50' : 'z-10'}`}>
      <Handle type="target" position={Position.Top}    style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />

      <div className="relative flex items-center justify-center w-[100px] h-[100px]">
        <svg width={100} height={100} viewBox="-50 -50 100 100" className="overflow-visible">

          {progress > 0 && (
            <circle
              r={arcR}
              fill="none"
              stroke="#1a1a1e"
              strokeWidth="3"
              opacity={0.4}
            />
          )}

          {progress > 0 && (
            <circle
              r={arcR}
              fill="none"
              stroke={theme.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90)"
              opacity={0.9}
              style={{ transition: 'stroke-dashoffset 0.7s ease-in-out' }}
            />
          )}

          {isUnlocked && (
            <circle
              r={nodeR + 4}
              fill="none"
              stroke={theme.color}
              strokeWidth="1"
              className={isKeystone ? 'node-pulse-ks' : 'node-pulse'}
              style={{ opacity: isKeystone ? 0.4 : 0.3 }}
            />
          )}

          {isKeystone ? (
            <polygon
              points="0,-32 28,-16 28,16 0,32 -28,16 -28,-16"
              fill={isUnlocked ? '#0e0e12' : '#070709'}
              stroke={isUnlocked ? theme.border : '#1e1e25'}
              strokeWidth={3}
              filter={isUnlocked ? 'url(#glow-keystone)' : undefined}
            />
          ) : (
            <circle
              r={nodeR}
              fill={isUnlocked ? '#0e0e12' : '#070709'}
              stroke={isUnlocked ? theme.border : '#1e1e25'}
              strokeWidth={isNotable ? 2.5 : 1.5}
              filter={isUnlocked && isNotable ? 'url(#glow-notable)' : undefined}
            />
          )}

          {isUnlocked && (
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isKeystone ? 22 : 16}
              className="pointer-events-none"
              style={{
                fill: 'white',
                userSelect: 'none',
              }}
            >
              {icon}
            </text>
          )}
        </svg>
      </div>

      <div className="absolute -bottom-6 w-[160px] pointer-events-none flex flex-col items-center">
        <span
          className={`text-[10px] uppercase tracking-[0.2em] font-bold text-center leading-tight
            ${isUnlocked ? 'text-[#ddd8cc]' : 'text-[#3a3a45]'}`}
          style={{ textShadow: '0 0 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,1)' }}
        >
          {label}
        </span>

        <div className="h-4 flex items-center justify-center mt-0.5">
          {progress > 0 && progress < 1 && (
            <span className="text-[8px] font-bold tracking-[0.2em] text-[#c8b89a]">
              {progressPercent}%
            </span>
          )}
          {progress >= 1 && (
            <span className="text-[7px] font-black tracking-[0.3em] text-[#4ade80] opacity-90">
              COMPLETE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);