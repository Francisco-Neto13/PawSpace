'use client';
import React, { useMemo, memo } from 'react';
import { SkillData, CATEGORY_THEME, SkillCategory } from './types';

interface SkillPanelProps {
  data: (SkillData & { id?: string }) | null;
  onClose: () => void;
  onToggleStatus?: (nodeId: string) => void;
  isAvailable: boolean;
}

const poly = `polygon(
  10px 0,
  calc(100% - 10px) 0,
  100% 10px,
  100% calc(100% - 14px),
  calc(100% - 10px) 100%,
  calc(50% + 12px) 100%,
  50% calc(100% - 10px),
  calc(50% - 12px) 100%,
  10px 100%,
  0 calc(100% - 14px),
  0 10px
)`;

function SkillPanelComponent({ data, onClose, onToggleStatus, isAvailable }: SkillPanelProps) {
  const theme = useMemo(
    () => data
      ? CATEGORY_THEME[data.category as SkillCategory] || CATEGORY_THEME.keystone
      : CATEGORY_THEME.keystone,
    [data?.category]
  );

  if (!data) return null;

  // Cor da borda externa da carta
  const borderColor = isAvailable
    ? (data.isUnlocked ? theme.color : 'var(--rpg-gold)')
    : 'var(--rpg-muted)';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Carta */}
      <div
        className="relative w-[320px] min-h-[500px] animate-in zoom-in-95 duration-500 p-[3px]"
        style={{
          clipPath: poly,
          backgroundColor: borderColor,
          filter: data.isUnlocked ? `drop-shadow(0 0 25px ${theme.color}55)` : 'none',
        }}
      >
        {/* Fundo interno */}
        <div className="w-full h-full flex flex-col overflow-hidden" style={{ clipPath: poly, backgroundColor: '#000' }}>
          <div
            className="flex-1 m-[2px] flex flex-col p-6 relative overflow-hidden"
            style={{ clipPath: poly, backgroundColor: '#050505' }}
          >
            {/* Brilho de fundo — mantido pois é só opacity, sem blur pesado */}
            <div
              className="absolute -top-20 -left-20 w-64 h-64 opacity-10 pointer-events-none"
              style={{ backgroundColor: theme.color, filter: 'blur(60px)' }}
            />

            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div
                className="px-3 py-1 border"
                style={{
                  fontFamily: 'var(--font-pixel-title)',
                  fontSize: 7,
                  letterSpacing: '0.2em',
                  color: theme.color,
                  borderColor: `${theme.color}44`,
                  backgroundColor: `${theme.color}11`,
                }}
              >
                {data.category.toUpperCase()}
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center border cursor-pointer transition-colors"
                style={{
                  fontFamily: 'var(--font-pixel-title)',
                  fontSize: 8,
                  color: 'var(--rpg-muted)',
                  borderColor: 'var(--rpg-muted)',
                  background: 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--rpg-gold)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--rpg-muted)'}
              >
                X
              </button>
            </div>

            {/* ÍCONE */}
            <div
              className="relative w-full h-40 flex items-center justify-center mb-6 overflow-hidden border"
              style={{
                borderColor: data.isUnlocked ? `${theme.color}66` : 'var(--rpg-muted)',
                backgroundColor: 'rgba(0,0,0,0.6)',
              }}
            >
              {/* Dot grid decorativo */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{ backgroundImage: `radial-gradient(var(--rpg-gold) 1.5px, transparent 1.5px)`, backgroundSize: '15px 15px' }}
              />
              <span className={`text-6xl transition-all duration-700 ${data.isUnlocked ? 'grayscale-0 scale-110' : 'grayscale opacity-30'}`}>
                {isAvailable ? data.icon : '🔒'}
              </span>
            </div>

            {/* TEXTO */}
            <div className="flex-1 text-center flex flex-col items-center relative z-10 mt-2">
              <h2 style={{ fontFamily: 'var(--font-pixel-title)', fontSize: 11, color: '#fff', letterSpacing: '0.1em', marginBottom: 12, lineHeight: 1.6 }}>
                {data.label.toUpperCase()}
              </h2>

              <div className="w-16 h-[2px] mb-6" style={{ backgroundColor: isAvailable ? theme.color : 'var(--rpg-muted)' }} />

              <p style={{ fontFamily: 'var(--font-pixel-body)', fontSize: 15, color: 'rgba(200,184,154,0.6)', lineHeight: 1.7, padding: '0 8px' }}>
                {isAvailable
                  ? `"${data.description}"`
                  : 'REQUIRES FURTHER PROGRESSION TO UNLOCK THIS KNOWLEDGE.'}
              </p>
            </div>

            {/* BOTÃO */}
            <div className="mt-8 relative z-10">
              <button
                disabled={!isAvailable}
                onClick={() => onToggleStatus?.(data.id as string)}
                className="w-full py-4 border transition-all duration-300 cursor-pointer"
                style={{
                  fontFamily: 'var(--font-pixel-title)',
                  fontSize: 8,
                  letterSpacing: '0.25em',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  background: !isAvailable
                    ? 'transparent'
                    : data.isUnlocked
                      ? 'rgba(255,40,40,0.1)'
                      : theme.color,
                  borderColor: !isAvailable
                    ? 'var(--rpg-muted)'
                    : data.isUnlocked
                      ? '#ff4444'
                      : theme.color,
                  color: !isAvailable
                    ? 'var(--rpg-muted)'
                    : data.isUnlocked
                      ? '#ff4444'
                      : '#000',
                  boxShadow: isAvailable ? `3px 3px 0px rgba(0,0,0,0.8)` : 'none',
                }}
              >
                {data.isUnlocked ? '[ FORGET SKILL ]' : isAvailable ? '[ MASTER SKILL ]' : '[ LOCKED ]'}
              </button>
            </div>

            {/* ORNAMENTO */}
            <div className="mt-6 flex justify-center gap-3">
              <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: isAvailable ? theme.color : 'var(--rpg-muted)' }} />
              <div className="w-2 h-2 rotate-45 border" style={{ borderColor: 'var(--rpg-gold)', opacity: 0.3 }} />
              <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: isAvailable ? theme.color : 'var(--rpg-muted)' }} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export const SkillPanel = memo(SkillPanelComponent);