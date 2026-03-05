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
      className="w-80 shrink-0 flex flex-col gap-3"
      style={{
        height: 'calc(100dvh - var(--navbar-height) - 120px)',
        position: 'sticky',
        top: 'calc(var(--navbar-height) + 24px)',
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-1 h-3 bg-[#2dd4bf]/40" />
        <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.3em] antialiased">
          Arquivo de Notas
        </p>
      </div>

      <div className="relative">
        <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar entrada..."
          className="w-full bg-white/[0.02] border border-white/[0.06] pl-8 pr-3 py-2.5 text-[10px] text-zinc-300 placeholder:text-zinc-700 font-mono outline-none focus:border-[#2dd4bf]/20 transition-colors"
        />
      </div>

      <div
        className="flex flex-col gap-[2px] overflow-y-auto flex-1 pb-4"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(45,212,191,0.1) transparent',
        }}
      >
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/[0.04] rounded-sm mr-2">
            <BookOpen size={16} className="text-zinc-800 mb-3" />
            <p className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.2em] text-center px-4">
              Aguardando nova indexação de dados
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-[10px] text-zinc-700 font-mono text-center py-8">Nenhuma entrada encontrada</p>
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