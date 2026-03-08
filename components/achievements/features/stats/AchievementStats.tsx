'use client';
import { Achievement } from '../../types';
import { PawIcon } from '@/components/shared/PawIcon';

interface AchievementStatsProps {
  achievements: Achievement[];
}

export function AchievementStats({ achievements }: AchievementStatsProps) {
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount    = achievements.length;

  return (
    <div className="space-y-4 relative">
      <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-[var(--text-primary)] opacity-[0.04] pointer-events-none" />
      <div className="flex items-center gap-3">
        <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
        <span className="text-[var(--text-primary)] text-[10px] font-black uppercase tracking-[0.35em]">
          Pawspace / Conquistas
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--shimmer-via)] to-transparent" />
        <span className="text-[10px] font-mono font-bold text-[var(--text-primary)] tabular-nums shrink-0">
          {String(unlockedCount).padStart(2, '0')}
          <span className="text-[var(--text-secondary)]">/{String(totalCount).padStart(2, '0')}</span>
        </span>
      </div>
    </div>
  );
}
