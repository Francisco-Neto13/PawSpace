'use client';
import { BookOpen } from 'lucide-react';
import { EntryItem } from '../../ui/EntryItem';
import { JournalEntry, MockSkill } from '../../types';

interface JournalSidebarProps {
  entries: JournalEntry[];
  skills: MockSkill[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function JournalSidebar({ entries, skills, selectedId, onSelect }: JournalSidebarProps) {
  return (
    <aside className="w-72 shrink-0 flex flex-col min-h-0">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-3 bg-[#c8b89a]/40" />
        <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.3em]">
          Entradas
        </p>
      </div>

      <div
        className="flex flex-col gap-2 overflow-y-auto flex-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,184,154,0.1) transparent' }}
      >
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/[0.04]">
            <BookOpen size={20} className="text-zinc-700 mb-3" />
            <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">
              Nenhuma entrada
            </p>
          </div>
        ) : (
          entries.map(entry => (
            <EntryItem
              key={entry.id}
              entry={entry}
              skills={skills}
              isSelected={entry.id === selectedId}
              onSelect={() => onSelect(entry.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}