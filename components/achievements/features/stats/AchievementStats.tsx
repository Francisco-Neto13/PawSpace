'use client';
import { Achievement } from '../../types';

interface AchievementStatsProps {
  achievements: Achievement[];
}

export function AchievementStats({ achievements }: AchievementStatsProps) {
  const unlockedCount = achievements.filter((achievement) => achievement.isUnlocked).length;
  const totalCount = achievements.length;
  const inProgressCount = achievements.filter(
    (achievement) => achievement.progress && achievement.progress.current < achievement.progress.total
  ).length;
  const lockedCount = Math.max(totalCount - unlockedCount, 0);
  const completionPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <article className="library-panel p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
        <p className="library-kicker mb-3">Desbloqueadas</p>
        <p className="text-[var(--text-primary)] text-4xl font-black font-mono tabular-nums leading-none mb-2">
          {String(unlockedCount).padStart(2, '0')}
        </p>
        <p className="library-subtitle">de {String(totalCount).padStart(2, '0')} conquistas totais</p>
      </article>

      <article className="library-panel p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
        <p className="library-kicker mb-3">Conclusão</p>
        <p className="text-[var(--text-primary)] text-4xl font-black font-mono tabular-nums leading-none mb-3">
          {completionPct}
          <span className="text-xl text-[var(--text-secondary)] ml-0.5">%</span>
        </p>
        <div className="h-[4px] w-full bg-[var(--chart-faint)] overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${completionPct}%`,
              backgroundColor: 'var(--chart-strong)',
            }}
          />
        </div>
      </article>

      <article className="library-panel p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
        <p className="library-kicker mb-3">Em andamento</p>
        <p className="text-[var(--text-primary)] text-4xl font-black font-mono tabular-nums leading-none mb-2">
          {String(inProgressCount).padStart(2, '0')}
        </p>
        <p className="library-subtitle">{lockedCount} ainda bloqueada(s)</p>
      </article>
    </section>
  );
}
