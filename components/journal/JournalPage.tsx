'use client';
import { useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { JournalSidebar } from './features/viewer/JournalSidebar';
import { JournalEditor } from './features/editor/JournalEditor';
import { JournalEntry, MOCK_ENTRIES, MOCK_SKILLS } from './types';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(MOCK_ENTRIES);
  const [selectedId, setSelectedId] = useState(MOCK_ENTRIES[0].id);

  const selectedEntry = entries.find(e => e.id === selectedId) ?? entries[0];

  const handleNewEntry = () => {
    const newEntry: JournalEntry = {
      id: String(Date.now()),
      title: 'Nova entrada',
      body: '',
      skillId: null,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setEntries(prev => [newEntry, ...prev]);
    setSelectedId(newEntry.id);
  };

  const handleDelete = () => {
    const remaining = entries.filter(e => e.id !== selectedId);
    setEntries(remaining);
    setSelectedId(remaining[0]?.id ?? '');
  };

  return (
    <div
      className="relative w-full bg-[#030304] flex flex-col overflow-hidden"
      style={{ height: 'calc(100dvh - var(--navbar-height) - var(--footer-height))' }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#c8b89a06_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-6 pb-6 flex flex-col gap-6 flex-1 min-h-0">

        <header className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-[#c8b89a]" />
              <h2 className="text-[#c8b89a] text-[10px] font-black uppercase tracking-[0.4em]">
                Nexus / Diário de Estudos
              </h2>
              <div className="h-[1px] w-32 bg-gradient-to-r from-[#c8b89a]/20 to-transparent" />
            </div>

            <div className="flex items-center gap-8">
              {[
                { label: 'Entradas',    value: entries.length },
                { label: 'Esta semana', value: 3 },
              ].map((s, i) => (
                <div key={i} className="text-right">
                  <p className="text-white text-2xl font-black font-mono leading-none">{s.value}</p>
                  <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
              <button
                onClick={handleNewEntry}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#c8b89a]/30 bg-[#c8b89a]/[0.06] text-[#c8b89a] text-[9px] font-black uppercase tracking-widest hover:bg-[#c8b89a]/10 hover:border-[#c8b89a]/50 transition-all duration-300 cursor-pointer"
              >
                <Plus size={11} />
                Nova Entrada
              </button>
            </div>
          </div>
        </header>

        <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">

          <JournalSidebar
            entries={entries}
            skills={MOCK_SKILLS}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          <main className="flex-1 min-w-0 border border-white/[0.04] bg-white/[0.01] overflow-hidden flex flex-col relative">
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{ background: 'linear-gradient(to right, #c8b89a22, transparent)' }}
            />
            {selectedEntry ? (
              <JournalEditor
                key={selectedEntry.id}
                entry={selectedEntry}
                skills={MOCK_SKILLS}
                onDelete={handleDelete}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <BookOpen size={24} className="text-zinc-700" />
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                  Selecione ou crie uma entrada
                </p>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}