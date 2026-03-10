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
      className={`relative library-panel p-4 md:p-5 overflow-hidden flex flex-col gap-4 h-full transition-colors duration-200 ${
        isUnlocked ? 'library-panel-hover' : ''
      }`}
      style={{ borderColor: isUnlocked ? 'var(--border-visible)' : 'var(--border-subtle)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex items-center justify-between gap-2">
        <span className="library-chip">{CATEGORY_LABELS[category]}</span>
        <span
          className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 border rounded-lg ${
            isUnlocked
              ? 'border-[var(--border-visible)] text-[var(--text-primary)] bg-[var(--bg-elevated)]'
              : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
          }`}
        >
          {isUnlocked ? 'Obtida' : 'Bloqueada'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`w-14 h-14 rounded-xl border flex items-center justify-center shrink-0 ${
            isUnlocked ? 'bg-[var(--bg-elevated)] border-[var(--border-visible)]' : 'bg-[var(--bg-input)] border-[var(--border-muted)]'
          }`}
        >
          {isUnlocked ? (
            <span className="text-2xl">{icon}</span>
          ) : (
            <span className="text-xl font-black font-mono text-[var(--text-faint)]">?</span>
          )}
        </div>

        <div className="min-w-0">
          <h3
            className="text-[11px] font-black uppercase tracking-[0.12em] leading-tight mb-1"
            style={{ color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {isUnlocked ? title : 'Conquista Oculta'}
          </h3>
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: isUnlocked ? 'var(--text-secondary)' : 'var(--text-muted)' }}
          >
            {isUnlocked ? description : 'Continue progredindo para revelar esta conquista.'}
          </p>
        </div>
      </div>

      {progress && (
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="text-[8px] font-black uppercase tracking-wider"
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
          <div className="h-[3px] w-full bg-[var(--chart-faint)] overflow-hidden rounded-full">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                backgroundColor: isUnlocked ? 'var(--chart-strong)' : 'var(--text-faint)',
              }}
            />
          </div>
        </div>
      )}
    </article>
  );
}
