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
        <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Buscar conteúdo..."
          className="w-full bg-white/[0.02] border border-white/[0.06] pl-11 pr-4 py-3.5 text-white text-sm font-medium outline-none focus:border-[#c8b89a]/30 transition-colors placeholder:text-zinc-700 cursor-text"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Filter size={12} className="text-zinc-700 mr-1" />
        {FILTER_OPTIONS.map(f => (
          <button
            key={f.value}
            onClick={() => onTypeChange(f.value)}
            className={`px-4 py-3.5 text-[9px] font-black uppercase tracking-widest border transition-all duration-200 cursor-pointer
              ${typeFilter === f.value
                ? 'border-[#c8b89a]/40 bg-[#c8b89a]/[0.08] text-[#c8b89a]'
                : 'border-white/[0.04] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.08]'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
