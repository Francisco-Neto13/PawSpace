'use client';
import { useEffect, useState } from 'react';
import { Monitor, Smartphone, LogOut } from 'lucide-react';
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

export default function SessionsSection() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSessions = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) {
        if (mounted) setSessions([]);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('sessions')
        .select('id, device, location, last_seen, is_current, type')
        .eq('user_id', user.id)
        .order('is_current', { ascending: false })
        .order('last_seen', { ascending: false });

      if (mounted && !error && data && data.length > 0) {
        const mapped = (data as SessionRow[]).map((row) => ({
          id: row.id,
          device: row.device ?? 'Dispositivo',
          location: row.location ?? 'Local desconhecido',
          lastSeen: formatLastSeen(row.last_seen),
          isCurrent: Boolean(row.is_current),
          type: row.type === 'mobile' ? 'mobile' : 'desktop',
        }));
        setSessions(mapped);
        return;
      }

      if (!mounted) return;

      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const platform = typeof navigator !== 'undefined' ? navigator.platform : 'Dispositivo';
      const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

      setSessions([
        {
          id: 'current',
          device: `${platform} - ${detectBrowser(ua)}`,
          location: 'Sessao atual',
          lastSeen: 'Agora',
          isCurrent: true,
          type: isMobile ? 'mobile' : 'desktop',
        },
      ]);
    };

    void loadSessions();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRevoke = async (id: string) => {
    if (!userId) return;
    setRevoking(id);

    const supabase = createClient();
    const { error } = await supabase.from('sessions').delete().eq('id', id).eq('user_id', userId);

    if (!error) {
      setSessions((prev) => prev.filter((session) => session.id !== id));
    }
    setRevoking(null);
  };

  const handleRevokeAll = async () => {
    if (!userId) return;
    setRevoking('__all__');

    const supabase = createClient();
    const { error } = await supabase.from('sessions').delete().eq('user_id', userId).neq('is_current', true);

    if (!error) {
      setSessions((prev) => prev.filter((session) => session.isCurrent));
    }
    setRevoking(null);
  };

  const others = sessions.filter((session) => !session.isCurrent);

  return (
    <section className="library-panel p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="library-kicker flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
          Sessoes Ativas
        </p>
        {others.length > 0 && (
          <button
            onClick={() => void handleRevokeAll()}
            className="text-[8px] font-black uppercase tracking-wider text-[var(--text-muted)] hover:text-red-400/80 transition-colors"
          >
            Encerrar todas
          </button>
        )}
      </div>
      <p className="library-subtitle mb-5 ml-3">dispositivos com acesso a sua conta</p>

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

        {others.length === 0 && sessions.length === 1 && (
          <p className="text-[9px] text-[var(--text-faint)] uppercase tracking-wider font-bold ml-1">
            Nenhuma outra sessao ativa.
          </p>
        )}
      </div>
    </section>
  );
}
