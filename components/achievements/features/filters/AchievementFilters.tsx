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
    <div className="flex items-center gap-2 flex-wrap">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
            active === cat
              ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
              : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-muted)]'
          }`}
        >
          {cat === 'all' ? 'Todas' : CATEGORY_LABELS[cat as Achievement['category']]}
        </button>
      ))}
      <span className="ml-auto text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wide">
        {resultCount} resultado{resultCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
