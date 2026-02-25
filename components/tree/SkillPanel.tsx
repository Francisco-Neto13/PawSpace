'use client';
import React, { useMemo, memo } from 'react';
import { type Node } from '@xyflow/react';
import { SkillData, CATEGORY_THEME, SkillCategory } from './types';

interface SkillPanelProps {
  data: (SkillData & { id?: string }) | null;
  onClose: () => void;
  onToggleStatus?: (nodeId: string) => void;
  isAvailable: boolean; 
}

function SkillPanelComponent({ data, onClose, onToggleStatus, isAvailable }: SkillPanelProps) {
  const theme = useMemo(
    () => data ? CATEGORY_THEME[data.category as SkillCategory] || CATEGORY_THEME.keystone : CATEGORY_THEME.keystone,
    [data?.category]
  );

  const panelStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 50,
    width: 260,
    background: '#0e0e12',
    border: `1px solid ${isAvailable ? theme.border : '#1e1e25'}`,
    borderRadius: 2,
    padding: 20,
    boxShadow: isAvailable ? `0 0 24px ${theme.glow}` : 'none',
    fontFamily: 'Georgia, serif',
  }), [theme, isAvailable]);

  if (!data) return null;

  const cornerColor = isAvailable ? theme.color : '#3a3a45';

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
            borderTop:    isTop  ? `1px solid ${cornerColor}` : undefined,
            borderBottom: !isTop ? `1px solid ${cornerColor}` : undefined,
            borderLeft:   isLeft  ? `1px solid ${cornerColor}` : undefined,
            borderRight:  !isLeft ? `1px solid ${cornerColor}` : undefined,
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
        <div className="w-[2px] h-[20px] rounded-[1px]" style={{ background: isAvailable ? theme.color : '#1e1e25' }} />
        <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: isAvailable ? theme.color : '#3a3a45' }}>
          {isAvailable ? theme.label : 'Locked Path'}
        </span>
      </div>

      <div className="flex items-center gap-[12px] mb-[10px]">
        <div
          className="w-[40px] h-[40px] flex items-center justify-center text-[20px] bg-[#08080a]"
          style={{
            border: `1px solid ${data.isUnlocked ? theme.border : '#1e1e25'}`,
            clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
            filter: isAvailable ? 'none' : 'grayscale(1)',
          }}
        >
          {isAvailable ? data.icon : '🔒'}
        </div>
        <div>
          <p className="font-bold text-[13px] m-0" style={{ color: data.isUnlocked ? '#ddd8cc' : '#3a3a45' }}>
            {data.label}
          </p>
          <p className="text-[9px] m-0 mt-[2px] uppercase tracking-[0.12em]" style={{ color: data.isUnlocked ? theme.color : '#2a2a32' }}>
            {data.isUnlocked ? 'Mastered' : isAvailable ? 'In Progress' : 'Prerequisite Missing'}
          </p>
        </div>
      </div>

      <div className="h-[1px] opacity-20 my-[8px]" style={{ background: theme.border }} />

      <p className="text-[#555560] text-[11px] leading-[1.6] m-0 mb-[20px] italic">
        {isAvailable
          ? data.description
          : 'This knowledge is beyond your current reach. Master the previous skills to unlock this path.'}
      </p>

      <button
        disabled={!isAvailable}
        onClick={() => onToggleStatus?.(data.id as string)}
        className={`w-full py-[10px] border rounded-[2px] text-[10px] font-bold tracking-[0.18em] uppercase transition-colors duration-200
          ${!isAvailable
            ? 'bg-[#0a0a0d] border-[#1e1e25] text-[#1e1e25] cursor-not-allowed'
            : data.isUnlocked
              ? 'bg-[#1a2e1a] border-[#2d4d2d] text-[#4ade80] hover:bg-[#223e22] cursor-pointer'
              : 'bg-[#13131a] border-[#c8b89a]/30 text-[#c8b89a] hover:bg-[#1a1a24] hover:border-[#c8b89a] cursor-pointer'
          }`}
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {data.isUnlocked ? '✓ Learned' : isAvailable ? 'Mark as Learned' : 'Locked'}
      </button>

      <p className="text-[8px] text-[#3a3a45] mt-4 text-center uppercase tracking-widest opacity-50">
        Self-Paced Progression
      </p>
    </div>
  );
}

export const SkillPanel = memo(SkillPanelComponent);