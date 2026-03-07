'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import {
  getRecentActivityPage,
  type ActivityFeedItem,
  type ActivityFilter,
  type RecentActivityResult,
} from '@/app/actions/activity';

const PAGE_SIZE = 10;

function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (mins > 0) return `${mins}m`;
  return 'agora';
}

function mergeUniqueItems(previous: ActivityFeedItem[], incoming: ActivityFeedItem[]) {
  const seen = new Set<string>();
  const merged: ActivityFeedItem[] = [];

  [...previous, ...incoming].forEach((item) => {
    if (seen.has(item.key)) return;
    seen.add(item.key);
    merged.push(item);
  });

  return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

interface RecentActivityFeedProps {
  initialPage: RecentActivityResult | null;
  isBootstrapLoading?: boolean;
}

function RecentActivityFeed({ initialPage, isBootstrapLoading = false }: RecentActivityFeedProps) {
  const hasInitialPage = initialPage?.status === 'ok';
  const skipFirstResetFetchRef = useRef(false);
  const hasBootstrappedRef = useRef(false);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<ActivityFeedItem[]>(
    hasInitialPage ? (initialPage?.items ?? []) : []
  );
  const [nextCursor, setNextCursor] = useState<string | null>(
    hasInitialPage ? (initialPage?.nextCursor ?? null) : null
  );
  const [hasMore, setHasMore] = useState<boolean>(
    hasInitialPage ? Boolean(initialPage?.hasMore && initialPage.nextCursor) : false
  );
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadFirstPage = useCallback(async (activeFilter: ActivityFilter) => {
    setIsLoadingInitial(true);
    setItems([]);
    setNextCursor(null);
    setHasMore(false);

    try {
      const response = await getRecentActivityPage({
        limit: PAGE_SIZE,
        filter: activeFilter,
        cursor: null,
      });

      if (response.status !== 'ok') {
        setItems([]);
        setNextCursor(null);
        setHasMore(false);
        return;
      }

      setItems(response.items);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore && Boolean(response.nextCursor));
    } catch (error) {
      console.error('[Overview] Failed to load recent activity:', error);
      setItems([]);
      setNextCursor(null);
      setHasMore(false);
    } finally {
      setIsLoadingInitial(false);
    }
  }, []);

  const loadMorePage = useCallback(async () => {
    if (!hasMore || !nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const response = await getRecentActivityPage({
        limit: PAGE_SIZE,
        filter,
        cursor: nextCursor,
      });

      if (response.status !== 'ok') return;

      setItems((previous) => mergeUniqueItems(previous, response.items));
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore && Boolean(response.nextCursor));
    } catch (error) {
      console.error('[Overview] Failed to load more activity:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [filter, hasMore, nextCursor, isLoadingMore]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hasBootstrappedRef.current) return;
    if (isBootstrapLoading || initialPage === null) return;

    if (initialPage.status === 'ok') {
      setItems(initialPage.items);
      setNextCursor(initialPage.nextCursor);
      setHasMore(initialPage.hasMore && Boolean(initialPage.nextCursor));
      skipFirstResetFetchRef.current = true;
    } else {
      setItems([]);
      setNextCursor(null);
      setHasMore(false);
      skipFirstResetFetchRef.current = false;
    }

    hasBootstrappedRef.current = true;
  }, [initialPage, isBootstrapLoading]);

  useEffect(() => {
    if (isBootstrapLoading) return;

    if (filter === 'all' && skipFirstResetFetchRef.current) {
      skipFirstResetFetchRef.current = false;
      return;
    }
    void loadFirstPage(filter);
  }, [filter, loadFirstPage, isBootstrapLoading]);

  const { journalCount, skillCount, libraryCount } = useMemo(() => ({
    journalCount: items.filter((i) => i.type === 'journal').length,
    skillCount: items.filter((i) => i.type === 'skill').length,
    libraryCount: items.filter((i) => i.type === 'library').length,
  }), [items]);

  const isLoading = (isBootstrapLoading || isLoadingInitial) && items.length === 0;

  return (
    <div className="h-full max-h-[440px] rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
        Atividade Recente
      </p>
      <p className="text-[9px] text-zinc-400 mb-4 ml-3">log das ultimas alteracoes</p>

      <div className="flex gap-1 mb-4 ml-3 shrink-0">
        {([
          ['all', 'Tudo', items.length],
          ['journal', 'Diario', journalCount],
          ['skill', 'Modulos', skillCount],
          ['library', 'Biblioteca', libraryCount],
        ] as const).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="text-[8px] font-black uppercase tracking-wider px-2 py-1 border transition-all duration-200"
            style={{
              borderColor: filter === key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
              color: filter === key ? 'rgba(255,255,255,0.8)' : '#a1a1aa',
              backgroundColor: filter === key ? 'rgba(255,255,255,0.04)' : 'transparent',
            }}
          >
            {label} <span className="opacity-50">{count}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-[9px] text-zinc-500 ml-3">Carregando atividade...</p>
      ) : items.length === 0 ? (
        <p className="text-[9px] text-zinc-500 ml-3">Nenhuma patinha por aqui ainda.</p>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {items.map((item, i) => {
            const isJournal = item.type === 'journal';
            return (
              <div
                key={item.key}
                className="flex items-center gap-3 py-2.5 border-b border-white/[0.03] last:border-0 group"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateX(0)' : 'translateX(-6px)',
                  transition: `opacity 0.4s ease ${i * 40}ms, transform 0.4s ease ${i * 40}ms`,
                }}
              >
                <div
                  className="w-6 h-6 flex items-center justify-center shrink-0 border transition-colors duration-200"
                  style={{
                    borderColor: isJournal ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                    backgroundColor: isJournal ? 'rgba(255,255,255,0.04)' : 'transparent',
                  }}
                >
                  {isJournal
                    ? <BookOpen size={10} className="text-white/60 group-hover:text-white/80 transition-colors" />
                    : <span className="text-xs leading-none">{item.icon}</span>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="text-[7px] font-black uppercase tracking-wider"
                      style={{ color: isJournal ? 'rgba(255,255,255,0.6)' : '#a1a1aa' }}
                    >
                      {item.type === 'journal' ? 'Diario' : item.type === 'skill' ? 'Modulo' : 'Biblioteca'}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium truncate block group-hover:text-zinc-200 transition-colors duration-200">
                    {item.title}
                  </span>
                </div>

                <span className="text-[8px] text-zinc-500 font-mono shrink-0 group-hover:text-zinc-300 transition-colors">
                  {timeAgo(item.date)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between shrink-0">
        <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">
          {items.length} eventos carregados
        </span>
        <button
          onClick={() => void loadMorePage()}
          disabled={!hasMore || isLoadingMore || isLoadingInitial || isBootstrapLoading}
          className="text-[8px] font-black uppercase tracking-wider px-2 py-1 border border-white/[0.1] text-zinc-300 disabled:text-zinc-600 disabled:border-white/[0.04] disabled:cursor-not-allowed"
        >
          {isLoadingMore ? 'Carregando...' : hasMore ? 'Ver mais' : 'Sem mais itens'}
        </button>
      </div>
    </div>
  );
}

export default memo(RecentActivityFeed);
