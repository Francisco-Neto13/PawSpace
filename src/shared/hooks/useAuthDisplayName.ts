'use client';

import { useEffect, useSyncExternalStore } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createClient } from '@/shared/supabase/client';

function resolveDisplayName(user: {
  email?: string;
  user_metadata?: Record<string, unknown>;
} | null): string {
  if (!user) return 'Usuario';

  const rawDisplay =
    user.user_metadata?.display_name ??
    user.user_metadata?.name;

  if (typeof rawDisplay === 'string' && rawDisplay.trim().length > 0) {
    return rawDisplay.trim();
  }

  if (typeof user.email === 'string' && user.email.length > 0) {
    const usernameFromEmail = user.email.split('@')[0]?.trim();
    if (usernameFromEmail) return usernameFromEmail;
  }

  return 'Usuario';
}

interface UseAuthDisplayNameResult {
  displayName: string;
  isLoading: boolean;
}

type DisplayNameSnapshot = {
  displayName: string;
  isLoading: boolean;
};

const DEFAULT_SNAPSHOT: DisplayNameSnapshot = {
  displayName: 'Usuario',
  isLoading: true,
};

let snapshot: DisplayNameSnapshot = DEFAULT_SNAPSHOT;
let hydratePromise: Promise<void> | null = null;
let hasSubscribedToAuth = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function setSnapshot(next: Partial<DisplayNameSnapshot>) {
  snapshot = {
    ...snapshot,
    ...next,
  };
  emit();
}

function ensureAuthSync() {
  const supabase = createClient();

  if (!hasSubscribedToAuth) {
    hasSubscribedToAuth = true;

    supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSnapshot({
        displayName: resolveDisplayName(session?.user ?? null),
        isLoading: false,
      });
    });

    window.addEventListener('auth-display-name-updated', ((event: Event) => {
      const custom = event as CustomEvent<{ displayName?: string }>;
      const next = custom.detail?.displayName;
      if (typeof next === 'string' && next.trim().length > 0) {
        setSnapshot({
          displayName: next.trim(),
          isLoading: false,
        });
      }
    }) as EventListener);
  }

  if (!hydratePromise && snapshot.isLoading) {
    hydratePromise = (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setSnapshot({
          displayName: resolveDisplayName(user),
          isLoading: false,
        });
      } catch {
        setSnapshot({
          displayName: 'Usuario',
          isLoading: false,
        });
      } finally {
        hydratePromise = null;
      }
    })();
  }

  return hydratePromise;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return DEFAULT_SNAPSHOT;
}

export function useAuthDisplayName(): UseAuthDisplayNameResult {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    void ensureAuthSync();
  }, []);

  return state;
}
