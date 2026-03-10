'use client';
import { Achievement } from '../../types';
import { CATEGORY_LABELS } from '../../lib/achievements';

const CATEGORIES = ['all', 'tree', 'journal', 'library', 'progress'] as const;
export type FilterCategory = (typeof CATEGORIES)[number];

interface AchievementFiltersProps {
  active: FilterCategory;
  onChange: (cat: FilterCategory) => void;
  resultCount: number;
}

export function AchievementFilters({ active, onChange, resultCount }: AchievementFiltersProps) {
  return (
    <section className="library-panel p-4 md:p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => onChange(category)}
              className={`h-10 shrink-0 px-4 text-[9px] font-black uppercase tracking-wider border rounded-xl transition-all duration-200 cursor-pointer ${
                active === category
                  ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-muted)]'
              }`}
            >
              {category === 'all' ? 'Todas' : CATEGORY_LABELS[category as Achievement['category']]}
            </button>
          ))}
        </div>

        <div className="md:ml-auto flex items-center gap-2">
          <span className="library-chip">
            {resultCount} resultado{resultCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </section>
  );
}
