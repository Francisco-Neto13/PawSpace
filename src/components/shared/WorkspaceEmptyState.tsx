'use client';

import Link from 'next/link';

interface WorkspaceEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function WorkspaceEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: WorkspaceEmptyStateProps) {
  const actionClassName =
    'pointer-events-auto inline-flex items-center gap-2 px-6 py-3 border border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)] button-label hover:bg-[var(--bg-input)] hover:border-[var(--text-secondary)] transition-all duration-200 active:scale-95 cursor-pointer';

  return (
    <div
      className="relative w-full bg-[var(--bg-base)] overflow-hidden"
      style={{
        minHeight: 'calc(100dvh - var(--navbar-height) - var(--footer-height))',
      }}
    >
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 text-center pointer-events-none">
        <div className="space-y-2">
          <p className="page-display max-w-2xl">
            {title}
          </p>
          <p className="page-summary max-w-md">
            {description}
          </p>
        </div>

        {actionLabel && actionHref ? (
          <Link href={actionHref} className={actionClassName}>
            {actionLabel}
          </Link>
        ) : null}

        {actionLabel && onAction ? (
          <button type="button" onClick={onAction} className={actionClassName}>
            {actionLabel}
          </button>
        ) : null}

        <div className="w-8 h-px bg-gradient-to-r from-transparent via-[var(--border-muted)] to-transparent" />
      </div>
    </div>
  );
}
