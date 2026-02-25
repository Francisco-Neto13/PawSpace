'use client';
import React, { useMemo } from 'react';
import { SkillData, CATEGORY_THEME, SkillCategory } from './types';

interface SkillPanelProps {
  data: SkillData | null;
  onClose: () => void;
}

export function SkillPanel({ data, onClose }: SkillPanelProps) {
  // ── Hooks ANTES do early return — regra dos hooks do React ────────────────
  const theme = useMemo(() =>
    data ? CATEGORY_THEME[data.category as SkillCategory] || CATEGORY_THEME.keystone : CATEGORY_THEME.keystone,
  [data?.category]);

  const xpPercent = useMemo(() =>
    data && data.xpToNextLevel > 0
      ? Math.min(Math.round((data.xp / data.xpToNextLevel) * 100), 100)
      : 0,
  [data?.xp, data?.xpToNextLevel]);

  const panelStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 50,
    width: 256,
    background: '#0e0e12',
    border: `1px solid ${theme.border}`,
    borderRadius: 2,
    padding: 20,
    boxShadow: `0 0 24px ${theme.glow}`,
    fontFamily: 'Georgia, serif',
  }), [theme]);
  // ─────────────────────────────────────────────────────────────────────────

  if (!data) return null;

  return (
    <div style={panelStyle} className="animate-in fade-in slide-in-from-right-4 duration-300">
      {(['tl', 'tr', 'bl', 'br'] as const).map(pos => {
        const isTop  = pos.startsWith('t');
        const isLeft = pos.endsWith('l');
        return (
          <div key={pos} style={{
            position: 'absolute',
            width: 7, height: 7,
            top:    isTop  ? 6 : undefined,
            bottom: !isTop ? 6 : undefined,
            left:   isLeft  ? 6 : undefined,
            right:  !isLeft ? 6 : undefined,
            borderTop:    isTop  ? `1px solid ${theme.color}` : undefined,
            borderBottom: !isTop ? `1px solid ${theme.color}` : undefined,
            borderLeft:   isLeft  ? `1px solid ${theme.color}` : undefined,
            borderRight:  !isLeft ? `1px solid ${theme.color}` : undefined,
            opacity: 0.45,
            pointerEvents: 'none',
          }} />
        );
      })}

      <button
        onClick={onClose}
        className="absolute top-[10px] right-[12px] bg-transparent border-none text-[#3a3a45] cursor-pointer text-[13px] hover:text-white transition-colors"
      >✕</button>

      <div className="flex items-center gap-[6px] mb-[12px]">
        <div className="w-[2px] h-[20px] rounded-[1px]" style={{ background: theme.color }} />
        <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: theme.color }}>
          {theme.label}
        </span>
      </div>

      <div className="flex items-center gap-[12px] mb-[10px]">
        <div
          className="w-[40px] h-[40px] flex items-center justify-center text-[20px] bg-[#08080a]"
          style={{
            border: `1px solid ${data.isUnlocked ? theme.border : '#1e1e25'}`,
            clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
          }}
        >
          {data.isUnlocked ? data.icon : '·'}
        </div>
        <div>
          <p className="font-bold text-[13px] m-0" style={{ color: data.isUnlocked ? '#ddd8cc' : '#3a3a45' }}>
            {data.label}
          </p>
          <p className="text-[10px] m-0 mt-[2px] uppercase tracking-[0.12em]" style={{ color: data.isUnlocked ? theme.color : '#2a2a32' }}>
            {data.isUnlocked ? `Level ${data.level}` : '— Locked —'}
          </p>
        </div>
      </div>

      <div className="h-[1px] opacity-20 my-[8px]" style={{ background: theme.border }} />

      <p className="text-[#555560] text-[11px] leading-[1.6] m-0 mb-[10px] italic">
        {data.description}
      </p>

      {data.isUnlocked && (
        <>
          <div className="flex justify-between mb-[5px]">
            <span className="text-[#3a3a45] text-[10px] uppercase tracking-[0.1em]">XP Progress</span>
            <span className="text-[10px] font-bold" style={{ color: theme.color }}>
              {Math.floor(data.xp)} / {data.xpToNextLevel}
            </span>
          </div>

          <div className="h-[4px] bg-[#0a0a0d] border border-[#1e1e25] rounded-[1px] overflow-hidden mb-[10px]">
            <div style={{
              height: '100%',
              width: `${xpPercent}%`,
              background: theme.color,
              opacity: 0.8,
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>

          <div className="h-[1px] opacity-[0.15] mb-[10px]" style={{ background: theme.border }} />

          <button
            className="w-full py-[7px] bg-[#13131a] border rounded-[2px] text-[10px] font-bold cursor-pointer tracking-[0.18em] uppercase hover:bg-[#1a1a24] transition-colors"
            style={{
              borderColor: theme.border,
              color: theme.color,
              fontFamily: 'Georgia, serif',
            }}
          >
            Study Modules
          </button>
        </>
      )}
    </div>
  );
}