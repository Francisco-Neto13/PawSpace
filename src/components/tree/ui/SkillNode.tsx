'use client';
import React, { memo, useMemo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { SkillData } from '../types';

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

const SIZE_ROOT         = 72;
const SIZE_INTERMEDIATE = 52;
const SIZE_LEAF         = 36;

export function SvgDefs() {
  return null;
}

function SkillNodeComponent({ data, selected }: NodeProps<CompatibleSkillNode>) {
  const { icon, name, label, color, parentId } = data;
  const isChildOfSelected = data.isChildOfSelected === true;
  const hasChildren = data.hasChildren === true;

  const isRoot         = !parentId;
  const isLeaf         = !isRoot && !hasChildren;

  const size = isRoot ? SIZE_ROOT : !isRoot && hasChildren ? SIZE_INTERMEDIATE : SIZE_LEAF;

  const nodeColor = useMemo(() => {
    const candidate = (color || '').trim();
    if (!candidate) return DEFAULT_NODE_COLOR;
    if (candidate.toLowerCase() === 'white') return DEFAULT_NODE_COLOR;
    if (isNearWhiteHex(candidate)) return DEFAULT_NODE_COLOR;
    if (isThemeContrastToken(candidate)) return DEFAULT_NODE_COLOR;
    return candidate;
  }, [color]);

  const borderWidth = isRoot ? 3 : 2;
  const iconSize    = isRoot ? '1.5rem' : !isLeaf ? '1.1rem' : '0.85rem';

  // Handle invisível e centralizado — posição absoluta 50%/50%
  const handleStyle: React.CSSProperties = {
    background:  'transparent',
    border:      'none',
    width:       1,
    height:      1,
    minWidth:    1,
    minHeight:   1,
    top:         '50%',
    left:        '50%',
    transform:   'translate(-50%, -50%)',
    position:    'absolute',
  };

  return (
    // O wrapper tem exatamente size×size para o React Flow medir corretamente
    <div
      style={{
        width:    size,
        height:   size,
        position: 'relative',
      }}
      className={selected ? 'z-50' : 'z-10'}
    >
      {/* Handles centrais — React Flow conecta a partir deles */}
      <Handle type="target" position={Position.Top}    style={handleStyle} id="t" />
      <Handle type="source" position={Position.Bottom} style={handleStyle} id="s" />

      {/* Círculo visual */}
      <div
        className="absolute inset-0 rounded-full transition-transform duration-200"
        style={{
          backgroundColor: 'var(--bg-base)',
          border:          `${borderWidth}px solid ${nodeColor}`,
          transform:       selected ? 'scale(1.08)' : undefined,
        }}
      />

      {/* Ícone centralizado absolutamente */}
      <span
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
        style={{
          fontSize: iconSize,
          color:    nodeColor,
        }}
      >
        {icon || '·'}
      </span>

      {/* Anel de seleção */}
      {selected && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset:       -5,
            border:      `1.5px solid ${nodeColor}`,
            opacity:     0.5,
          }}
        />
      )}

      {isChildOfSelected && !selected && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -4,
            border: '1px dashed var(--border-visible)',
            opacity: 0.45,
          }}
        />
      )}

      {/* Label — fora do fluxo do nó, posicionado abaixo */}
      <div
        className="absolute pointer-events-none"
        style={{
          top:       size + 6,
          left:      '50%',
          transform: 'translateX(-50%)',
          width:     160,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize:      isRoot ? '11px' : isLeaf ? '9px' : '10px',
            fontWeight:    700,
            fontFamily:    'var(--font-main)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            lineHeight:    1.2,
            color:         isChildOfSelected ? 'var(--text-primary)' : 'var(--text-contrast)',
            opacity:       isChildOfSelected ? 1 : isLeaf ? 0.7 : 1,
            display:       'block',
          }}
        >
          {name || label}
        </span>
        {selected && (
          <div
            style={{
              width:           24,
              height:          1,
              margin:          '6px auto 0',
              backgroundColor: nodeColor,
              opacity:         0.6,
            }}
          />
        )}
      </div>
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);
