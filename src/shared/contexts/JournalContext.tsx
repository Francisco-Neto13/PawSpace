'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getJournalEntries, saveJournalEntry } from '@/app/actions/journal';
import { JournalEntry } from '@/components/journal/types';

const AUTH_RETRY_LIMIT = 3;
const AUTH_RETRY_BASE_DELAY_MS = 350;

interface PendingSync {
  id: string;
  title: string;
  body: string;
  skillId: string | null;
}

interface JournalContextType {
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  isLoading: boolean;
  refreshJournal: (force?: boolean) => Promise<void>;
  setPending: (pending: PendingSync | null) => void;
  flushPending: () => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

function isPublicRoute(pathname: string | null) {
  if (!pathname) return false;
  return pathname.startsWith('/login');
}

function shouldAutoLoadJournal(pathname: string | null) {
  if (!pathname) return false;
  return pathname.startsWith('/journal') || pathname.startsWith('/overview');
}

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const skipHydration = isPublicRoute(pathname);
  const shouldAutoLoad = shouldAutoLoadJournal(pathname);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const pendingRef = useRef<PendingSync | null>(null);
  const isSyncingRef = useRef(false);
  const authRetryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipHydrationRef = useRef(skipHydration);

  useEffect(() => {
    skipHydrationRef.current = skipHydration;
  }, [skipHydration]);

  const refreshJournal = useCallback(async (force = false) => {
    if (skipHydration) {
      setIsLoading(false);
      return;
    }

    if (hasLoadedRef.current && !force) {
      console.log('[Journal] Entries already in memory, skipping fetch.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await getJournalEntries();
      if (skipHydrationRef.current) return;

      if (result.status === 'ok') {
        setEntries(result.entries as unknown as JournalEntry[]);
        hasLoadedRef.current = true;
        authRetryCountRef.current = 0;
        return;
      }

      if (result.status === 'unauthorized') {
        hasLoadedRef.current = false;

        if (authRetryCountRef.current < AUTH_RETRY_LIMIT) {
          const nextTry = authRetryCountRef.current + 1;
          const delay = AUTH_RETRY_BASE_DELAY_MS * nextTry;
          authRetryCountRef.current = nextTry;

          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }

          retryTimeoutRef.current = setTimeout(() => {
            void refreshJournal(true);
          }, delay);

          console.warn(`[Journal] Session unavailable, retry in ${delay}ms (${nextTry}/${AUTH_RETRY_LIMIT}).`);
        } else {
          console.warn('[Journal] Session unavailable after max retries.');
        }

        return;
      }

      console.error('[Journal] Failed to fetch entries (status=error).');
    } catch (error) {
      console.error('[Journal] Fetch failed with exception:', error);
    } finally {
      setIsLoading(false);
    }
  }, [skipHydration]);

  const setPending = useCallback((pending: PendingSync | null) => {
    pendingRef.current = pending;
  }, []);

  const flushPending = useCallback(async () => {
    if (!pendingRef.current || isSyncingRef.current) return;

    const snapshot = { ...pendingRef.current };
    isSyncingRef.current = true;

    try {
      const result = await saveJournalEntry({
        id: snapshot.id,
        title: snapshot.title,
        body: snapshot.body,
        skillId: snapshot.skillId,
      });

      if (result.success) {
        pendingRef.current = null;
        if (result.entry && snapshot.id.startsWith('temp-')) {
          const realEntry = result.entry as unknown as JournalEntry;
          setEntries(prev => prev.map(e => (e.id === snapshot.id ? realEntry : e)));
        } else {
          setEntries(prev => prev.map(e =>
            e.id === snapshot.id
              ? { ...e, title: snapshot.title, body: snapshot.body, skillId: snapshot.skillId }
              : e
          ));
        }
      }
    } catch (error) {
      console.error('[Journal] Flush failed:', error);
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void flushPending();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [flushPending]);

  useEffect(() => {
    if (skipHydration || !shouldAutoLoad) {
      setIsLoading(false);
      return;
    }

    void refreshJournal();
  }, [refreshJournal, skipHydration, shouldAutoLoad]);

  useEffect(() => {
    if (!skipHydration) return;

    hasLoadedRef.current = false;
    pendingRef.current = null;
    isSyncingRef.current = false;
    authRetryCountRef.current = 0;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setEntries([]);
    setIsLoading(false);
  }, [skipHydration]);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return (
    <JournalContext.Provider value={{ entries, setEntries, isLoading, refreshJournal, setPending, flushPending }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) throw new Error('useJournal deve ser usado dentro de um JournalProvider');
  return context;
}
