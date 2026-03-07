'use server';

import { createClient } from '@/shared/supabase/server';
import {
  getLibraryTypeStatsByUserId,
  type LibraryTypeStatsResult,
} from './library/queries';
import {
  getRecentActivityPageForUserId,
  type RecentActivityResult,
} from './activity/queries';

export interface OverviewBootstrapResult {
  summary: {
    total: number;
    unlocked: number;
    progress: number;
  };
  libraryStats: LibraryTypeStatsResult;
  recentActivity: RecentActivityResult;
}

const EMPTY_SUMMARY = {
  total: 0,
  unlocked: 0,
  progress: 0,
};

const UNAUTHORIZED_RESULT: OverviewBootstrapResult = {
  summary: EMPTY_SUMMARY,
  libraryStats: { status: 'unauthorized', byType: [], totalContents: 0, totalNodes: 0 },
  recentActivity: { status: 'unauthorized', items: [], nextCursor: null, hasMore: false },
};

export async function getOverviewBootstrap(): Promise<OverviewBootstrapResult> {
  const start = Date.now();
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return UNAUTHORIZED_RESULT;
  }

  const [libraryStats, recentActivity] = await Promise.all([
    getLibraryTypeStatsByUserId(user.id),
    getRecentActivityPageForUserId(user.id, { filter: 'all', limit: 10 }),
  ]);

  console.log(`[Overview Bootstrap] completed in ${Date.now() - start}ms`);

  return {
    summary: EMPTY_SUMMARY,
    libraryStats,
    recentActivity,
  };
}
