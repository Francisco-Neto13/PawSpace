'use client';
import { BookOpen } from 'lucide-react';
import { EntryItem } from '../../ui/EntryItem';
import { JournalEntry, SkillBase } from '../../types';

interface JournalSidebarProps {
  entries: JournalEntry[];
  skills: SkillBase[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function JournalSidebar({ entries, skills, selectedId, onSelect }: JournalSidebarProps) {
  return (
    <aside className="w-80 shrink-0 flex flex-col min-h-0">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-3 bg-[#c8b89a]/40" />
        <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.3em] antialiased">
          Arquivo de Notas
        </p>
      </div>

      <div
        className="flex flex-col gap-[2px] overflow-y-auto flex-1 pb-20 custom-scrollbar"
        style={{ 
          scrollbarWidth: 'thin', 
          scrollbarColor: 'rgba(200,184,154,0.1) transparent' 
        }}
      >
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/[0.04] rounded-sm mr-2">
            <BookOpen size={16} className="text-zinc-800 mb-3" />
            <p className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.2em] text-center px-4">
              Aguardando nova indexação de dados
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 pr-2">
            {entries.map(entry => (
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