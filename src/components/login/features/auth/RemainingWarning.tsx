'use client';

interface RemainingWarningProps {
  current: number;
  max: number;
}

export function RemainingWarning({ current, max }: RemainingWarningProps) {
  const remaining = max - current;
  if (current === 0 || remaining > 10) return null;

  return <span className="text-[9px] font-bold text-[var(--text-muted)]">{remaining}</span>;
}
