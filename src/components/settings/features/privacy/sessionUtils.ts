export type SessionItem = {
  id: string;
  device: string;
  location: string;
  lastSeen: string;
  isCurrent: boolean;
  type: 'desktop' | 'mobile';
};

export type SessionRow = {
  id: string;
  device: string | null;
  location: string | null;
  last_seen: string | null;
  is_current: boolean | null;
  type: 'desktop' | 'mobile' | null;
};

export type FeedbackTone = 'ok' | 'error' | 'info';

export interface SupabaseErrorLike {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}

export function detectBrowser(ua: string): string {
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Chrome/')) return 'Chrome';
  return 'Navegador';
}

export function formatLastSeen(value: string | null): string {
  if (!value) return 'Agora';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function createCurrentSessionFallback(): SessionItem {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const platform = typeof navigator !== 'undefined' ? navigator.platform : 'Dispositivo';
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

  return {
    id: 'current',
    device: `${platform} - ${detectBrowser(ua)}`,
    location: 'Sessão atual',
    lastSeen: 'Agora',
    isCurrent: true,
    type: isMobile ? 'mobile' : 'desktop',
  };
}

export function normalizeSessions(rows: SessionRow[]): SessionItem[] {
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

export function isSessionsTableUnavailable(error: SupabaseErrorLike): boolean {
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

export function getFeedbackStyles(tone: FeedbackTone) {
  return {
    borderColor:
      tone === 'ok'
        ? 'var(--border-visible)'
        : tone === 'info'
          ? 'var(--border-muted)'
          : 'rgba(239,68,68,0.4)',
    color:
      tone === 'ok'
        ? 'var(--text-secondary)'
        : tone === 'info'
          ? 'var(--text-muted)'
          : 'rgba(239,68,68,0.85)',
    background:
      tone === 'ok'
        ? 'var(--bg-elevated)'
        : tone === 'info'
          ? 'var(--bg-surface)'
          : 'rgba(239,68,68,0.08)',
  };
}
