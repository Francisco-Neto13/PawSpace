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
          className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all duration-200 cursor-pointer ${
            active === cat
              ? 'border-[#c8b89a]/40 bg-[#c8b89a]/[0.06] text-[#c8b89a]'
              : 'border-white/[0.04] text-zinc-600 hover:text-zinc-300 hover:border-white/10'
          }`}
        >
          {cat === 'all' ? 'Todas' : CATEGORY_LABELS[cat as Achievement['category']]}
        </button>
      ))}
      <span className="ml-auto text-[8px] text-zinc-700 font-black uppercase tracking-widest">
        {resultCount} resultado{resultCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}