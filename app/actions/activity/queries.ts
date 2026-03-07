'use server';

import prisma from '@/shared/lib/prisma';
import { getAuthUser } from '../journal/auth-helper';

export type ActivityFilter = 'all' | 'journal' | 'skill' | 'library';

type JournalActivityItem = {
  key: string;
  type: 'journal';
  id: string;
  title: string;
  date: string;
};

type SkillActivityItem = {
  key: string;
  type: 'skill';
  id: string;
  title: string;
  icon: string;
  date: string;
};

type LibraryActivityItem = {
  key: string;
  type: 'library';
  id: string;
  title: string;
  icon: string;
  date: string;
  contentType: string;
};

export type ActivityFeedItem = JournalActivityItem | SkillActivityItem | LibraryActivityItem;

export interface GetRecentActivityInput {
  cursor?: string | null;
  limit?: number;
  filter?: ActivityFilter;
}

export type RecentActivityResult =
  | { status: 'ok'; items: ActivityFeedItem[]; nextCursor: string | null; hasMore: boolean }
  | { status: 'unauthorized' | 'error'; items: []; nextCursor: null; hasMore: false };

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;
const WINDOW_MULTIPLIER = 4;

function clampLimit(limit?: number) {
  if (!limit || Number.isNaN(limit)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit)));
}

function parseCursor(cursor?: string | null) {
  if (!cursor) return null;
  const parsed = new Date(cursor);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function getRecentActivityPageForUserId(
  userId: string,
  input: GetRecentActivityInput = {}
): Promise<RecentActivityResult> {
  const filter = input.filter ?? 'all';
  const limit = clampLimit(input.limit);
  const cursorDate = parseCursor(input.cursor);
  const fetchTake = Math.max(limit * WINDOW_MULTIPLIER, limit + 6);

  const whereWithCursor = cursorDate
    ? { userId, updatedAt: { lt: cursorDate } }
    : { userId };

  const shouldLoadJournal = filter === 'all' || filter === 'journal';
  const shouldLoadSkill = filter === 'all' || filter === 'skill';
  const shouldLoadLibrary = filter === 'all' || filter === 'library';

  try {
    const [journalRows, skillRows, libraryRows] = await Promise.all([
      shouldLoadJournal
        ? prisma.journalEntry.findMany({
            where: whereWithCursor,
            select: { id: true, title: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            take: fetchTake,
          })
        : Promise.resolve([]),
      shouldLoadSkill
        ? prisma.skill.findMany({
            where: whereWithCursor,
            select: { id: true, name: true, icon: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            take: fetchTake,
          })
        : Promise.resolve([]),
      shouldLoadLibrary
        ? prisma.libraryContent.findMany({
            where: whereWithCursor,
            select: { id: true, title: true, type: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            take: fetchTake,
          })
        : Promise.resolve([]),
    ]);

    const journalItems: ActivityFeedItem[] = journalRows.map((row) => {
      const isoDate = row.updatedAt.toISOString();
      return {
        key: `journal:${row.id}:${isoDate}`,
        type: 'journal',
        id: row.id,
        title: row.title?.trim() || 'Sem titulo',
        date: isoDate,
      };
    });

    const skillItems: ActivityFeedItem[] = skillRows.map((row) => {
      const isoDate = row.updatedAt.toISOString();
      return {
        key: `skill:${row.id}:${isoDate}`,
        type: 'skill',
        id: row.id,
        title: row.name?.trim() || 'Modulo sem nome',
        icon: row.icon || '*',
        date: isoDate,
      };
    });

    const libraryItems: ActivityFeedItem[] = libraryRows.map((row) => {
      const isoDate = row.updatedAt.toISOString();
      const contentType = row.type || 'conteudo';
      return {
        key: `library:${row.id}:${isoDate}`,
        type: 'library',
        id: row.id,
        title: row.title?.trim() || 'Conteudo sem titulo',
        icon: 'L',
        date: isoDate,
        contentType,
      };
    });

    const merged = [...journalItems, ...skillItems, ...libraryItems].sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (diff !== 0) return diff;
      return a.key.localeCompare(b.key);
    });

    const items = merged.slice(0, limit);
    const nextCursor = items.length === limit ? items[items.length - 1].date : null;
    const hasMore = merged.length > limit;

    return { status: 'ok', items, nextCursor, hasMore };
  } catch (error) {
    console.error('[Activity Query] Failed to fetch recent activity page:', error);
    return { status: 'error', items: [], nextCursor: null, hasMore: false };
  }
}

export async function getRecentActivityPage(input: GetRecentActivityInput = {}): Promise<RecentActivityResult> {
  const userId = await getAuthUser();
  if (!userId) {
    return { status: 'unauthorized', items: [], nextCursor: null, hasMore: false };
  }

  return getRecentActivityPageForUserId(userId, input);
}
