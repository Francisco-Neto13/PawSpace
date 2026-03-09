'use client';
import React, { memo } from 'react';
import { EdgeProps, BaseEdge, getStraightPath, type Edge } from '@xyflow/react';
import { SkillEdgeData } from '../types';

type CompatibleSkillEdge = Edge<SkillEdgeData & { [key: string]: unknown }>;
type SkillEdgeProps = EdgeProps<CompatibleSkillEdge>;

const DEFAULT_EDGE_COLOR = 'var(--border-visible)';

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
  ) {
    return DEFAULT_EDGE_COLOR;
  }
  return raw || DEFAULT_EDGE_COLOR;
}

function SkillEdgeComponent({
  id,
  sourceX, sourceY, targetX, targetY,
  data,
}: SkillEdgeProps) {
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const strokeColor = normalizeEdgeColor(data?.color);

  return (
    <>
      <BaseEdge
        id={`${id}-shadow`}
        path={path}
        style={{
          stroke: '#000',
          strokeWidth: 5,
          opacity: 0.9,
          transition: 'stroke-width 0.3s ease',
        }}
      />

      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2.5}
        strokeLinecap="butt"
        opacity={1}
        className="pointer-events-none"
        style={{
          transition: 'stroke 0.5s ease, stroke-width 0.3s ease, opacity 0.3s ease',
        }}
      />

      <path
        d={path}
        fill="none"
        stroke="var(--border-visible)"
        strokeWidth={1}
        strokeLinecap="butt"
        strokeDasharray="4 60"
        opacity={0.5}
        className="edge-flow pointer-events-none"
      />
    </>
  );
}

export const SkillEdge = memo(SkillEdgeComponent);

