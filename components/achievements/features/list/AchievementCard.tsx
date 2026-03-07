'use client';
import { Achievement } from '../../types';
import { CATEGORY_LABELS } from '../../lib/achievements';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { isUnlocked, icon, title, description, category, progress } = achievement;
  const progressPct = progress ? Math.min((progress.current / progress.total) * 100, 100) : 0;

  return (
    <article className="relative min-h-[320px] rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10 flex items-center justify-between">
        <span className={`text-[8px] font-black uppercase tracking-[0.35em] ${isUnlocked ? 'text-white/80' : 'text-zinc-400'}`}>
          {CATEGORY_LABELS[category]}
        </span>
        <span className={`text-[8px] font-black uppercase tracking-[0.25em] ${isUnlocked ? 'text-white' : 'text-zinc-400'}`}>
          {isUnlocked ? 'Obtida' : 'Pendente'}
        </span>
      </div>

      <div className="relative z-10 flex items-center justify-center py-8">
        <div className={`w-24 h-24 rounded-2xl border flex items-center justify-center text-3xl font-black font-mono tracking-tight ${
          isUnlocked ? 'border-white/25 bg-white/[0.06] text-white' : 'border-white/[0.08] bg-black/30 text-zinc-500'
        }`}>
          {isUnlocked ? icon : '---'}
        </div>
      </div>

      <div className="relative z-10">
        <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-2 leading-tight ${isUnlocked ? 'text-white' : 'text-zinc-400'}`}>
          {isUnlocked ? title : 'Bloqueada'}
        </h3>
        <p className={`text-[11px] leading-relaxed font-light ${isUnlocked ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {isUnlocked ? description : 'Continue progredindo para revelar esta conquista.'}
        </p>
      </div>

      {progress && (
        <div className="relative z-10 mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[7px] font-black uppercase tracking-wider ${isUnlocked ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Progresso
            </span>
            <span className={`text-[8px] font-mono font-bold tabular-nums ${isUnlocked ? 'text-white' : 'text-zinc-400'}`}>
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="h-[2px] w-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${progressPct}%`, backgroundColor: isUnlocked ? '#ffffff' : '#3f3f46' }}
            />
          </div>
        </div>
      )}
    </article>
  );
}
