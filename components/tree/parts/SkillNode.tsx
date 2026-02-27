'use client';
import React, { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { SkillData, CATEGORY_THEME, SkillCategory, SkillShape, SHAPE_SIZE } from '../types';

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

function getClipPath(shape: SkillShape): string {
  switch (shape) {
    case 'hexagon':
      return 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)';
    case 'circle':
      return 'circle(50% at 50% 50%)';
    case 'square':
      return 'inset(0% round 4px)';
    case 'diamond':
      return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    default:
      return 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)';
  }
}

function SkillNodeComponent({ data, selected }: NodeProps<CompatibleSkillNode>) {
  const { 
    isUnlocked, 
    icon, 
    label, 
    category, 
    shape = 'hexagon', 
    progress = 0,
    parentId 
  } = data;

  const theme = useMemo(
    () => CATEGORY_THEME[category as SkillCategory] || CATEGORY_THEME.keystone,
    [category]
  );

  const isRoot = !parentId;
  const effectiveShape: SkillShape = isRoot ? 'hexagon' : (shape as SkillShape);
  
  const baseSize = SHAPE_SIZE[effectiveShape] || SHAPE_SIZE.hexagon;
  const size = isRoot ? baseSize + 16 : baseSize;
  const clipPath = getClipPath(effectiveShape);

  // Handle centralizado no ponto zero geométrico
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
    /* IMPORTANTE: Definimos o width e height fixos aqui. 
       Isso garante que o React Flow centralize a câmera no Hexágono, 
       ignorando o label que "vaza" para fora.
    */
    <div 
      className={`group relative flex items-center justify-center ${selected ? 'z-50' : 'z-10'}`}
      style={{ width: size, height: size }}
    >
      <Handle type="target" position={Position.Top} style={centralHandleStyle} />
      <Handle type="source" position={Position.Top} style={centralHandleStyle} />

      {/* SHAPE CONTAINER */}
      <div
        className={`relative flex items-center justify-center transition-all duration-300 z-20
          ${selected ? 'scale-110' : 'hover:scale-105'}
        `}
        style={{ width: size, height: size }}
      >
        {/* Glow/Background Layer */}
        <div
          className="absolute inset-0 transition-colors duration-500 pointer-events-none"
          style={{
            backgroundColor: isUnlocked ? theme.color : '#1a1a1e',
            clipPath,
            filter: isRoot && isUnlocked ? 'url(#glow-keystone)' : 'none',
            opacity: isUnlocked ? 1 : 0.4,
          }}
        />

        {/* Inner Dark Layer */}
        <div
          className="absolute pointer-events-none bg-[#030304]"
          style={{
            inset: '2px',
            clipPath,
          }}
        />

        {/* Icon */}
        <span
          className={`relative z-10 select-none transition-all duration-300 pointer-events-none
            ${isRoot ? 'text-3xl' : 'text-xl'}
            ${isUnlocked ? 'grayscale-0 opacity-100' : 'grayscale opacity-20'}
          `}
        >
          {icon || '✦'}
        </span>

        {/* Selection Border */}
        {selected && (
          <div
            className="absolute -inset-1 border border-[#c8b89a]/40 animate-pulse pointer-events-none"
            style={{ clipPath }}
          />
        )}
      </div>

      {/* LABEL & PROGRESS (OVERLAY)
          Usamos absolute com top: 100% para que este bloco não aumente 
          a altura do container pai detectada pelo React Flow.
      */}
      <div 
        className="absolute flex flex-col items-center pointer-events-none z-30"
        style={{ 
          top: size + 8, // Posiciona 8px abaixo do fim do shape
          width: 200,    // Largura fixa maior para evitar quebra de linha precoce
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <span
          className={`font-sans text-center uppercase transition-all duration-300 px-1 tracking-[0.12em] w-full
            ${isUnlocked
              ? 'text-[#f0ede6] font-bold drop-shadow-[0_0_8px_rgba(200,184,154,0.4)]'
              : 'text-[#4a4a55] font-semibold'}
          `}
          style={{ fontSize: isRoot ? '12px' : '11px', lineHeight: 1.2 }}
        >
          {label}
        </span>

        {/* Progress Bar */}
        {typeof progress === 'number' && progress > 0 && progress < 1 && (
          <div className="w-10 h-[2px] bg-black/60 mt-2 border border-[#c8b89a]/10 overflow-hidden">
            <div
              className="h-full bg-[#c8b89a] shadow-[0_0_5px_rgba(200,184,154,0.6)]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        {/* Selected Indicator Line */}
        {selected && (
          <div className="w-8 h-[1px] bg-[#c8b89a] mt-1.5 opacity-60 shadow-[0_0_4px_#c8b89a]" />
        )}
      </div>
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);