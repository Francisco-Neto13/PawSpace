'use client';
import React, { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { SkillData, SkillShape, SHAPE_SIZE } from '../types';

type CompatibleSkillNode = Node<SkillData>;

const DEFAULT_NODE_COLOR = '#ffffff';

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

function getClipPath(shape: SkillShape): string {
  switch (shape) {
    case 'hexagon': return 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)';
    case 'circle': return 'circle(50% at 50% 50%)';
    case 'square': return 'inset(0% round 4px)';
    case 'diamond': return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    default: return 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)';
  }
}

function SkillNodeComponent({ data, selected }: NodeProps<CompatibleSkillNode>) {
  const {
    icon,
    name,
    label,
    shape = 'hexagon',
    color,
    parentId,
  } = data;

  const nodeColor = useMemo(() => color || DEFAULT_NODE_COLOR, [color]);

  const isRoot = !parentId;
  const effectiveShape: SkillShape = isRoot ? 'hexagon' : (shape as SkillShape);
  const baseSize = SHAPE_SIZE[effectiveShape] || SHAPE_SIZE.hexagon;
  const size = isRoot ? baseSize + 16 : baseSize;
  const clipPath = getClipPath(effectiveShape);

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
    <div
      className={`group relative flex items-center justify-center ${selected ? 'z-50' : 'z-10'}`}
      style={{ width: size, height: size }}
    >
      <Handle type="target" position={Position.Top} style={centralHandleStyle} />
      <Handle type="source" position={Position.Top} style={centralHandleStyle} />

      <div
        className={`relative flex items-center justify-center transition-all duration-300 z-20
          ${selected ? 'scale-110' : 'hover:scale-105'}
        `}
        style={{ width: size, height: size }}
      >
        <div
          className="absolute inset-0 transition-all duration-500 pointer-events-none"
          style={{
            backgroundColor: nodeColor,
            clipPath,
            filter: isRoot ? 'url(#glow-keystone)' : `drop-shadow(0 0 5px ${nodeColor}66)`,
            opacity: 1,
          }}
        />

        <div
          className="absolute pointer-events-none bg-[#0a0a0a]"
          style={{
            inset: '2px',
            clipPath,
          }}
        />

        <span
          className={`relative z-10 select-none transition-all duration-300 pointer-events-none
            ${isRoot ? 'text-3xl' : 'text-xl'}
            grayscale-0 opacity-100
          `}
          style={{ color: '#fff' }}
        >
          {icon || '*'}
        </span>

        {selected && (
          <div
            className="absolute -inset-1 border animate-pulse pointer-events-none"
            style={{ clipPath, borderColor: `${nodeColor}88` }}
          />
        )}
      </div>

      <div
        className="absolute flex flex-col items-center pointer-events-none z-30"
        style={{
          top: size + 8,
          width: 200,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <span
          className="font-sans text-center uppercase transition-all duration-300 px-1 tracking-[0.12em] w-full font-bold"
          style={{
            fontSize: isRoot ? '12px' : '11px',
            lineHeight: 1.2,
            color: '#ffffff',
            textShadow: `0 0 8px ${nodeColor}66`,
          }}
        >
          {name || label}
        </span>

        {selected && (
          <div
            className="w-8 h-[1px] mt-1.5 opacity-60"
            style={{ backgroundColor: nodeColor, boxShadow: `0 0 4px ${nodeColor}` }}
          />
        )}
      </div>
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);

