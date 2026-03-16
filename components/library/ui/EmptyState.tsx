'use client';

interface EmptyStateProps {
  onAdd?: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  void onAdd;

  return (
    <div className="min-h-[280px] animate-in fade-in duration-500" />
  );
}
