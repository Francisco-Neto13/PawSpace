'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { JournalEntry } from '../types';
import { saveJournalEntry } from '@/app/actions/journal';

export function useJournalSinc(entry: JournalEntry, onUpdate: (updated: JournalEntry) => void) {
  const [isSaving, setIsSaving] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(entry.title);
  const [skillId, setSkillId] = useState(entry.skillId);

  const save = useCallback(async () => {
    if (!bodyRef.current) return;
    
    const currentBody = bodyRef.current.innerHTML;
    if (title === entry.title && skillId === entry.skillId && currentBody === entry.body) return;

    setIsSaving(true);
    try {
      const result = await saveJournalEntry({
        id: entry.id,
        title,
        body: currentBody,
        skillId,
      });

      if (result.success && result.entry) {
        onUpdate(result.entry as unknown as JournalEntry);
      }
    } catch (e) {
      console.error("Erro na sincronização do Journal:", e);
    } finally {
      setIsSaving(false);
    }
  }, [entry, title, skillId, onUpdate]);

  useEffect(() => {
    const timer = setTimeout(save, 1500);
    return () => clearTimeout(timer);
  }, [save, title, skillId]);

  return {
    bodyRef,
    title,
    setTitle,
    skillId,
    setSkillId,
    isSaving,
    save 
  };
}