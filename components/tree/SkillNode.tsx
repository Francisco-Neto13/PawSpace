'use client';
import React, { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { SkillData, CATEGORY_THEME, SkillCategory } from './types';

type CompatibleSkillNode = Node<SkillData>;

export function SvgDefs() {
  return (
    <svg width={0} height={0} style={{ position: 'absolute', pointerEvents: 'none' }}>
      <defs>
        <filter id="glow-keystone" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
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
  
  const centralHandleStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    width: '1px',
    height: '1px',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: -1,
  };

  return (
    <div className={`group relative flex flex-col items-center ${selected ? 'z-50' : 'z-10'}`}>
      
      <Handle type="target" position={Position.Top} style={centralHandleStyle} />
      <Handle type="source" position={Position.Top} style={centralHandleStyle} />

      <div 
        className={`relative flex items-center justify-center transition-all duration-300 z-20
          ${isKeystone ? 'w-16 h-16' : 'w-12 h-12'}
          ${selected ? 'scale-110' : 'hover:scale-105'}
        `}
      >
        <div 
          className="absolute inset-0 transition-colors duration-500 pointer-events-none"
          style={{
            backgroundColor: isUnlocked ? theme.color : '#1a1a1e',
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
            filter: isUnlocked && isKeystone ? 'url(#glow-keystone)' : 'none',
            opacity: isUnlocked ? 1 : 0.4
          }}
        />

        <div 
          className="absolute inset-[2px] bg-[#030304] pointer-events-none"
          style={{
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
          }}
        />

        <span className={`relative z-10 select-none transition-all duration-300 pointer-events-none
          ${isKeystone ? 'text-3xl' : 'text-xl'}
          ${isUnlocked ? 'grayscale-0 opacity-100' : 'grayscale opacity-20'}
        `}>
          {icon || '✦'}
        </span>

        {selected && (
          <div className="absolute -inset-1 border border-[#c8b89a]/40 animate-pulse pointer-events-none" 
               style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)' }} 
          />
        )}
      </div>

      <div className="absolute -bottom-12 w-[160px] flex flex-col items-center pointer-events-none z-30">
        <span className={`
          font-sans text-center uppercase transition-all duration-300 px-1 tracking-[0.12em]
          ${isUnlocked 
            ? 'text-[#f0ede6] font-bold drop-shadow-[0_0_8px_rgba(200,184,154,0.4)]' 
            : 'text-[#4a4a55] font-semibold'}
        `}
          style={{ 
            fontSize: '11px',
            lineHeight: '1.2'
          }}
        >
          {label}
        </span>
        
        {progress > 0 && progress < 1 && (
          <div className="w-10 h-[2px] bg-black/60 mt-2 border border-[#c8b89a]/10 overflow-hidden">
            <div 
              className="h-full bg-[#c8b89a] shadow-[0_0_5px_rgba(200,184,154,0.6)]" 
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        {selected && (
          <div className="w-8 h-[1px] bg-[#c8b89a] mt-1.5 opacity-60 shadow-[0_0_4px_#c8b89a]" />
        )}
      </div>
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);