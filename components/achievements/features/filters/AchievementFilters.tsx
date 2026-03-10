'use client';
import { Achievement } from '../../types';
import { CATEGORY_LABELS } from '../../lib/achievements';

const CATEGORIES = ['all', 'tree', 'journal', 'library', 'progress'] as const;
export type FilterCategory = typeof CATEGORIES[number];

interface AchievementFiltersProps {
  active: FilterCategory;
  onChange: (cat: FilterCategory) => void;
  resultCount: number;
}

export function AchievementFilters({ active, onChange, resultCount }: AchievementFiltersProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className="px-4 py-2 text-[9px] font-black uppercase tracking-wider border transition-all duration-200 cursor-pointer"
            style={{
              borderColor: active === cat ? 'var(--border-visible)' : 'var(--border-subtle)',
              backgroundColor: active === cat ? 'var(--bg-elevated)' : 'transparent',
              color: active === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            {cat === 'all' ? 'Todas' : CATEGORY_LABELS[cat as Achievement['category']]}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <div className="h-3 w-px bg-[var(--border-subtle)]" />
          <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wide tabular-nums">
            {resultCount} resultado{resultCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}