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
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Buscar conteúdo..."
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] pl-11 pr-4 py-3.5 text-[var(--text-primary)] text-sm font-medium outline-none focus:border-[var(--border-visible)] transition-colors placeholder:text-[var(--text-muted)] cursor-text"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Filter size={12} className="text-[var(--text-muted)] mr-1" />
        {FILTER_OPTIONS.map(f => (
          <button
            key={f.value}
            onClick={() => onTypeChange(f.value)}
            className={`px-4 py-3.5 text-[9px] font-black uppercase tracking-widest border transition-all duration-200 cursor-pointer
              ${typeFilter === f.value
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

