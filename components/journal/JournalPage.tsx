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
import { useOverview } from '@/shared/contexts/OverviewContext';
import { useConfirmDialog } from '@/shared/contexts/ConfirmDialogContext';
import { saveJournalEntry, deleteJournalEntry } from '@/app/actions/journal';

export default function JournalPage() {
  const { nodes, isLoading: isLoadingNexus, refreshGlobalStats } = useNexus();
  const { entries, setEntries, isLoading: isLoadingEntries, flushPending } = useJournal();
  const { invalidateOverview } = useOverview();
  const confirmDialog = useConfirmDialog();

  const [selectedId, setSelectedId] = useState<string | null>(entries.length > 0 ? entries[0].id : null);
  const [isPersisting, setIsPersisting] = useState(false);

  const skillList = useMemo<SkillBase[]>(
    () =>
      nodes.map((n) => ({
        id: n.id,
        name: n.data.label || n.data.name || 'Sem Nome',
        icon: n.data.icon || '*',
        color: n.data.color || 'var(--text-contrast)',
      })),
    [nodes]
  );

  const selectedEntry = useMemo(
    () => entries.find((e) => e.id === selectedId) || null,
    [entries, selectedId]
  );

  const linkedEntriesCount = useMemo(
    () => entries.filter((entry) => Boolean(entry.skillId)).length,
    [entries]
  );

  const handleUpdateEntry = useCallback(
    (updated: JournalEntry) => {
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    },
    [setEntries]
  );

  const handleNewEntry = async () => {
    if (isPersisting) return;

    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const placeholder: JournalEntry = {
      id: tempId,
      title: 'Nova Entrada',
      body: '',
      skillId: null,
      createdAt: now,
      updatedAt: now,
    };

    setEntries((prev) => [placeholder, ...prev]);
    setSelectedId(tempId);
    setIsPersisting(true);

    try {
      const result = await saveJournalEntry({
        title: placeholder.title,
        body: placeholder.body,
        skillId: placeholder.skillId,
      });

      if (result.success && result.entry) {
        const realEntry = result.entry as unknown as JournalEntry;
        setEntries((prev) => prev.map((e) => (e.id === tempId ? realEntry : e)));
        setSelectedId(realEntry.id);
        invalidateOverview();
        void refreshGlobalStats();
      } else {
        throw new Error('failed to create');
      }
    } catch {
      setEntries((prev) => prev.filter((e) => e.id !== tempId));
      setSelectedId(entries[0]?.id || null);
    } finally {
      setIsPersisting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const entry = entries.find((item) => item.id === id);
    const isConfirmed = await confirmDialog({
      title: 'Excluir entrada',
      description: `Esta entrada será removida do diário: "${entry?.title ?? 'Sem título'}".`,
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    });

    if (!isConfirmed || isPersisting) return;

    const previousEntries = [...entries];
    const remaining = entries.filter((e) => e.id !== id);
    setEntries(remaining);
    setSelectedId(remaining[0]?.id ?? null);

    if (id.startsWith('temp-')) return;

    setIsPersisting(true);
    try {
      const result = await deleteJournalEntry(id);
      if (!result.success) throw new Error('failed to delete');
      invalidateOverview();
      void refreshGlobalStats();
    } catch {
      setEntries(previousEntries);
      setSelectedId(id);
    } finally {
      setIsPersisting(false);
    }
  };

  const handleSelectEntry = (id: string) => {
    void flushPending();
    setSelectedId(id);
  };

  useEffect(() => {
    return () => {
      void flushPending();
    };
  }, [flushPending]);

  if (isLoadingNexus && nodes.length === 0) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 border-2 border-[var(--border-visible)] border-t-[var(--text-primary)] rounded-full animate-spin" />
        <p className="text-[var(--text-primary)] text-[10px] font-black uppercase tracking-[0.4em] mt-4 animate-pulse">
          Sincronizando Pawspace...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <PageBackground src="/cat4.webp" />

      <div className="relative z-10 py-8 pb-20">
        <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 2xl:px-16 space-y-5">
          <div className="flex items-center gap-3">
            <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
            <span className="text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.4em]">
              Pawspace / Diário
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--shimmer-via)] to-transparent" />
          </div>

          <section className="library-panel library-panel-hover p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className="library-kicker mb-2">Central de Escrita</p>
                <h1 className="overview-title text-2xl md:text-3xl mb-2">Diário de Aprendizado</h1>
                <p className="library-subtitle max-w-2xl">
                  Registre progresso, decisões e revisões. Vincule entradas aos módulos para manter histórico contextual dentro da árvore.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="library-chip">Registros: {isLoadingEntries ? '--' : entries.length}</span>
                  <span className="library-chip">Vinculados: {linkedEntriesCount}</span>
                  <span className="library-chip">Sem vínculo: {Math.max(entries.length - linkedEntriesCount, 0)}</span>
                </div>
              </div>

              <button
                onClick={handleNewEntry}
                disabled={isPersisting}
                className="h-10 shrink-0 flex items-center justify-center gap-2 px-4 border border-[var(--border-visible)] rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[9px] font-black uppercase tracking-widest hover:bg-[var(--bg-input)] transition-all cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={11} />
                Nova Entrada
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-4 items-start">
            <JournalSidebar
              entries={entries}
              skills={skillList}
              selectedId={selectedId || ''}
              onSelect={handleSelectEntry}
            />

            <main className="library-panel relative overflow-hidden flex flex-col min-h-[calc(100dvh-var(--navbar-height)-140px)]">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
              <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-[var(--text-primary)] opacity-[0.04] pointer-events-none" />

              {isLoadingEntries ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="text-[var(--text-secondary)] animate-spin" size={24} />
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
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
                  <BookOpen size={32} className="text-[var(--text-muted)]" />
                  <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.3em]">
                    Nenhum registro selecionado
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
