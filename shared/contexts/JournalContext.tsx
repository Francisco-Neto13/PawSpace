'use client';
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getJournalEntries, saveJournalEntry } from '@/app/actions/journal';
import { JournalEntry } from '@/components/journal/types';

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

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const pendingRef = useRef<PendingSync | null>(null);
  const isSyncingRef = useRef(false);

  const refreshJournal = useCallback(async (force = false) => {
    if (hasLoadedRef.current && !force) {
      console.log('? [Journal] Entradas já em memória, ignorando fetch.');
      return;
    }
    console.log(`?? [Journal] Fetch ${force ? 'FORÇADO' : 'INICIAL'}...`);
    setIsLoading(true);
    try {
      const data = await getJournalEntries();
      setEntries(data as unknown as JournalEntry[]);
      hasLoadedRef.current = true;
    } catch (error) {
      console.error('? [Journal] Erro ao buscar entradas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        setEntries(prev => prev.map(e =>
          e.id === snapshot.id
            ? { ...e, title: snapshot.title, body: snapshot.body, skillId: snapshot.skillId }
            : e
        ));
        console.log('? [Journal] Flush concluído.');
      }
    } catch (e) {
      console.error('? [Journal] Erro no flush:', e);
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushPending();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [flushPending]);

  useEffect(() => {
    refreshJournal();
  }, [refreshJournal]);

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
