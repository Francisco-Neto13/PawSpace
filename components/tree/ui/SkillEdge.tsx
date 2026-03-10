'use client';
import React, { memo } from 'react';
import { EdgeProps, getStraightPath, type Edge } from '@xyflow/react';
import { SkillEdgeData } from '../types';

type CompatibleSkillEdge = Edge<SkillEdgeData & { [key: string]: unknown }>;
type SkillEdgeProps = EdgeProps<CompatibleSkillEdge>;

const DEFAULT_EDGE_COLOR = 'var(--text-muted)';
const ARROW_ID = 'skill-arrow';

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

function normalizeEdgeColor(raw: string | undefined): string {
  const candidate = (raw || '').trim().toLowerCase();
  if (!candidate) return DEFAULT_EDGE_COLOR;
  if (
    candidate === 'white' ||
    candidate === '#fff' ||
    candidate === '#ffffff' ||
    isNearWhiteHex(candidate) ||
    isThemeContrastToken(candidate)
  ) return DEFAULT_EDGE_COLOR;
  return raw || DEFAULT_EDGE_COLOR;
}

// Definição da seta — renderizada uma vez fora do componente
export function EdgeDefs() {
  return (
    <svg width={0} height={0} style={{ position: 'absolute', pointerEvents: 'none' }}>
      <defs>
        <marker
          id={ARROW_ID}
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L6,3 z" fill="var(--border-visible)" />
        </marker>
      </defs>
    </svg>
  );
}

function SkillEdgeComponent({
  id,
  sourceX, sourceY,
  targetX, targetY,
  data,
}: SkillEdgeProps) {
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const strokeColor = normalizeEdgeColor(data?.color);
  const isHighlighted = data?.isHighlighted === true;
  const isDimmed = data?.isDimmed === true;

  return (
    <path
      id={id}
      d={path}
      fill="none"
      stroke={isHighlighted ? 'var(--text-primary)' : strokeColor}
      strokeWidth={isHighlighted ? 2.2 : 1.5}
      strokeOpacity={isHighlighted ? 0.95 : isDimmed ? 0.18 : 0.65}
      markerEnd={`url(#${ARROW_ID})`}
      className="pointer-events-none"
      style={{ transition: 'stroke 0.3s ease' }}
    />
  );
}

export const SkillEdge = memo(SkillEdgeComponent);
