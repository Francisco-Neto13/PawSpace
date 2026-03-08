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

  const filtered = entries.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside
      className="w-80 shrink-0 flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 relative overflow-hidden"
      style={{
        height: 'calc(100dvh - var(--navbar-height) - 120px)',
        position: 'sticky',
        top: 'calc(var(--navbar-height) + 24px)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
      <div className="flex items-center gap-2">
        <div className="w-1 h-3 bg-[var(--text-secondary)]" />
        <p className="text-[9px] text-[var(--text-secondary)] uppercase font-black tracking-[0.3em] antialiased">
          Arquivo de Notas
        </p>
      </div>

      <div className="relative">
        <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar entrada..."
          className="w-full bg-[var(--bg-input)] border border-[var(--border-muted)] pl-8 pr-3 py-2.5 text-[10px] text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] font-mono outline-none focus:border-[var(--border-visible)] transition-colors"
        />
      </div>

      <div
        className="flex flex-col gap-[2px] overflow-y-auto flex-1 pb-4"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-visible) transparent',
        }}
      >
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[var(--border-subtle)] rounded-xl mr-2">
            <BookOpen size={16} className="text-[var(--text-muted)] mb-3" />
            <p className="text-[var(--text-muted)] text-[8px] font-black uppercase tracking-[0.2em] text-center px-4">
              Aguardando nova indexação de dados
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-[10px] text-[var(--text-muted)] font-mono text-center py-8">Nenhuma entrada encontrada</p>
        ) : (
          <div className="flex flex-col gap-1 pr-2">
            {filtered.map(entry => (
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
