export type SessionItem = {
  id: string;
  device: string;
  location: string;
  lastSeen: string;
  isCurrent: boolean;
  type: 'desktop' | 'mobile';
};

export type FeedbackTone = 'ok' | 'error' | 'info';

export function detectBrowser(ua: string): string {
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Chrome/')) return 'Chrome';
  return 'Navegador';
}

export function detectPlatform(ua: string): string {
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Mac OS X|Macintosh/i.test(ua)) return 'macOS';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Dispositivo';
}

export function detectSessionType(ua: string): SessionItem['type'] {
  return /Android|iPhone|iPad|iPod/i.test(ua) ? 'mobile' : 'desktop';
}

export function describeDeviceFromUserAgent(
  userAgent: string | null | undefined
): Pick<SessionItem, 'device' | 'type'> {
  const ua = userAgent?.trim() ?? '';

  if (!ua) {
    return {
      device: 'Dispositivo conectado',
      type: 'desktop',
    };
  }

  const browser = detectBrowser(ua);
  const platform = detectPlatform(ua);

  return {
    device: `${browser} em ${platform}`,
    type: detectSessionType(ua),
  };
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
  const isMobile = detectSessionType(ua) === 'mobile';

  return {
    id: 'current',
    device: `${platform} - ${detectBrowser(ua)}`,
    location: 'Sessão atual',
    lastSeen: 'Agora',
    isCurrent: true,
    type: isMobile ? 'mobile' : 'desktop',
  };
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
