'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { JournalEntry } from '../types';
import { saveJournalEntry } from '@/app/actions/journal';
import { useJournal } from '@/shared/contexts/JournalContext';

export function useJournalSinc(entry: JournalEntry, onUpdate: (updated: JournalEntry) => void) {
  const { setPending } = useJournal();
  const isTemporaryEntry = entry.id.startsWith('temp-');

  const [isSaving, setIsSaving] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(entry.title);
  const [skillId, setSkillId] = useState(entry.skillId);

  const titleRef = useRef(title);
  const skillIdRef = useRef(skillId);
  const entryRef = useRef(entry);
  const onUpdateRef = useRef(onUpdate);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    skillIdRef.current = skillId;
  }, [skillId]);

  useEffect(() => {
    entryRef.current = entry;
  }, [entry]);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const updatePending = useCallback(() => {
    if (isTemporaryEntry) {
      setPending(null);
      return;
    }

    if (!bodyRef.current) return;
    const currentBody = bodyRef.current.innerHTML;
    const currentEntry = entryRef.current;

    const unchanged =
      titleRef.current === currentEntry.title &&
      skillIdRef.current === currentEntry.skillId &&
      currentBody === currentEntry.body;

    if (unchanged) {
      setPending(null);
      return;
    }

    setPending({
      id: currentEntry.id,
      title: titleRef.current,
      body: currentBody,
      skillId: skillIdRef.current,
    });
  }, [isTemporaryEntry, setPending]);

  const save = useCallback(async () => {
    if (isTemporaryEntry) return;
    if (!bodyRef.current) return;
    if (isSavingRef.current) return;

    const currentBody = bodyRef.current.innerHTML;
    const currentTitle = titleRef.current;
    const currentSkillId = skillIdRef.current;
    const currentEntry = entryRef.current;

    const unchanged =
      currentTitle === currentEntry.title &&
      currentSkillId === currentEntry.skillId &&
      currentBody === currentEntry.body;

    if (unchanged) return;

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const result = await saveJournalEntry({
        id: currentEntry.id,
        title: currentTitle,
        body: currentBody,
        skillId: currentSkillId,
      });
      if (result.success && result.entry) {
        setPending(null);
        onUpdateRef.current(result.entry as unknown as JournalEntry);
      }
    } catch (error) {
      console.error('[Journal] Erro na sincronização:', error);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [isTemporaryEntry, setPending]);

  useEffect(() => {
    if (isTemporaryEntry) return;
    updatePending();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(save, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, skillId, save, updatePending, isTemporaryEntry]);

  const scheduleBodySave = useCallback(() => {
    if (isTemporaryEntry) return;
    updatePending();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(save, 300);
  }, [save, updatePending, isTemporaryEntry]);

  useEffect(() => {
    setPending(null);
    setTitle(entry.title);
    setSkillId(entry.skillId);
    if (bodyRef.current && bodyRef.current.innerHTML !== entry.body) {
      bodyRef.current.innerHTML = entry.body;
    }
  }, [entry.id, entry.title, entry.skillId, entry.body, setPending]);

  return {
    bodyRef,
    title,
    setTitle,
    skillId,
    setSkillId,
    isSaving,
    save,
    scheduleBodySave,
  };
}
