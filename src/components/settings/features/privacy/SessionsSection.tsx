'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCcw } from 'lucide-react';

import { PawIcon } from '@/components/shared/PawIcon';
import { createClient } from '@/shared/supabase/client';

import { SessionFeedback } from './SessionFeedback';
import { SessionListItem } from './SessionListItem';
import {
  createCurrentSessionFallback,
  isSessionsTableUnavailable,
  normalizeSessions,
  type FeedbackTone,
  type SessionItem,
  type SessionRow,
  type SupabaseErrorLike,
} from './sessionUtils';

export default function SessionsSection() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSessionTableSupported, setIsSessionTableSupported] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<{ tone: FeedbackTone; message: string } | null>(null);

  const loadSessions = useCallback(async (source: 'initial' | 'manual' = 'initial') => {
    if (source === 'manual') {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setFeedback(null);

    const supabase = createClient();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setUserId(null);
        setSessions([createCurrentSessionFallback()]);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('sessions')
        .select('id, device, location, last_seen, is_current, type')
        .eq('user_id', user.id)
        .order('is_current', { ascending: false })
        .order('last_seen', { ascending: false });

      if (error) {
        const sessionError = error as SupabaseErrorLike;
        if (isSessionsTableUnavailable(sessionError)) {
          setIsSessionTableSupported(false);
          setSessions([createCurrentSessionFallback()]);
          setFeedback({
            tone: 'info',
            message: 'Modo básico ativo: lista completa de sessões indisponível neste banco.',
          });
          return;
        }
        throw error;
      }

      setIsSessionTableSupported(true);
      setSessions(normalizeSessions((data ?? []) as SessionRow[]));
    } catch (error) {
      console.error('[Sessions] Falha ao carregar sessões:', error);
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

  const handleRevoke = async (id: string) => {
    if (!userId || id === 'current') return;
    if (isSessionTableSupported === false) {
      setFeedback({
        tone: 'info',
        message: 'Revogação individual indisponível sem tabela de sessões.',
      });
      return;
    }

    setRevoking(id);
    setFeedback(null);

    const supabase = createClient();
    const { error } = await supabase.from('sessions').delete().eq('id', id).eq('user_id', userId);

    if (!error) {
      setSessions((prev) => prev.filter((session) => session.id !== id));
      setFeedback({ tone: 'ok', message: 'Sessão encerrada com sucesso.' });
    } else if (isSessionsTableUnavailable(error as SupabaseErrorLike)) {
      setIsSessionTableSupported(false);
      setSessions([createCurrentSessionFallback()]);
      setFeedback({
        tone: 'info',
        message: 'Modo básico ativo: revogação individual indisponível.',
      });
    } else {
      setFeedback({ tone: 'error', message: 'Falha ao encerrar a sessão selecionada.' });
    }

    setRevoking(null);
  };

  const handleRevokeAll = async () => {
    if (!userId) return;
    setRevoking('__all__');
    setFeedback(null);

    const supabase = createClient();
    if (isSessionTableSupported === false) {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (!error) {
        setFeedback({ tone: 'ok', message: 'Todas as outras sessões foram encerradas.' });
        void loadSessions('manual');
      } else {
        setFeedback({ tone: 'error', message: 'Falha ao encerrar as outras sessões.' });
      }
      setRevoking(null);
      return;
    }

    const { error } = await supabase.from('sessions').delete().eq('user_id', userId).neq('is_current', true);

    if (!error) {
      setSessions((prev) => prev.filter((session) => session.isCurrent));
      setFeedback({ tone: 'ok', message: 'Todas as outras sessões foram encerradas.' });
    } else if (isSessionsTableUnavailable(error as SupabaseErrorLike)) {
      setIsSessionTableSupported(false);
      const revokeResult = await supabase.auth.signOut({ scope: 'others' });
      if (!revokeResult.error) {
        setSessions([createCurrentSessionFallback()]);
        setFeedback({
          tone: 'ok',
          message: 'Outras sessões encerradas (modo básico).',
        });
      } else {
        setFeedback({ tone: 'error', message: 'Falha ao encerrar as outras sessões.' });
      }
    } else {
      setFeedback({ tone: 'error', message: 'Falha ao encerrar as outras sessões.' });
    }

    setRevoking(null);
  };

  const others = useMemo(() => sessions.filter((session) => !session.isCurrent), [sessions]);

  return (
    <section className="library-panel p-6 relative overflow-hidden reveal-up delay-300">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <p className="library-kicker flex items-center gap-2">
            <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
            Sessões ativas
          </p>
          <p className="library-subtitle mt-2 ml-3">dispositivos com acesso à sua conta</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadSessions('manual')}
            disabled={isLoading || isRefreshing || !!revoking}
            className="h-8 px-2.5 rounded-lg border border-[var(--border-subtle)] flex items-center gap-1 button-label text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCcw size={9} className={isRefreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>

          {others.length > 0 && (
            <button
              onClick={() => void handleRevokeAll()}
              disabled={!!revoking}
              className="button-label text-[var(--text-muted)] hover:text-red-400/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Encerrar todas
            </button>
          )}
        </div>
      </div>

      {feedback && <SessionFeedback tone={feedback.tone} message={feedback.message} />}

      {isLoading ? (
        <div className="h-28 flex items-center justify-center">
          <div className="w-4 h-4 border border-[var(--border-visible)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={session}
              isRevoking={revoking === session.id}
              hasRevokingAction={!!revoking}
              onRevoke={(id) => {
                void handleRevoke(id);
              }}
            />
          ))}

          {others.length === 0 && sessions.length > 0 && (
            <p className="ui-meta uppercase ml-1">Nenhuma outra sessão ativa.</p>
          )}
        </div>
      )}
    </section>
  );
}
