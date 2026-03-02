'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { BookOpen, Plus, Loader2 } from 'lucide-react';
import { JournalSidebar } from './features/viewer/JournalSidebar';
import { JournalEditor } from './features/editor/JournalEditor';
import { JournalEntry, SkillBase } from './types';
import { useNexus } from '@/contexts/NexusContext'; 
import { getJournalEntries, saveJournalEntry, deleteJournalEntry } from '@/app/actions/journal';

export default function JournalPage() {
  const { nodes, isLoading: isLoadingNexus, setIsSaving } = useNexus();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoadingEntries(true);
      try {
        const data = await getJournalEntries();
        const typedData = data as unknown as JournalEntry[];
        setEntries(typedData);
        if (typedData.length > 0) setSelectedId(typedData[0].id);
      } catch (error) {
        console.error("Erro ao carregar diário:", error);
      } finally {
        setIsLoadingEntries(false);
      }
    }
    load();
  }, []);

  const skillList = useMemo(() => {
    return nodes.map(n => ({
      id: n.id,
      name: n.data.label || n.data.name || 'Sem Nome',
      icon: n.data.icon || '✦',
      color: n.data.color || '#c8b89a',
      isUnlocked: !!n.data.isUnlocked 
    })) as SkillBase[];
  }, [nodes]);

  const selectedEntry = useMemo(() => 
    entries.find(e => e.id === selectedId) || null
  , [entries, selectedId]);

  const handleUpdateEntry = useCallback((updated: JournalEntry) => {
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
  }, []);

  const handleNewEntry = async () => {
    const tempId = `temp-${Date.now()}`;
    const placeholder: JournalEntry = {
      id: tempId,
      title: 'Nova Entrada Protocolada',
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
    
    const previousEntries = [...entries];
    const remaining = entries.filter(e => e.id !== id);
    setEntries(remaining);
    setSelectedId(remaining[0]?.id ?? null);

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
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#030304]">
        <div className="w-8 h-8 border-2 border-[#c8b89a]/20 border-t-[#c8b89a] rounded-full animate-spin" />
        <p className="text-[#c8b89a] text-[10px] font-black uppercase tracking-[0.4em] mt-4 animate-pulse">
          Sincronizando Nexus...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#030304] flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#c8b89a06_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full p-6 flex flex-col gap-10 flex-1 min-h-0">
        <header className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-[#c8b89a]" />
              <h2 className="text-[#c8b89a] text-[10px] font-black uppercase tracking-[0.4em]">Nexus / Diário de Bordo</h2>
              <div className="h-[1px] w-32 bg-gradient-to-r from-[#c8b89a]/20 to-transparent" />
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-white text-2xl font-black font-mono leading-none tracking-tighter">
                  {isLoadingEntries ? '--' : entries.length.toString().padStart(2, '0')}
                </p>
                <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-1">Registros</p>
              </div>
              <button onClick={handleNewEntry} className="flex items-center gap-2 px-4 py-2.5 border border-[#c8b89a]/30 bg-[#c8b89a]/[0.06] text-[#c8b89a] text-[9px] font-black uppercase tracking-widest hover:bg-[#c8b89a]/10 transition-all cursor-pointer active:scale-95">
                <Plus size={11} />
                Nova Entrada
              </button>
            </div>
          </div>
        </header>

        <div className="flex gap-8 flex-1 min-h-0 overflow-hidden">
          <JournalSidebar
            entries={entries}
            skills={skillList}
            selectedId={selectedId || ''}
            onSelect={setSelectedId}
          />

          <main className="flex-1 min-w-0 border border-white/[0.04] bg-white/[0.01] overflow-hidden flex flex-col relative rounded-sm shadow-2xl">
            {isLoadingEntries ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="text-[#c8b89a]/20 animate-spin" size={24} />
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
              <div className="flex-1 flex flex-col items-center justify-center gap-4 group">
                <BookOpen size={32} className="text-zinc-800 group-hover:text-zinc-700 transition-colors duration-500" />
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] antialiased">Nenhum registro selecionado</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}