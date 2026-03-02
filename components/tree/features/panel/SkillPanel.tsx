'use client';
import React, { useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { SkillData } from '../../types';

interface SkillPanelProps {
  data: (SkillData & { id?: string }) | null;
  onClose: () => void;
  onToggleStatus?: (nodeId: string) => void;
  isAvailable: boolean;
}

const DEFAULT_SYSTEM_COLOR = '#c8b89a';

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
  const router = useRouter();

  const activeColor = useMemo(() => data?.color || DEFAULT_SYSTEM_COLOR, [data?.color]);

  if (!data) return null;

  const displayLabel = data.label || data.name || 'MÓDULO DESCONHECIDO';
  const skillId = data.id || '';

  const borderColor = data.isUnlocked
    ? activeColor
    : isAvailable ? '#52525b' : '#27272a';

  const handleViewLibrary = () => {
    onClose();
    router.push(`/library?nodeId=${skillId}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div
        className="relative w-[340px] min-h-[520px] animate-in zoom-in-95 duration-500 p-[1.5px] z-10"
        style={{ clipPath: poly, backgroundColor: borderColor, transition: 'background-color 0.5s ease' }}
      >
        <div className="w-full h-full" style={{ clipPath: poly, backgroundColor: '#000' }}>
          <div
            className="flex-1 flex flex-col p-8 relative overflow-hidden h-full"
            style={{ clipPath: poly, backgroundColor: '#080808' }}
          >
            <div
              className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
              }}
            />

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div
                className="px-3 py-0.5 border text-[9px] font-black tracking-[0.4em] uppercase"
                style={{
                  color: data.isUnlocked ? activeColor : '#52525b',
                  borderColor: data.isUnlocked ? `${activeColor}30` : '#27272a',
                  backgroundColor: data.isUnlocked ? `${activeColor}0d` : 'transparent',
                }}
              >
                {data.category?.toUpperCase() || 'PROTOCOLO'}
              </div>

              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center border border-white/10 text-zinc-600 hover:text-zinc-300 hover:border-white/20 transition-all duration-300 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div
              className="relative w-full h-40 flex items-center justify-center mb-8 overflow-hidden border border-white/[0.04]"
              style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage: `radial-gradient(${data.isUnlocked ? activeColor : '#3f3f46'} 1px, transparent 0)`,
                  backgroundSize: '20px 20px',
                }}
              />
              <span
                className={`text-7xl transition-all duration-700 ${data.isUnlocked ? 'grayscale-0 scale-110' : 'grayscale opacity-20'}`}
              >
                {isAvailable ? (data.icon || '✦') : '🔒'}
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center text-center relative z-10">
              <h2 className="text-white text-base font-black uppercase tracking-[0.3em] leading-tight mb-3">
                {displayLabel}
              </h2>

              <div
                className="w-12 h-[1px] mb-5"
                style={{
                  background: `linear-gradient(to right, transparent, ${data.isUnlocked ? activeColor : '#3f3f46'}, transparent)`,
                }}
              />

              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: data.isUnlocked ? activeColor : '#3f3f46',
                      boxShadow: data.isUnlocked ? `0 0 6px ${activeColor}` : 'none',
                    }}
                  />
                  <span
                    className="text-[9px] font-black uppercase tracking-[0.2em]"
                    style={{ color: data.isUnlocked ? activeColor : '#52525b' }}
                  >
                    {data.isUnlocked ? 'Desbloqueado' : 'Bloqueado'}
                  </span>
                </div>

                <div className="w-[1px] h-3 bg-white/10" />

                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: isAvailable ? '#34d399' : '#3f3f46',
                      boxShadow: isAvailable ? '0 0 6px #34d399' : 'none',
                    }}
                  />
                  <span
                    className="text-[9px] font-black uppercase tracking-[0.2em]"
                    style={{ color: isAvailable ? '#34d399' : '#52525b' }}
                  >
                    {isAvailable ? 'Disponível' : 'Indisponível'}
                  </span>
                </div>
              </div>

              <p className="text-zinc-400 text-sm font-medium leading-relaxed px-2 min-h-[60px]">
                {isAvailable
                  ? (data.description || 'Nenhuma descrição disponível para este protocolo.')
                  : 'Sistema bloqueado. Requer progressão adicional no protocolo Nexus para liberar este conhecimento.'}
              </p>
            </div>

            {isAvailable && (
              <div className="mt-6 relative z-10">
                <button
                  onClick={handleViewLibrary}
                  className="w-full py-3 border border-white/[0.06] text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] hover:border-[#c8b89a]/20 hover:text-[#c8b89a] hover:bg-[#c8b89a]/[0.03] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen size={12} />
                  Visualizar na Biblioteca
                </button>
              </div>
            )}

            <div className="mt-3 relative z-10">
              <button
                disabled={!isAvailable}
                onClick={() => skillId && onToggleStatus?.(skillId)}
                className="w-full py-4 border text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 flex items-center justify-center gap-2"
                style={{
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  background: !isAvailable
                    ? 'transparent'
                    : data.isUnlocked
                      ? 'rgba(255,255,255,0.04)'
                      : 'transparent',
                  borderColor: !isAvailable
                    ? '#27272a'
                    : data.isUnlocked
                      ? `${activeColor}40`
                      : '#52525b',
                  color: !isAvailable
                    ? '#3f3f46'
                    : data.isUnlocked
                      ? activeColor
                      : '#a1a1aa',
                }}
              >
                {!isAvailable
                  ? '[ Acesso Negado ]'
                  : data.isUnlocked
                    ? '[ Bloquear Módulo ]'
                    : '[ Desbloquear Módulo ]'}
              </button>
            </div>

            <div className="mt-5 flex justify-center gap-3 opacity-30 relative z-10">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rotate-45 border"
                  style={{ borderColor }}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export const SkillPanel = memo(SkillPanelComponent);