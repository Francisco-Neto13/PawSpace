'use client';
import React, { useMemo, memo } from 'react';
import { SkillData, CATEGORY_THEME, SkillCategory } from '../../types';

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

  const activeColor = useMemo(() => {
    return data?.color || theme.color;
  }, [data?.color, theme.color]);

  if (!data) return null;

  const displayLabel = data.label || data.name || "MÓDULO DESCONHECIDO";
  const skillId = data.id || "";

  const borderColor = data.isUnlocked 
    ? activeColor 
    : (isAvailable ? '#71717a' : '#3f3f46');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div
        className="relative w-[340px] min-h-[520px] animate-in zoom-in-95 duration-500 p-[2px]"
        style={{
          clipPath: poly,
          backgroundColor: borderColor, 
          transition: 'background-color 0.3s ease'
        }}
      >
        <div className="w-full h-full flex flex-col overflow-hidden" style={{ clipPath: poly, backgroundColor: '#000' }}>
          <div
            className="flex-1 m-[1px] flex flex-col p-8 relative overflow-hidden"
            style={{ clipPath: poly, backgroundColor: '#050505' }}
          >
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div
                className="px-3 py-0.5 border font-mono text-[10px] tracking-[0.2em] font-bold"
                style={{
                  color: data.isUnlocked ? activeColor : '#71717a',
                  borderColor: data.isUnlocked ? `${activeColor}44` : '#3f3f46',
                  backgroundColor: data.isUnlocked ? `${activeColor}11` : 'transparent',
                }}
              >
                {data.category?.toUpperCase() || 'CORE'}
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center border font-mono text-xs cursor-pointer transition-all duration-300 hover:bg-white/10 text-zinc-500 border-zinc-700"
              >
                ✕
              </button>
            </div>

            <div
              className="relative w-full h-44 flex items-center justify-center mb-8 overflow-hidden border border-white/5"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{ 
                   backgroundImage: `radial-gradient(${data.isUnlocked ? activeColor : '#71717a'} 1px, transparent 0)`, 
                   backgroundSize: '20px 20px' 
                }}
              />
              <span className={`text-7xl transition-all duration-1000 ${data.isUnlocked ? 'grayscale-0 scale-110' : 'grayscale opacity-20'}`}
                style={{
                   filter: data.isUnlocked ? `drop-shadow(0 0 20px ${activeColor}55)` : 'none'
                }}
              >
                {isAvailable ? (data.icon || '✦') : '🔒'}
              </span>
            </div>

            <div className="flex-1 text-center flex flex-col items-center relative z-10">
              <h2 className="font-sans text-xl font-bold text-white tracking-[0.1em] mb-4 leading-tight">
                {displayLabel.toUpperCase()}
              </h2>

              <div className="w-12 h-[2px] mb-6" style={{ backgroundColor: data.isUnlocked ? activeColor : '#3f3f46' }} />

              <p className="font-sans text-sm font-medium leading-relaxed px-2 transition-colors duration-500 text-zinc-400">
                {isAvailable
                  ? (data.description || 'Nenhuma descrição disponível para este protocolo.')
                  : 'SISTEMA BLOQUEADO. REQUER PROGRESSÃO ADICIONAL NO PROTOCOLO NEXUS PARA LIBERAR ESTE CONHECIMENTO.'}
              </p>
            </div>

            <div className="mt-8 relative z-10">
              <button
                disabled={!isAvailable}
                onClick={() => skillId && onToggleStatus?.(skillId)}
                className="w-full py-4 border font-mono text-[11px] tracking-[0.2em] font-bold transition-all duration-300 flex items-center justify-center gap-2"
                style={{
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  background: !isAvailable 
                    ? 'transparent' 
                    : data.isUnlocked 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.95)', 
                  borderColor: !isAvailable ? '#3f3f46' : '#71717a',
                  color: !isAvailable 
                    ? '#3f3f46' 
                    : data.isUnlocked 
                      ? '#ffffff' 
                      : '#000000',
                }}
              >
                {data.isUnlocked ? '[ Bloquear ]' : isAvailable ? '[ Desbloquear ]' : '[ Acesso Negado ]'}
              </button>
            </div>

            <div className="mt-6 flex justify-center gap-4 opacity-40">
              <div className="w-1.5 h-1.5 rotate-45 border border-current" style={{ color: borderColor }} />
              <div className="w-1.5 h-1.5 rotate-45 border border-current" style={{ color: borderColor }} />
              <div className="w-1.5 h-1.5 rotate-45 border border-current" style={{ color: borderColor }} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export const SkillPanel = memo(SkillPanelComponent);