'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Monitor, Smartphone, LogOut, RefreshCcw } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import { createClient } from '@/shared/supabase/client';

type SessionItem = {
  id: string;
  device: string;
  location: string;
  lastSeen: string;
  isCurrent: boolean;
  type: 'desktop' | 'mobile';
};

type SessionRow = {
  id: string;
  device: string | null;
  location: string | null;
  last_seen: string | null;
  is_current: boolean | null;
  type: 'desktop' | 'mobile' | null;
};

type FeedbackTone = 'ok' | 'error' | 'info';

interface SupabaseErrorLike {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}

function detectBrowser(ua: string): string {
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Chrome/')) return 'Chrome';
  return 'Navegador';
}

function formatLastSeen(value: string | null): string {
  if (!value) return 'Agora';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function createCurrentSessionFallback(): SessionItem {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const platform = typeof navigator !== 'undefined' ? navigator.platform : 'Dispositivo';
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

  return {
    id: 'current',
    device: `${platform} - ${detectBrowser(ua)}`,
    location: 'Sessao atual',
    lastSeen: 'Agora',
    isCurrent: true,
    type: isMobile ? 'mobile' : 'desktop',
  };
}

function normalizeSessions(rows: SessionRow[]): SessionItem[] {
  if (!rows.length) return [createCurrentSessionFallback()];

  const mapped: SessionItem[] = rows.map((row) => ({
    id: row.id,
    device: row.device ?? 'Dispositivo',
    location: row.location ?? 'Local desconhecido',
    lastSeen: formatLastSeen(row.last_seen),
    isCurrent: Boolean(row.is_current),
    type: row.type === 'mobile' ? 'mobile' : 'desktop',
  }));

  if (mapped.some((session) => session.isCurrent)) {
    return mapped;
  }

  return mapped.map((session, index) => (index === 0 ? { ...session, isCurrent: true } : session));
}

function isSessionsTableUnavailable(error: SupabaseErrorLike): boolean {
  const code = (error.code ?? '').toUpperCase();
  if (code === '42P01' || code === '42501') return true;

  const text = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`.toLowerCase();
  return (
    text.includes('relation "sessions" does not exist') ||
    text.includes("relation 'sessions' does not exist") ||
    text.includes('permission denied') ||
    text.includes('schema cache')
  );
}

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
            message: 'Modo basico ativo: lista completa de sessoes indisponivel neste banco.',
          });
          return;
        }
        throw error;
      }

      setIsSessionTableSupported(true);
      const normalized = normalizeSessions((data ?? []) as SessionRow[]);
      setSessions(normalized);
    } catch (error) {
      console.error('[Sessions] Falha ao carregar sessoes:', error);
      setSessions((prev) => (prev.length > 0 ? prev : [createCurrentSessionFallback()]));
      setFeedback({
        tone: 'error',
        message: 'Nao foi possivel atualizar as sessoes agora.',
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
        message: 'Revogacao individual indisponivel sem tabela de sessoes.',
      });
      return;
    }

    setRevoking(id);
    setFeedback(null);

    const supabase = createClient();
    const { error } = await supabase.from('sessions').delete().eq('id', id).eq('user_id', userId);

    if (!error) {
      setSessions((prev) => prev.filter((session) => session.id !== id));
      setFeedback({ tone: 'ok', message: 'Sessao encerrada com sucesso.' });
    } else if (isSessionsTableUnavailable(error as SupabaseErrorLike)) {
      setIsSessionTableSupported(false);
      setSessions([createCurrentSessionFallback()]);
      setFeedback({
        tone: 'info',
        message: 'Modo basico ativo: revogacao individual indisponivel.',
      });
    } else {
      setFeedback({ tone: 'error', message: 'Falha ao encerrar a sessao selecionada.' });
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
        setFeedback({ tone: 'ok', message: 'Todas as outras sessoes foram encerradas.' });
        void loadSessions('manual');
      } else {
        setFeedback({ tone: 'error', message: 'Falha ao encerrar as outras sessoes.' });
      }
      setRevoking(null);
      return;
    }

    const { error } = await supabase.from('sessions').delete().eq('user_id', userId).neq('is_current', true);

    if (!error) {
      setSessions((prev) => prev.filter((session) => session.isCurrent));
      setFeedback({ tone: 'ok', message: 'Todas as outras sessoes foram encerradas.' });
    } else if (isSessionsTableUnavailable(error as SupabaseErrorLike)) {
      setIsSessionTableSupported(false);
      const revokeResult = await supabase.auth.signOut({ scope: 'others' });
      if (!revokeResult.error) {
        setSessions([createCurrentSessionFallback()]);
        setFeedback({
          tone: 'ok',
          message: 'Outras sessoes encerradas (modo basico).',
        });
      } else {
        setFeedback({ tone: 'error', message: 'Falha ao encerrar as outras sessoes.' });
      }
    } else {
      setFeedback({ tone: 'error', message: 'Falha ao encerrar as outras sessoes.' });
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
            Sessoes Ativas
          </p>
          <p className="library-subtitle mt-2 ml-3">dispositivos com acesso a sua conta</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadSessions('manual')}
            disabled={isLoading || isRefreshing || !!revoking}
            className="h-8 px-2.5 rounded-lg border border-[var(--border-subtle)] flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCcw size={9} className={isRefreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>

          {others.length > 0 && (
            <button
              onClick={() => void handleRevokeAll()}
              disabled={!!revoking}
              className="text-[8px] font-black uppercase tracking-wider text-[var(--text-muted)] hover:text-red-400/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Encerrar todas
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className="mb-4 rounded-lg border px-3 py-2 text-[8px] font-black uppercase tracking-wider"
          style={{
            borderColor:
              feedback.tone === 'ok'
                ? 'var(--border-visible)'
                : feedback.tone === 'info'
                  ? 'var(--border-muted)'
                  : 'rgba(239,68,68,0.4)',
            color:
              feedback.tone === 'ok'
                ? 'var(--text-secondary)'
                : feedback.tone === 'info'
                  ? 'var(--text-muted)'
                  : 'rgba(239,68,68,0.85)',
            background:
              feedback.tone === 'ok'
                ? 'var(--bg-elevated)'
                : feedback.tone === 'info'
                  ? 'var(--bg-surface)'
                  : 'rgba(239,68,68,0.08)',
          }}
        >
          {feedback.message}
        </div>
      )}

      {isLoading ? (
        <div className="h-28 flex items-center justify-center">
          <div className="w-4 h-4 border border-[var(--border-visible)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => {
            const isRevoking = revoking === session.id;
            const Icon = session.type === 'mobile' ? Smartphone : Monitor;

            return (
              <div
                key={session.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200"
                style={{
                  borderColor: session.isCurrent ? 'var(--border-visible)' : 'var(--border-subtle)',
                  backgroundColor: session.isCurrent ? 'var(--bg-elevated)' : 'transparent',
                  opacity: isRevoking ? 0.4 : 1,
                }}
              >
                <Icon size={14} className="text-[var(--text-muted)] shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider truncate">{session.device}</p>
                    {session.isCurrent && (
                      <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 border rounded border-[var(--border-visible)] text-[var(--text-secondary)]">
                        Esta sessao
                      </span>
                    )}
                  </div>
                  <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider font-bold mt-0.5 truncate">
                    {session.location} - {session.lastSeen}
                  </p>
                </div>

                {!session.isCurrent && (
                  <button
                    onClick={() => void handleRevoke(session.id)}
                    disabled={!!revoking}
                    className="h-8 px-2.5 rounded-lg border border-[var(--border-subtle)] flex items-center gap-1 text-[8px] font-black uppercase tracking-wider transition-colors"
                    style={{ color: isRevoking ? 'var(--text-faint)' : 'var(--text-muted)' }}
                  >
                    {isRevoking ? (
                      <div className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <LogOut size={9} />
                    )}
                    {isRevoking ? 'Encerrando...' : 'Encerrar'}
                  </button>
                )}
              </div>
            );
          })}

          {others.length === 0 && sessions.length > 0 && (
            <p className="text-[9px] text-[var(--text-faint)] uppercase tracking-wider font-bold ml-1">
              Nenhuma outra sessao ativa.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
