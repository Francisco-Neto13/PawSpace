'use client';
import React, { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { SkillData, CATEGORY_THEME, SkillCategory } from './types';

type CompatibleSkillNode = Node<SkillData & { [key: string]: unknown }>;

function SkillNodeComponent({ data }: NodeProps<CompatibleSkillNode>) {
  const { isUnlocked, level, xp, xpToNextLevel, icon, label, category, onSelect } = data;
  
  const theme = useMemo(() => 
    CATEGORY_THEME[category as SkillCategory] || CATEGORY_THEME.support, 
  [category]);

  const isKeystone = category === 'keystone';
  const isNotable = level >= 5 && !isKeystone;

  const nodeR = isKeystone ? 32 : isNotable ? 26 : 20;
  const svgSize = 100;
  const viewBox = '-50 -50 100 100';

  const arcR = nodeR + 3;
  const arcC = 2 * Math.PI * arcR;
  const xpFill = xpToNextLevel > 0 ? (xp / xpToNextLevel) * arcC : 0;

  const shape = useMemo(() => {
    if (category === 'support') return '0,-20 18,0 0,20 -18,0';
    if (isKeystone) return '0,-32 28,-16 28,16 0,32 -28,16 -28,-16';
    return 'circle';
  }, [category, isKeystone]);

  const handleStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  };

  return (
    <div
      className="group relative flex flex-col items-center transition-all duration-300"
      onClick={() => onSelect(data)}
      style={{ cursor: 'pointer' }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />

      <svg width={svgSize} height={svgSize} viewBox={viewBox} className="overflow-visible z-10">
        {isUnlocked && (
          <defs>
            <filter id={`glow-${category}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={isKeystone ? "4" : "2"} result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        )}

        {isUnlocked && (
           <circle
            r={nodeR + 6}
            fill="none"
            stroke={theme.color}
            strokeWidth="1"
            className={isKeystone ? 'node-pulse-ks' : 'node-pulse'}
            opacity="0.2"
          />
        )}

        {shape === 'circle' ? (
          <circle 
            r={nodeR} 
            fill={isUnlocked ? "#111115" : "#070709"} 
            stroke={isUnlocked ? theme.border : "#222"} 
            strokeWidth={isNotable ? 3 : 1.5}
          />
        ) : (
          <polygon
            points={shape}
            fill={isUnlocked ? "#111115" : "#070709"}
            stroke={isUnlocked ? theme.border : "#222"}
            strokeWidth={2}
          />
        )}

        <path
          d={`M -${nodeR*0.6} -${nodeR*0.2} A ${nodeR*0.8} ${nodeR*0.8} 0 0 1 ${nodeR*0.6} -${nodeR*0.2}`}
          fill="none"
          stroke="white"
          strokeWidth="1"
          opacity={isUnlocked ? "0.15" : "0.05"}
          className="pointer-events-none"
        />

        {isUnlocked && (
          <circle
            r={arcR}
            fill="none"
            stroke={theme.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${xpFill} ${arcC}`}
            transform="rotate(-90)"
            className="transition-all duration-700 ease-in-out"
            style={{ filter: `drop-shadow(0 0 3px ${theme.color})` }}
          />
        )}

        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={isKeystone ? 22 : 16}
          className="pointer-events-none transition-all duration-300"
          style={{ 
            fill: isUnlocked ? 'white' : '#333',
            filter: isUnlocked ? `drop-shadow(0 0 2px ${theme.color})` : 'none',
            userSelect: 'none'
          }}
        >
          {isUnlocked ? icon : '?'}
        </text>

        {isUnlocked && (
          <g transform={`translate(${nodeR*0.8}, ${-nodeR*0.8})`}>
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
        mt-1 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors
        ${isUnlocked ? 'text-[#c8b89a]' : 'text-[#3a3830]'}
      `}>
        {label}
      </div>
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);