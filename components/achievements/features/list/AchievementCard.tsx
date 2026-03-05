'use client';
import { Achievement } from '../../types';
import { CATEGORY_LABELS } from '../../lib/achievements';

interface AchievementCardProps {
  achievement: Achievement;
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

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { isUnlocked, icon, title, description, category, progress } = achievement;
  const progressPct = progress ? Math.min((progress.current / progress.total) * 100, 100) : 0;

  return (
    <div
      className="relative p-[1.5px]"
      style={{ clipPath: poly, backgroundColor: isUnlocked ? '#2dd4bf' : '#27272a' }}
    >
      <div className="w-full h-full" style={{ clipPath: poly, backgroundColor: '#000' }}>
        <div
          className="relative flex flex-col"
          style={{ clipPath: poly, backgroundColor: '#080808', minHeight: '540px' }}
        >
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }}
          />

          <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-4">
            <span
              className="text-[8px] font-black uppercase tracking-[0.35em]"
              style={{ color: isUnlocked ? '#2dd4bf' : '#3f3f46' }}
            >
              {CATEGORY_LABELS[category]}
            </span>
            <span
              className="text-[8px] font-black uppercase tracking-[0.25em]"
              style={{ color: isUnlocked ? '#2dd4bf' : '#3f3f46' }}
            >
              {isUnlocked ? 'Obtida' : 'Bloqueada'}
            </span>
          </div>

          <div
            className="mx-5 h-[1px]"
            style={{ background: `linear-gradient(to right, transparent, ${isUnlocked ? 'rgba(45,212,191,0.3)' : '#27272a'}, transparent)` }}
          />

          <div
            className="relative z-10 flex items-center justify-center flex-1"
            style={{ minHeight: '200px' }}
          >
            <span
              className="text-7xl select-none transition-all duration-500"
              style={{
                filter: isUnlocked ? 'none' : 'grayscale(1) brightness(0.08)',
                transform: isUnlocked ? 'scale(1)' : 'scale(0.7)',
              }}
            >
              {isUnlocked ? icon : '?'}
            </span>
          </div>

          <div
            className="mx-5 mb-5 h-[1px]"
            style={{ background: `linear-gradient(to right, transparent, ${isUnlocked ? 'rgba(45,212,191,0.2)' : '#27272a'}, transparent)` }}
          />

          <div className="relative z-10 px-5 pb-4">
            <h3
              className="text-[12px] font-black uppercase tracking-[0.2em] mb-2 leading-tight"
              style={{ color: isUnlocked ? '#ffffff' : '#3f3f46' }}
            >
              {isUnlocked ? title : '??? ??? ???'}
            </h3>
            <p
              className="text-[11px] leading-relaxed font-light"
              style={{ color: isUnlocked ? '#a1a1aa' : '#27272a' }}
            >
              {isUnlocked ? description : 'Continue progredindo para revelar esta conquista.'}
            </p>
          </div>

          {progress && (
            <div className="relative z-10 px-5 pb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-[7px] font-black uppercase tracking-wider"
                  style={{ color: isUnlocked ? 'rgba(45,212,191,0.5)' : '#27272a' }}
                >
                  Progresso
                </span>
                <span
                  className="text-[8px] font-mono font-bold tabular-nums"
                  style={{ color: isUnlocked ? '#2dd4bf' : '#3f3f46' }}
                >
                  {progress.current}/{progress.total}
                </span>
              </div>
              <div className="h-[1px] w-full bg-white/[0.04]">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${progressPct}%`, backgroundColor: isUnlocked ? '#2dd4bf' : '#27272a' }}
                />
              </div>
            </div>
          )}

          <div className="relative z-10 flex justify-center gap-3 pb-5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1 h-1 rotate-45 border opacity-25"
                style={{ borderColor: isUnlocked ? '#2dd4bf' : '#3f3f46' }}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}