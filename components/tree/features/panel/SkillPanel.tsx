'use client';
import React, { useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { SkillData } from '../../types';

interface SkillPanelProps {
  data: (SkillData & { id?: string }) | null;
  onClose: () => void;
}

const DEFAULT_SYSTEM_COLOR = '#ffffff';

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

function SkillPanelComponent({ data, onClose }: SkillPanelProps) {
  const router = useRouter();
  const activeColor = useMemo(() => data?.color || DEFAULT_SYSTEM_COLOR, [data?.color]);

  if (!data) return null;

  const displayLabel = data.label || data.name || 'MÓDULO DESCONHECIDO';
  const skillId = data.id || '';

  const handleViewLibrary = () => {
    onClose();
    router.push(`/library?nodeId=${skillId}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div
        className="relative w-[340px] min-h-[520px] animate-in zoom-in-95 duration-500 p-[1.5px] z-10"
        style={{ clipPath: poly, backgroundColor: activeColor, transition: 'background-color 0.5s ease' }}
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
                  color: activeColor,
                  borderColor: `${activeColor}30`,
                  backgroundColor: `${activeColor}0d`,
                }}
              >
                {data.category?.toUpperCase() || 'MÓDULO'}
              </div>

              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center border border-white/10 text-zinc-500 hover:text-zinc-200 hover:border-white/20 transition-all duration-300 text-xs cursor-pointer"
              >
                X
              </button>
            </div>

            <div
              className="relative w-full h-40 flex items-center justify-center mb-8 overflow-hidden border border-white/[0.04]"
              style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage: `radial-gradient(${activeColor} 1px, transparent 0)`,
                  backgroundSize: '20px 20px',
                }}
              />
              <span className="text-7xl transition-all duration-700 grayscale-0 scale-110">
                {data.icon || '*'}
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center text-center relative z-10">
              <h2 className="text-white text-base font-black uppercase tracking-[0.3em] leading-tight mb-3">
                {displayLabel}
              </h2>

              <div
                className="w-12 h-[1px] mb-5"
                style={{
                  background: `linear-gradient(to right, transparent, ${activeColor}, transparent)`,
                }}
              />

              <div className="flex items-center gap-1.5 mb-5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.65)',
                    boxShadow: '0 0 6px rgba(255,255,255,0.45)',
                  }}
                />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">
                  Disponível
                </span>
              </div>

              <p className="text-zinc-400 text-sm font-medium leading-relaxed px-2 min-h-[60px]">
                {data.description || 'Nenhuma descrição disponível para este módulo.'}
              </p>
            </div>

            <div className="mt-6 relative z-10">
              <button
                onClick={handleViewLibrary}
                className="w-full py-3 border border-white/[0.06] text-zinc-400 text-[9px] font-black uppercase tracking-[0.3em] hover:border-[#ffffff]/20 hover:text-[#ffffff] hover:bg-[#ffffff]/[0.03] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen size={12} />
                Visualizar na Biblioteca
              </button>
            </div>

            <div className="mt-5 flex justify-center gap-3 opacity-30 relative z-10">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rotate-45 border"
                  style={{ borderColor: activeColor }}
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

