'use client';

import { Suspense } from 'react';
import { AchievementsPage } from '@/components/achievements/pages/AchievementsPage';

export default function AchievementsRoute() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[var(--bg-base)]">
          <div className="w-7 h-7 border-2 border-[var(--border-visible)] border-t-[var(--text-primary)] rounded-full animate-spin" />
        </div>
      }
    >
      <AchievementsPage />
    </Suspense>
  );
}
