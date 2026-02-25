'use client';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { SkillData } from './types';

export function SkillNode({ data }: { data: SkillData }) {
  const { isUnlocked, level, xp, xpToNextLevel, icon, label, onSelect } = data;
  const xpPercent = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;
  const circumference = 169.6; // 2π × 27

  return (
    <div className="group relative flex flex-col items-center" onClick={() => onSelect(data)}>
      {/* Outer pulse glow */}
      {isUnlocked && (
        <div className="absolute inset-0 rounded-full animate-ping bg-purple-500/10 scale-150 pointer-events-none" />
      )}

      <svg width={80} height={80} viewBox="-40 -40 80 80" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
        </defs>

        {/* Animated outer ring */}
        {isUnlocked && (
          <circle r={36} fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.3">
            <animate attributeName="r" values="33;38;33" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.05;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Main circle */}
        <circle
          r={24}
          fill={isUnlocked ? '#18181b' : '#09090b'}
          stroke={isUnlocked ? '#a855f7' : '#3f3f46'}
          strokeWidth={isUnlocked ? 2 : 1.5}
          filter={isUnlocked ? 'url(#glow)' : undefined}
        />

        {/* XP arc */}
        {isUnlocked && xpToNextLevel > 0 && (
          <circle
            r={27}
            fill="none"
            stroke="url(#xpGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(xpPercent / 100) * circumference} ${circumference}`}
            transform="rotate(-90)"
            opacity="0.9"
          />
        )}

        {/* Icon */}
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={isUnlocked ? 18 : 14}
          style={{ filter: isUnlocked ? 'none' : 'grayscale(1) opacity(0.3)' }}
        >
          {isUnlocked ? icon : '🔒'}
        </text>

        {/* Level badge */}
        {isUnlocked && (
          <g transform="translate(16, -16)">
            <circle r={9} fill="#7c3aed" stroke="#09090b" strokeWidth="1.5" />
            <text textAnchor="middle" dominantBaseline="central" fontSize={8} fontWeight="bold" fill="white">
              {level}
            </text>
          </g>
        )}

        {/* Label */}
        <text
          y={36}
          textAnchor="middle"
          fontSize={8}
          fontWeight="600"
          fill={isUnlocked ? '#d4d4d8' : '#52525b'}
          letterSpacing="0.08em"
          style={{ textTransform: 'uppercase' }}
        >
          {label}
        </text>
      </svg>

      {/* Hover tooltip */}
      <div className="absolute -top-14 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform origin-bottom z-50 pointer-events-none">
        <div className="rounded-md bg-black/90 border border-white/10 px-3 py-1.5 whitespace-nowrap text-center">
          <p className="text-xs font-bold text-white">{label}</p>
          <p className="text-[10px] text-purple-400 uppercase tracking-wider">
            {isUnlocked ? `Level ${level}` : 'Locked'}
          </p>
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="opacity-0 !w-1 !h-1" />
      <Handle type="source" position={Position.Bottom} className="opacity-0 !w-1 !h-1" />
    </div>
  );
}