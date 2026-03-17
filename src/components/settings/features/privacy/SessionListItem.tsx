'use client';

import { LogOut, Monitor, Smartphone } from 'lucide-react';

import type { SessionItem } from './sessionUtils';

interface SessionListItemProps {
  session: SessionItem;
  isRevoking: boolean;
  hasRevokingAction: boolean;
  onRevoke: (id: string) => void;
}

export function SessionListItem({
  session,
  isRevoking,
  hasRevokingAction,
  onRevoke,
}: SessionListItemProps) {
  const Icon = session.type === 'mobile' ? Smartphone : Monitor;

  return (
    <div
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
          <p className="sidebar-title truncate">{session.device}</p>
          {session.isCurrent && (
            <span className="data-label px-1.5 py-0.5 border rounded border-[var(--border-visible)] text-[var(--text-secondary)]">
              Esta sessão
            </span>
          )}
        </div>
        <p className="ui-meta uppercase mt-0.5 truncate">
          {session.location} - {session.lastSeen}
        </p>
      </div>

      {!session.isCurrent && (
        <button
          onClick={() => onRevoke(session.id)}
          disabled={hasRevokingAction}
          className="h-8 px-2.5 rounded-lg border border-[var(--border-subtle)] flex items-center gap-1 button-label transition-colors"
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
}
