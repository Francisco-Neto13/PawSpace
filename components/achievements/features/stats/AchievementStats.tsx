'use client';
import { Achievement } from '../../types';

interface AchievementStatsProps {
  achievements: Achievement[];
}

export function AchievementStats({ achievements }: AchievementStatsProps) {
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount    = achievements.length;
  const progressPct   = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">

      <div className="flex items-center gap-3">
        <div className="w-1 h-4 bg-[#c8b89a]" />
        <span className="text-[#c8b89a] text-[9px] font-black uppercase tracking-[0.4em]">
          Nexus / Conquistas
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-[#c8b89a]/15 to-transparent" />
        <span className="text-[9px] font-mono font-bold text-zinc-500 tabular-nums shrink-0">
          {String(unlockedCount).padStart(2, '0')}
          <span className="text-zinc-700">/{String(totalCount).padStart(2, '0')}</span>
        </span>
      </div>
    </div>
  );
}