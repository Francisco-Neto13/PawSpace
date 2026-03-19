'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';

type AuthTransitionKind = 'enter' | 'exit';

interface AuthTransitionOptions {
  kind?: AuthTransitionKind;
  title?: string;
  syncTitle?: string;
  minVisibleMs?: number;
}

interface AuthTransitionContextValue {
  beginAuthTransition: (options?: AuthTransitionOptions) => Promise<void>;
  cancelAuthTransition: () => void;
  isTransitioning: boolean;
}

type AuthTransitionState = {
  isVisible: boolean;
  isSettling: boolean;
  kind: AuthTransitionKind;
  title: string;
};

const MIN_VISIBLE_MS = 240;
const LEAVE_DURATION_MS = 260;
const SYNC_TITLE = 'Sincronizando PawSpace...';

const COPY_BY_KIND: Record<AuthTransitionKind, { title: string }> = {
  enter: {
    title: 'Entrando no PawSpace...',
  },
  exit: {
    title: 'Saindo do PawSpace...',
  },
};

const IDLE_STATE: AuthTransitionState = {
  isVisible: false,
  isSettling: false,
  kind: 'enter',
  title: COPY_BY_KIND.enter.title,
};

const AuthTransitionContext = createContext<AuthTransitionContextValue | null>(null);

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function AuthTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncTitleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<AuthTransitionState>(IDLE_STATE);

  const clearTimers = useCallback(() => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (syncTitleTimerRef.current) {
      clearTimeout(syncTitleTimerRef.current);
      syncTitleTimerRef.current = null;
    }
  }, []);

  const finishTransition = useCallback(() => {
    clearTimers();

    setState((current) => {
      if (!current.isVisible) return current;
      return {
        ...current,
        isSettling: true,
      };
    });

    hideTimerRef.current = setTimeout(() => {
      setState(IDLE_STATE);
      hideTimerRef.current = null;
    }, LEAVE_DURATION_MS);
  }, [clearTimers]);

  const beginAuthTransition = useCallback(async (options: AuthTransitionOptions = {}) => {
    const kind = options.kind ?? 'enter';
    const nextTitle = options.title ?? COPY_BY_KIND[kind].title;
    const nextSyncTitle = kind === 'enter' ? (options.syncTitle ?? SYNC_TITLE) : null;

    clearTimers();

    setState({
      isVisible: true,
      isSettling: false,
      kind,
      title: nextTitle,
    });

    if (nextSyncTitle && nextSyncTitle !== nextTitle) {
      syncTitleTimerRef.current = setTimeout(() => {
        setState((current) => {
          if (!current.isVisible || current.isSettling || current.kind !== kind) {
            return current;
          }

          return {
            ...current,
            title: nextSyncTitle,
          };
        });
        syncTitleTimerRef.current = null;
      }, 320);
    }

    await sleep(options.minVisibleMs ?? MIN_VISIBLE_MS);
  }, [clearTimers]);

  const cancelAuthTransition = useCallback(() => {
    finishTransition();
  }, [finishTransition]);

  useEffect(() => {
    if (!state.isVisible) {
      previousPathRef.current = pathname;
      return;
    }

    if (previousPathRef.current !== pathname) {
      settleTimerRef.current = setTimeout(() => {
        finishTransition();
        settleTimerRef.current = null;
      }, 120);
    }

    previousPathRef.current = pathname;
  }, [finishTransition, pathname, state.isVisible]);

  useEffect(() => {
    if (!state.isVisible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [state.isVisible]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const value = useMemo<AuthTransitionContextValue>(() => ({
    beginAuthTransition,
    cancelAuthTransition,
    isTransitioning: state.isVisible,
  }), [beginAuthTransition, cancelAuthTransition, state.isVisible]);

  return (
    <AuthTransitionContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' && state.isVisible
        ? createPortal(
            <div
              className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--bg-base)] transition-opacity duration-300 ${
                state.isSettling ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`}
              aria-live="polite"
              aria-busy="true"
            >
              <div
                className={`relative flex flex-col items-center gap-4 transition-all duration-300 ${
                  state.isSettling ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
                }`}
              >
                <div className="w-8 h-8 border-2 border-[var(--border-visible)] border-t-[var(--text-primary)] rounded-full animate-spin" />
                <p className="button-label text-[var(--text-primary)] animate-pulse">
                  {state.title}
                </p>
              </div>
            </div>,
            document.body
          )
        : null}
    </AuthTransitionContext.Provider>
  );
}

export function useAuthTransition() {
  const context = useContext(AuthTransitionContext);

  if (!context) {
    throw new Error('useAuthTransition deve ser usado dentro de AuthTransitionProvider');
  }

  return context;
}
