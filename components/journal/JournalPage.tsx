'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { BookOpen, Plus, Loader2 } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import { PageBackground } from '@/components/shared/PageBackground';
import { JournalSidebar } from './features/viewer/JournalSidebar';
import { JournalEditor } from './features/editor/JournalEditor';
import { JournalEntry, SkillBase } from './types';
import { useNexus } from '@/shared/contexts/NexusContext';
import { useJournal } from '@/shared/contexts/JournalContext';
import { saveJournalEntry, deleteJournalEntry } from '@/app/actions/journal';

export default function JournalPage() {
  const { nodes, isLoading: isLoadingNexus } = useNexus();
  const { entries, setEntries, isLoading: isLoadingEntries } = useJournal();

  const [visible, setVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    entries.length > 0 ? entries[0].id : null
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const skillList = useMemo<SkillBase[]>(() => nodes.map(n => ({
    id: n.id,
    name: n.data.label || n.data.name || 'Sem Nome',
    icon: n.data.icon || '*',
    color: n.data.color || '#ffffff',
  })), [nodes]);

  const selectedEntry = useMemo(() =>
    entries.find(e => e.id === selectedId) || null,
  [entries, selectedId]);

  const handleUpdateEntry = useCallback((updated: JournalEntry) => {
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
  }, [setEntries]);

  const handleNewEntry = async () => {
    const tempId = `temp-${Date.now()}`;
    const placeholder: JournalEntry = {
      id: tempId,
      title: 'Nova Entrada',
      body: '',
      skillId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEntries(prev => [placeholder, ...prev]);
    setSelectedId(tempId);
    setIsSaving(true);

    try {
      const result = await saveJournalEntry({
        title: placeholder.title,
        body: placeholder.body,
        skillId: placeholder.skillId,
      });

      if (result.success && result.entry) {
        const realEntry = result.entry as unknown as JournalEntry;
        setEntries(prev => prev.map(e => e.id === tempId ? realEntry : e));
        setSelectedId(realEntry.id);
      } else {
        throw new Error();
      }
    } catch {
      setEntries(prev => prev.filter(e => e.id !== tempId));
      setSelectedId(entries[0]?.id || null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja deletar esta entrada?')) return;
    if (isSaving) return;

    const previousEntries = [...entries];
    const remaining = entries.filter(e => e.id !== id);
    setEntries(remaining);
    setSelectedId(remaining[0]?.id ?? null);

    if (id.startsWith('temp-')) return;

    setIsSaving(true);
    try {
      const result = await deleteJournalEntry(id);
      if (!result.success) throw new Error();
    } catch {
      setEntries(previousEntries);
      setSelectedId(id);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingNexus && nodes.length === 0) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-2 border-[#ffffff]/20 border-t-[#ffffff] rounded-full animate-spin" />
        <p className="text-[#ffffff] text-[10px] font-black uppercase tracking-[0.4em] mt-4 animate-pulse">
          Sincronizando Pawspace...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a]">
      <PageBackground src="/cat4.webp" />

      <div
        className="relative z-10 w-full py-8 pb-20 space-y-4"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
          <span className="text-[#ffffff] text-[9px] font-black uppercase tracking-[0.4em]">
            Pawspace / Diário
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#ffffff]/15 to-transparent" />
        </div>

        <header>
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-white text-2xl font-black font-mono leading-none tracking-tighter">
                  {isLoadingEntries ? '--' : entries.length.toString().padStart(2, '0')}
                </p>
                <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-1">Registros</p>
              </div>
              <button
                onClick={handleNewEntry}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#ffffff]/30 bg-[#ffffff]/[0.06] text-[#ffffff] text-[9px] font-black uppercase tracking-widest hover:bg-[#ffffff]/10 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={11} />
                Nova Entrada
              </button>
            </div>
          </div>
        </header>

        <div className="flex gap-8" style={{ minHeight: 'calc(100dvh - var(--navbar-height) - 120px)' }}>
          <JournalSidebar
            entries={entries}
            skills={skillList}
            selectedId={selectedId || ''}
            onSelect={setSelectedId}
          />

          <main className="flex-1 min-w-0 border border-white/[0.06] bg-white/[0.02] flex flex-col relative rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-white opacity-[0.04] pointer-events-none" />
            {isLoadingEntries ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="text-[#ffffff]/20 animate-spin" size={24} />
              </div>
            ) : selectedEntry ? (
              <JournalEditor
                key={selectedEntry.id}
                entry={selectedEntry}
                skills={skillList}
                onDelete={() => handleDelete(selectedEntry.id)}
                onUpdate={handleUpdateEntry}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 group py-20">
                <BookOpen size={32} className="text-zinc-500 group-hover:text-zinc-400 transition-colors duration-500" />
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                  Nenhum registro selecionado
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}


