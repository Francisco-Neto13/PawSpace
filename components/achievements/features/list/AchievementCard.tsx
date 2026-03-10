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
    <article
      className="relative rounded-2xl border bg-[var(--bg-surface)] p-5 overflow-hidden flex flex-col gap-4 transition-all duration-300"
      style={{
        borderColor: isUnlocked ? 'var(--border-visible)' : 'var(--border-subtle)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex items-center justify-center py-6">
        <div
          className="w-20 h-20 rounded-2xl border flex items-center justify-center transition-all duration-300"
          style={{
            borderColor: isUnlocked ? 'var(--border-visible)' : 'var(--border-muted)',
            backgroundColor: isUnlocked ? 'var(--bg-elevated)' : 'var(--bg-input)',
          }}
        >
          {isUnlocked ? (
            <span className="text-3xl">{icon}</span>
          ) : (
            <span
              className="text-2xl font-black font-mono"
              style={{ color: 'var(--text-faint)' }}
            >
              ?
            </span>
          )}
        </div>
      </div>

      <div className="flex-1">
        <h3
          className="text-[11px] font-black uppercase tracking-[0.14em] mb-1.5 leading-tight"
          style={{ color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          {isUnlocked ? title : 'Bloqueada'}
        </h3>
        <p
          className="text-[11px] leading-relaxed font-normal"
          style={{ color: isUnlocked ? 'var(--text-secondary)' : 'var(--text-muted)' }}
        >
          {isUnlocked ? description : 'Continue progredindo para revelar esta conquista.'}
        </p>
      </div>

      {progress && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="text-[8px] font-black uppercase tracking-wide"
              style={{ color: isUnlocked ? 'var(--text-secondary)' : 'var(--text-muted)' }}
            >
              Progresso
            </span>
            <span
              className="text-[9px] font-mono font-bold tabular-nums"
              style={{ color: isUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="h-[2px] w-full bg-[var(--chart-faint)] overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                backgroundColor: isUnlocked ? 'var(--chart-strong)' : 'var(--text-faint)',
              }}
            />
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <span
          className="text-[8px] font-black uppercase tracking-[0.3em]"
          style={{ color: isUnlocked ? 'var(--text-secondary)' : 'var(--text-faint)' }}
        >
          {CATEGORY_LABELS[category]}
        </span>
        {isUnlocked && (
          <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-[var(--border-subtle)] text-[var(--text-secondary)]">
            Obtida
          </span>
        )}
      </div>
    </article>
  );
}