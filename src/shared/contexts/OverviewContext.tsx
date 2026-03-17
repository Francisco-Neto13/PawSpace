'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getOverviewBootstrap, type OverviewBootstrapResult } from '@/app/actions/overview';

interface RefreshOverviewOptions {
  force?: boolean;
}

interface InvalidateOverviewOptions {
  refetch?: boolean;
}

interface OverviewContextType {
  bootstrap: OverviewBootstrapResult | null;
  isLoading: boolean;
  hasLoaded: boolean;
  lastUpdatedAt: number | null;
  refreshOverview: (options?: RefreshOverviewOptions) => Promise<OverviewBootstrapResult | null>;
  invalidateOverview: (options?: InvalidateOverviewOptions) => void;
}

const OverviewContext = createContext<OverviewContextType | undefined>(undefined);

function isPublicRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith('/login');
}

export function OverviewProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const skipFetch = isPublicRoute(pathname);

  const [bootstrap, setBootstrap] = useState<OverviewBootstrapResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const bootstrapRef = useRef<OverviewBootstrapResult | null>(null);
  const hasLoadedRef = useRef(false);
  const staleRef = useRef(false);
  const skipFetchRef = useRef(skipFetch);
  const inFlightRef = useRef<Promise<OverviewBootstrapResult | null> | null>(null);

  useEffect(() => {
    skipFetchRef.current = skipFetch;
  }, [skipFetch]);

  const refreshOverview = useCallback(async (options: RefreshOverviewOptions = {}) => {
    const force = options.force ?? false;

    if (skipFetch) {
      return bootstrapRef.current;
    }

    if (!force && hasLoadedRef.current && !staleRef.current && bootstrapRef.current) {
      return bootstrapRef.current;
    }

    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    setIsLoading(true);

    const request = (async () => {
      try {
        const next = await getOverviewBootstrap();
        if (skipFetchRef.current) return null;
        bootstrapRef.current = next;
        hasLoadedRef.current = true;
        staleRef.current = false;
        setBootstrap(next);
        setLastUpdatedAt(Date.now());
        return next;
      } catch (error) {
        console.error('[Overview] Failed to refresh bootstrap:', error);
        return null;
      } finally {
        inFlightRef.current = null;
        setIsLoading(false);
      }
    })();

    inFlightRef.current = request;
    return request;
  }, [skipFetch]);

  const invalidateOverview = useCallback((options: InvalidateOverviewOptions = {}) => {
    staleRef.current = true;

    if (options.refetch && !skipFetch) {
      void refreshOverview({ force: true });
    }
  }, [refreshOverview, skipFetch]);

  useEffect(() => {
    if (!skipFetch) return;

    bootstrapRef.current = null;
    hasLoadedRef.current = false;
    staleRef.current = false;
    inFlightRef.current = null;
    setBootstrap(null);
    setIsLoading(false);
    setLastUpdatedAt(null);
  }, [skipFetch]);

  return (
    <OverviewContext.Provider
      value={{
        bootstrap,
        isLoading,
        hasLoaded: hasLoadedRef.current,
        lastUpdatedAt,
        refreshOverview,
        invalidateOverview,
      }}
    >
      {children}
    </OverviewContext.Provider>
  );
}

export function useOverview() {
  const context = useContext(OverviewContext);
  if (!context) throw new Error('useOverview must be used within OverviewProvider');
  return context;
}
