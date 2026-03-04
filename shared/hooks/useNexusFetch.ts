'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

interface FetchOptions {
  skip?: boolean;
}

export function useNexusFetch<T>(
  fetchFn: (userId: string) => Promise<T>,
  options: FetchOptions = {} 
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(!options.skip);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    if (options.skip) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const result = await fetchFn(user.id);
      
      if (!controller.signal.aborted) {
        setData(result);
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error(e);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [fetchFn, options.skip]);

  useEffect(() => {
    execute();
    return () => abortControllerRef.current?.abort();
  }, [execute]);

  return { data, isLoading, refetch: execute };
}
