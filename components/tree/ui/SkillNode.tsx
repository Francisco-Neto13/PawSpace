'use client';
import React, { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { SkillData, SkillShape, SHAPE_SIZE } from '../types';

type CompatibleSkillNode = Node<SkillData>;

const DEFAULT_NODE_COLOR = 'var(--border-visible)';

function normalizeHexColor(candidate: string): string {
  const hex = candidate.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(hex)) return hex;
  if (/^#[0-9a-f]{3}$/.test(hex)) {
    const [r, g, b] = hex.slice(1).split('');
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return '';
}

function isNearWhiteHex(hex: string): boolean {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return false;
  const r = Number.parseInt(normalized.slice(1, 3), 16);
  const g = Number.parseInt(normalized.slice(3, 5), 16);
  const b = Number.parseInt(normalized.slice(5, 7), 16);
  return r >= 235 && g >= 235 && b >= 235;
}

function isThemeContrastToken(value: string): boolean {
  const token = value.trim().toLowerCase();
  return token === 'var(--text-contrast)' || token === 'var(--text-primary)';
}

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

  const nodeColor = useMemo(() => {
    const candidate = (color || '').trim();
    if (!candidate) return DEFAULT_NODE_COLOR;
    if (candidate.toLowerCase() === 'white') return 'var(--border-visible)';
    if (isNearWhiteHex(candidate)) return 'var(--border-visible)';
    if (isThemeContrastToken(candidate)) return 'var(--border-visible)';
    return candidate;
  }, [color]);
  const glowColor = useMemo(
    () => (nodeColor.startsWith('var(') ? 'var(--text-secondary)' : `color-mix(in srgb, ${nodeColor} 60%, transparent)`),
    [nodeColor]
  );
  const selectedBorderColor = useMemo(
    () => (nodeColor.startsWith('var(') ? 'var(--border-visible)' : `color-mix(in srgb, ${nodeColor} 55%, transparent)`),
    [nodeColor]
  );

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
          ${selected ? 'scale-[1.08]' : 'hover:scale-[1.02]'}
        `}
        style={{ width: size, height: size }}
      >
        <div
          className="absolute inset-0 transition-all duration-500 pointer-events-none"
          style={{
            backgroundColor: nodeColor,
            clipPath,
            filter: isRoot ? 'url(#glow-keystone)' : `drop-shadow(0 0 5px ${glowColor})`,
            opacity: 1,
          }}
        />

        <div
          className="absolute pointer-events-none"
          style={{
            inset: '2px',
            clipPath,
            backgroundColor: 'var(--bg-base, #0a0a0a)',
          }}
        />

        <span
          className={`relative z-10 select-none transition-all duration-300 pointer-events-none
            ${isRoot ? 'text-3xl' : 'text-xl'}
            grayscale-0 opacity-100
          `}
          style={{ color: 'var(--text-contrast)' }}
        >
          {icon || '*'}
        </span>

        {selected && (
          <div
            className="absolute -inset-1 border animate-pulse pointer-events-none"
            style={{ clipPath, borderColor: selectedBorderColor }}
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
            color: 'var(--text-contrast)',
            textShadow: `0 0 8px ${glowColor}`,
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

