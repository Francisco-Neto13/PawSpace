'use client';
import { Search, Filter, X } from 'lucide-react';
import { ContentType } from '../../types';
import { FILTER_OPTIONS } from '../../constants';

interface LibraryFiltersProps {
  search: string;
  typeFilter: ContentType | 'all';
  onSearchChange: (v: string) => void;
  onTypeChange: (v: ContentType | 'all') => void;
}

export function LibraryFilters({
  search,
  typeFilter,
  onSearchChange,
  onTypeChange,
}: LibraryFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="relative flex-1 min-w-0">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar material..."
          className="library-input h-11 pl-10 pr-10 text-sm font-medium placeholder:text-[var(--text-muted)]"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter size={12} className="text-[var(--text-muted)] shrink-0" />
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f.value}
            onClick={() => onTypeChange(f.value)}
            className={`h-10 shrink-0 px-4 button-label border rounded-xl transition-all duration-200 cursor-pointer ${
              typeFilter === f.value
                ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-muted)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
