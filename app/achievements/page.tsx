'use client';

import { Suspense } from 'react';
import { AchievementsPage } from '@/components/achievements/AchievementsPage';

export default function AchievementsRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-[#0a0a0a]">
          <div className="w-6 h-6 border-2 border-[#ffffff]/20 border-t-[#ffffff] rounded-full animate-spin" />
        </div>
      }
    >
      <AchievementsPage />
    </Suspense>
  );
}

