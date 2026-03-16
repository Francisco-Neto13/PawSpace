'use client';
import { useState, useEffect } from 'react';
import { Calendar, Tag, Trash2, CloudCheck, Loader2, ChevronDown } from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { JournalEntry, SkillBase, getSkill, formatDate } from '../../types';
import { useJournalSinc } from '../../hooks/useJournalSinc';
import { LIMITS } from '@/shared/lib/limits';

const TITLE_MAX = LIMITS.journal.title;
const BODY_MAX = LIMITS.journal.body;

interface JournalEditorProps {
  entry: JournalEntry;
  skills: SkillBase[];
  onDelete: () => void;
  onUpdate: (updated: JournalEntry) => void;
}

export function JournalEditor({ entry, skills, onDelete, onUpdate }: JournalEditorProps) {
  const { bodyRef, title, setTitle, skillId, setSkillId, isSaving, save, scheduleBodySave } = useJournalSinc(entry, onUpdate);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [bodyLength, setBodyLength] = useState(0);
  const isTemporaryEntry = entry.id.startsWith('temp-');

  const skill = getSkill(skillId, skills);
  const showBodyCounter = bodyLength >= BODY_MAX * 0.8;
  const bodyRemaining = BODY_MAX - bodyLength;
  const titleRemaining = TITLE_MAX - title.length;
  const showTitleWarn = title.length >= TITLE_MAX * 0.8;

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    setBodyLength(el.innerText.length);
  }, [bodyRef]);

  const handleBodyInput = (e: React.FormEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const len = el.innerText.length;

    if (len > BODY_MAX) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        el.innerText = el.innerText.slice(0, BODY_MAX);
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setBodyLength(BODY_MAX);
      return;
    }

    setBodyLength(len);
    scheduleBodySave();
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isSaving) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaving]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 px-5 md:px-7 pt-5 md:pt-6 pb-4 border-b border-[var(--border-subtle)]">
        <div className="relative">
          <input
            type="text"
            value={title}
            disabled={isTemporaryEntry}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            placeholder="Titulo da nota..."
            maxLength={TITLE_MAX}
            className={`w-full bg-transparent text-[var(--text-primary)] text-xl font-black outline-none placeholder:text-[var(--text-muted)] tracking-wide pr-16 ${
              isTemporaryEntry ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          />
          {showTitleWarn && (
            <span
              className={`absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold tabular-nums ${
                titleRemaining <= 5 ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              {titleRemaining}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4">
          <span className="flex items-center gap-1.5 text-[9px] text-[var(--text-secondary)] font-mono">
            <Calendar size={10} className="opacity-70" />
            {formatDate(entry.createdAt)}
          </span>

          <div className="w-[1px] h-3 bg-[var(--border-subtle)] hidden sm:block" />

          <div className="relative">
            <button
              disabled={isTemporaryEntry}
              onClick={() => setShowSkillPicker((prev) => !prev)}
              className={`h-8 px-2.5 rounded-lg border flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-colors ${
                isTemporaryEntry
                  ? 'opacity-40 cursor-not-allowed border-[var(--border-subtle)] text-[var(--text-muted)]'
                  : 'cursor-pointer border-[var(--border-subtle)] hover:border-[var(--border-muted)]'
              }`}
              style={{ color: skill?.color ?? 'var(--text-muted)' }}
            >
              <Tag size={9} />
              <span className="max-w-[190px] truncate">{skill ? `${skill.icon} ${skill.name}` : 'Vincular trilha'}</span>
              <ChevronDown size={8} className={`transition-transform duration-200 ${showSkillPicker ? 'rotate-180' : ''}`} />
            </button>

            {showSkillPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSkillPicker(false)} />
                <div className="absolute top-full left-0 mt-2 w-60 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                    <span className="text-[7px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em]">
                      Trilhas disponiveis
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSkillId(null);
                      setShowSkillPicker(false);
                    }}
                    className="w-full px-3 py-2 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] text-left transition-colors font-bold uppercase"
                  >
                    Nota solta
                  </button>

                  <div className="max-h-48 overview-scroll-area p-1.5 pt-0.5">
                    {skills.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSkillId(item.id);
                          setShowSkillPicker(false);
                        }}
                        className="w-full h-9 rounded-lg flex items-center gap-2 px-2.5 text-[10px] hover:bg-[var(--bg-elevated)] text-left transition-colors border border-transparent hover:border-[var(--border-subtle)]"
                        style={{ color: item.color ?? 'var(--text-contrast)' }}
                      >
                        <span className="text-[12px] opacity-80">{item.icon}</span>
                        <span className="font-bold uppercase tracking-wider truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {isTemporaryEntry ? (
              <span className="flex items-center gap-1.5 text-[8px] text-[var(--text-primary)] font-black uppercase animate-pulse">
                <Loader2 size={10} className="animate-spin" />
                Criando nota...
              </span>
            ) : isSaving ? (
              <span className="flex items-center gap-1.5 text-[8px] text-[var(--text-primary)] font-black uppercase animate-pulse">
                <Loader2 size={10} className="animate-spin" />
                Salvando rastro...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[8px] text-[var(--text-secondary)] font-black uppercase">
                <CloudCheck size={10} className="text-[var(--text-muted)]" />
                Rastro salvo
              </span>
            )}

            <button
              onClick={onDelete}
              className="h-8 px-2.5 rounded-lg border border-[var(--border-subtle)] flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-muted)] text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer"
            >
              <Trash2 size={10} />
              Apagar nota
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <EditorToolbar />
        <div className="relative flex-1 min-h-0">
          <div
            ref={bodyRef}
            contentEditable={!isTemporaryEntry}
            suppressContentEditableWarning
            onInput={isTemporaryEntry ? undefined : handleBodyInput}
            onBlur={isTemporaryEntry ? undefined : save}
            className={`h-full overflow-y-auto px-5 md:px-7 py-7 text-[var(--text-primary)] text-sm font-light leading-relaxed outline-none prose max-w-none prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-li:text-[var(--text-primary)] prose-code:text-[var(--text-primary)] prose-blockquote:text-[var(--text-secondary)] ${
              isTemporaryEntry ? 'opacity-70 cursor-wait' : ''
            }`}
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-visible) transparent' }}
          />

          {showBodyCounter && (
            <div className="absolute bottom-4 right-6 pointer-events-none">
              <span
                className={`text-[9px] font-mono font-bold tabular-nums ${
                  bodyRemaining <= 200 ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {bodyRemaining.toLocaleString()} restantes
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
