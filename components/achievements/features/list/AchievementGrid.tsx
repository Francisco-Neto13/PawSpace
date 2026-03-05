'use client';
import { Achievement } from '../../types';
import { AchievementCard } from './AchievementCard';

interface AchievementGridProps {
  achievements: Achievement[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
      {achievements.map(achievement => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
}