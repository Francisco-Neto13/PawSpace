'use client';
import { useState } from 'react';
import { Monitor, Smartphone, LogOut } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

const MOCK_SESSIONS = [
  {
    id: '1',
    device: 'Windows · Chrome',
    location: 'Maceió, BR',
    lastSeen: 'Agora',
    isCurrent: true,
    type: 'desktop' as const,
  },
  {
    id: '2',
    device: 'iPhone · Safari',
    location: 'Maceió, BR',
    lastSeen: 'Há 2 horas',
    isCurrent: false,
    type: 'mobile' as const,
  },
  {
    id: '3',
    device: 'macOS · Firefox',
    location: 'São Paulo, BR',
    lastSeen: 'Há 3 dias',
    isCurrent: false,
    type: 'desktop' as const,
  },
];

export default function SessionsSection() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [revoking, setRevoking] = useState<string | null>(null);

  const handleRevoke = (id: string) => {
    setRevoking(id);
    setTimeout(() => {
      setSessions(prev => prev.filter(s => s.id !== id));
      setRevoking(null);
    }, 800);
  };

  const handleRevokeAll = () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
  };

  const others = sessions.filter(s => !s.isCurrent);

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex items-start justify-between mb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
          Sessões Ativas
        </p>
        {others.length > 0 && (
          <button
            onClick={handleRevokeAll}
            className="text-[8px] font-black uppercase tracking-wider text-[var(--text-muted)] hover:text-red-400/70 transition-colors"
          >
            Encerrar todas
          </button>
        )}
      </div>
      <p className="text-[9px] text-[var(--text-muted)] mb-6 ml-3">dispositivos com acesso à sua conta</p>

      <div className="space-y-2">
        {sessions.map(session => {
          const isRevoking = revoking === session.id;
          const Icon = session.type === 'mobile' ? Smartphone : Monitor;
          return (
            <div
              key={session.id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200"
              style={{
                borderColor: session.isCurrent ? 'var(--border-visible)' : 'var(--border-subtle)',
                backgroundColor: session.isCurrent ? 'var(--bg-elevated)' : 'transparent',
                opacity: isRevoking ? 0.4 : 1,
              }}
            >
              <Icon size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    {session.device}
                  </p>
                  {session.isCurrent && (
                    <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-[var(--border-visible)] text-[var(--text-secondary)]">
                      Esta sessão
                    </span>
                  )}
                </div>
                <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider font-bold mt-0.5">
                  {session.location} · {session.lastSeen}
                </p>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => handleRevoke(session.id)}
                  disabled={!!revoking}
                  className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider transition-colors"
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
            Nenhuma outra sessão ativa.
          </p>
        )}
      </div>
    </div>
  );
}