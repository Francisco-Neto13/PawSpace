'use server';

import * as queries from './activity/queries';

export async function getRecentActivityPage(input?: queries.GetRecentActivityInput) {
  return queries.getRecentActivityPage(input);
}

export type ActivityFeedItem = queries.ActivityFeedItem;
export type ActivityFilter = queries.ActivityFilter;
export type RecentActivityResult = queries.RecentActivityResult;
