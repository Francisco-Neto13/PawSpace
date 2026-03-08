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
    <article className="relative min-h-[320px] rounded-2xl border border-[var(--border-visible)] bg-[var(--bg-surface)] p-5 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="relative z-10 flex items-center justify-between">
        <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${isUnlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
          {CATEGORY_LABELS[category]}
        </span>
        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border ${
          isUnlocked
            ? 'text-[var(--text-primary)] border-[var(--border-visible)] bg-[var(--bg-elevated)]'
            : 'text-[var(--text-secondary)] border-[var(--border-subtle)] bg-[var(--bg-surface)]'
        }`}>
          {isUnlocked ? 'Obtida' : 'Pendente'}
        </span>
      </div>

      <div className="relative z-10 flex items-center justify-center py-8">
        <div className={`w-24 h-24 rounded-2xl border flex items-center justify-center text-3xl font-black font-mono tracking-tight ${
          isUnlocked ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)]' : 'border-[var(--border-muted)] bg-[var(--bg-input)] text-[var(--text-muted)]'
        }`}>
          {isUnlocked ? icon : '---'}
        </div>
      </div>

      <div className="relative z-10">
        <h3 className={`text-[12px] font-black uppercase tracking-[0.14em] mb-2 leading-tight ${isUnlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
          {isUnlocked ? title : 'Bloqueada'}
        </h3>
        <p className={`text-[12px] leading-relaxed font-normal ${isUnlocked ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>
          {isUnlocked ? description : 'Continue progredindo para revelar esta conquista.'}
        </p>
      </div>

      {progress && (
        <div className="relative z-10 mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[8px] font-black uppercase tracking-wide ${isUnlocked ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>
              Progresso
            </span>
            <span className={`text-[9px] font-mono font-bold tabular-nums ${isUnlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="h-[2px] w-full bg-[var(--chart-faint)] overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${progressPct}%`, backgroundColor: isUnlocked ? 'var(--chart-strong)' : 'var(--text-faint)' }}
            />
          </div>
        </div>
      )}
    </article>
  );
}
