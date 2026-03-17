'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCcw } from 'lucide-react';

import { PawIcon } from '@/components/shared/PawIcon';
import { createClient } from '@/shared/supabase/client';

import { SessionFeedback } from './SessionFeedback';
import { SessionListItem } from './SessionListItem';
import {
  createCurrentSessionFallback,
  type FeedbackTone,
  type SessionItem,
} from './sessionUtils';

const LIMITED_VISIBILITY_MESSAGE =
  'Esta tela consegue mostrar apenas a sessão atual neste ambiente. Se houver outros acessos abertos, você pode encerrá-los de uma vez pelo botão acima.';

type UserSessionsResponse =
  | { status: 'ok'; sessions: SessionItem[] }
  | { status: 'limited'; sessions: [] }
  | { status: 'unauthorized'; sessions: [] }
  | { status: 'error'; sessions: [] };

function ensureSessionList(items: SessionItem[]) {
  if (items.length === 0) {
    return [createCurrentSessionFallback()];
  }

  if (items.length === 1 && !items[0].isCurrent) {
    return [
      {
        ...items[0],
        isCurrent: true,
        location: 'Sessão atual',
      },
    ];
  }

  return items;
}

export default function SessionsSection() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [revoking, setRevoking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLimitedSessionVisibility, setHasLimitedSessionVisibility] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: FeedbackTone; message: string } | null>(null);

  const loadSessions = useCallback(async (source: 'initial' | 'manual' = 'initial') => {
    if (source === 'manual') {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setFeedback(null);

    try {
      const response = await fetch('/api/sessions', {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      });
      const result = (await response.json()) as UserSessionsResponse;

      if (!response.ok && result.status !== 'unauthorized') {
        throw new Error('sessions_request_failed');
      }

      if (result.status === 'ok') {
        setHasLimitedSessionVisibility(false);
        setSessions(ensureSessionList(result.sessions));
        return;
      }

      if (result.status === 'limited') {
        setHasLimitedSessionVisibility(true);
        setSessions([createCurrentSessionFallback()]);
        return;
      }

      if (result.status === 'unauthorized') {
        setHasLimitedSessionVisibility(true);
        setSessions([createCurrentSessionFallback()]);
        setFeedback({
          tone: 'error',
          message: 'Sessão não encontrada.',
        });
        return;
      }

      throw new Error('unexpected_sessions_state');
    } catch (error) {
      console.error('[Sessions] Falha ao carregar sessões:', error);
      setHasLimitedSessionVisibility(true);
      setSessions((prev) => (prev.length > 0 ? prev : [createCurrentSessionFallback()]));
      setFeedback({
        tone: 'error',
        message: 'Não foi possível atualizar as sessões agora.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions('initial');
  }, [loadSessions]);

  const handleRevokeOthers = async () => {
    if (revoking) return;

    setRevoking(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: 'others' });

      if (error) {
        setFeedback({ tone: 'error', message: 'Falha ao encerrar as outras sessões.' });
        return;
      }

      setFeedback({ tone: 'ok', message: 'Todas as outras sessões foram encerradas.' });
      void loadSessions('manual');
    } catch (error) {
      console.error('[Sessions] Falha ao encerrar outras sessões:', error);
      setFeedback({ tone: 'error', message: 'Falha ao encerrar as outras sessões.' });
    } finally {
      setRevoking(false);
    }
  };

  const currentSessionCount = useMemo(
    () => sessions.filter((session) => session.isCurrent).length,
    [sessions]
  );
  const totalSessionCount = sessions.length;
  const otherSessionCount = Math.max(0, totalSessionCount - currentSessionCount);
  const canRevokeOthers =
    hasLimitedSessionVisibility || totalSessionCount - currentSessionCount > 0 || totalSessionCount > 1;

  return (
    <section className="library-panel p-6 relative overflow-hidden reveal-up delay-300">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="library-kicker flex items-center gap-2">
            <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
            Sessões ativas
          </p>
          <p className="library-subtitle mt-2 ml-3">dispositivos com acesso à sua conta</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadSessions('manual')}
            disabled={isLoading || isRefreshing || revoking}
            className="h-8 px-2.5 rounded-lg border border-[var(--border-subtle)] flex items-center gap-1 button-label text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCcw size={9} className={isRefreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>

          {canRevokeOthers && (
            <button
              onClick={() => void handleRevokeOthers()}
              disabled={revoking || isLoading}
              className="button-label text-[var(--text-muted)] hover:text-red-400/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {revoking ? 'Encerrando...' : 'Encerrar outras sessões'}
            </button>
          )}
        </div>
      </div>

      {feedback && <SessionFeedback tone={feedback.tone} message={feedback.message} />}

      {hasLimitedSessionVisibility && !isLoading && (
        <div className="mb-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
          <p className="feedback-text text-[var(--text-muted)]">{LIMITED_VISIBILITY_MESSAGE}</p>
        </div>
      )}

      {isLoading ? (
        <div className="h-28 flex items-center justify-center">
          <div className="w-4 h-4 border border-[var(--border-visible)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionListItem key={session.id} session={session} />
          ))}

          {!hasLimitedSessionVisibility && totalSessionCount > 0 && (
            <div className="ml-1 flex flex-wrap items-center gap-2 pt-1">
              <p className="ui-meta uppercase">
                {totalSessionCount === 1 ? '1 acesso identificado.' : `${totalSessionCount} acessos identificados.`}
              </p>
              <span className="data-label px-1.5 py-0.5 border border-[var(--border-subtle)] text-[var(--text-muted)]">
                {currentSessionCount === 1 ? '1 sessao atual' : `${currentSessionCount} sessoes atuais`}
              </span>
              {otherSessionCount > 0 && (
                <span className="data-label px-1.5 py-0.5 border border-[var(--border-subtle)] text-[var(--text-muted)]">
                  {otherSessionCount === 1 ? '1 outro acesso' : `${otherSessionCount} outros acessos`}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
