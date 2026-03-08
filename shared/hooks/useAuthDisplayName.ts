'use client';

import { useEffect, useState } from 'react';
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

export function useAuthDisplayName(): UseAuthDisplayNameResult {
  const [displayName, setDisplayName] = useState('Usuario');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const syncUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;
        setDisplayName(resolveDisplayName(user));
      } catch {
        if (!mounted) return;
        setDisplayName('Usuario');
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    void syncUser();

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setDisplayName(resolveDisplayName(session?.user ?? null));
      setIsLoading(false);
    });

    const handleDisplayNameUpdate = (event: Event) => {
      const custom = event as CustomEvent<{ displayName?: string }>;
      const next = custom.detail?.displayName;
      if (typeof next === 'string' && next.trim().length > 0) {
        setDisplayName(next.trim());
        setIsLoading(false);
      }
    };
    window.addEventListener('auth-display-name-updated', handleDisplayNameUpdate);

    return () => {
      mounted = false;
      window.removeEventListener('auth-display-name-updated', handleDisplayNameUpdate);
      authSubscription.subscription.unsubscribe();
    };
  }, []);

  return { displayName, isLoading };
}
