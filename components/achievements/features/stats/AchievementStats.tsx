'use client';
import { Achievement } from '../../types';
import { PawIcon } from '@/components/shared/PawIcon';

interface AchievementStatsProps {
  achievements: Achievement[];
}

export function AchievementStats({ achievements }: AchievementStatsProps) {
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount    = achievements.length;
  const pct           = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">

      <div className="flex items-center gap-3">
        <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
        <span className="text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.4em]">
          Pawspace / Conquistas
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border-subtle)] to-transparent" />
      </div>

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] shrink-0">
            Conquistas desbloqueadas
          </span>
          <div className="flex-1 h-[2px] bg-[var(--border-subtle)] overflow-hidden rounded-full">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                backgroundColor: 'var(--chart-strong)',
                transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          <span className="text-[10px] font-mono font-bold text-[var(--text-primary)] tabular-nums shrink-0">
            {String(unlockedCount).padStart(2, '0')}
            <span className="text-[var(--text-secondary)]">/{String(totalCount).padStart(2, '0')}</span>
          </span>

          <span className="text-[9px] font-mono font-black text-[var(--text-secondary)] shrink-0 w-8 text-right">
            {pct}%
          </span>
        </div>
      </div>

    </div>
  );
}