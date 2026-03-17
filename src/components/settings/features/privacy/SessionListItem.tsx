'use client';

import { Monitor, Smartphone } from 'lucide-react';

import { formatLastSeen, type SessionItem } from './sessionUtils';

interface SessionListItemProps {
  session: SessionItem;
}

export function SessionListItem({ session }: SessionListItemProps) {
  const Icon = session.type === 'mobile' ? Smartphone : Monitor;

  return (
    <div
      className="flex flex-col gap-2 rounded-xl border px-4 py-3 transition-all duration-200 sm:flex-row sm:items-center sm:gap-3"
      style={{
        borderColor: session.isCurrent ? 'var(--border-visible)' : 'var(--border-subtle)',
        backgroundColor: session.isCurrent ? 'var(--bg-elevated)' : 'transparent',
      }} 
    >
      <Icon size={14} className="text-[var(--text-muted)] shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="sidebar-title truncate">{session.device}</p>
          {session.isCurrent && (
            <span className="data-label px-1.5 py-0.5 border rounded border-[var(--border-visible)] text-[var(--text-secondary)]">
              Esta sessão
            </span>
          )}
        </div>
        <p className="ui-meta uppercase mt-0.5 truncate">
          {session.location} - {formatLastSeen(session.lastSeen)}
        </p>
      </div>
    </div>
  );
}
