'use client';
import { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { EntryItem } from '../../ui/EntryItem';
import { JournalEntry, SkillBase } from '../../types';

interface JournalSidebarProps {
  entries: JournalEntry[];
  skills: SkillBase[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function JournalSidebar({ entries, skills, selectedId, onSelect }: JournalSidebarProps) {
  const [search, setSearch] = useState('');

  const filtered = entries.filter((entry) =>
    entry.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside
      className="library-panel relative flex max-h-[26rem] flex-col gap-3 self-start overflow-hidden p-4 xl:sticky xl:top-[calc(var(--navbar-height)+24px)] xl:h-[calc(100dvh-var(--navbar-height)-140px)] xl:max-h-none"
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <div className="flex items-center justify-between gap-2">
        <p className="library-kicker">Caderno de Pegadas</p>
        <span className="library-chip">{entries.length}</span>
      </div>

      <div className="relative">
        <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar nota..."
          className="library-input h-10 pl-8 pr-3 text-sm font-medium text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]"
        />
      </div>

      <div className="flex flex-col gap-1.5 flex-1 min-h-0 overview-scroll-area pr-1">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[var(--border-subtle)] rounded-xl">
            <BookOpen size={16} className="text-[var(--text-muted)] mb-3" />
            <p className="ui-label text-center px-4">
              Aguardando nova nota
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="ui-meta font-mono text-center py-8">Nenhuma nota encontrada</p>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((entry) => (
              <EntryItem
                key={entry.id}
                entry={entry}
                skills={skills}
                isSelected={entry.id === selectedId}
                onSelect={() => onSelect(entry.id)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
