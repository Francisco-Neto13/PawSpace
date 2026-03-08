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
  const availableSkills = skills;

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    setBodyLength(el.innerText.length);
  }, [bodyRef]);

  const handleBodyInput = (e: React.FormEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const len = el.innerText.length;

    if (len > BODY_MAX) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        el.innerText = el.innerText.slice(0, BODY_MAX);
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      setBodyLength(BODY_MAX);
      return;
    }

    setBodyLength(len);
    scheduleBodySave();
  };

  const showBodyCounter = bodyLength >= BODY_MAX * 0.8;
  const bodyRemaining   = BODY_MAX - bodyLength;
  const titleRemaining  = TITLE_MAX - title.length;
  const showTitleWarn   = title.length >= TITLE_MAX * 0.8;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaving]);

  return (
    <div
      className="flex flex-col bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl"
      style={{
        height: 'calc(100dvh - var(--navbar-height) - 120px)',
        position: 'sticky',
        top: 'calc(var(--navbar-height) + 24px)',
      }}
    >
      <div className="shrink-0 px-8 pt-8 pb-4 border-b border-[var(--border-subtle)]">

        <div className="relative">
          <input
            type="text"
            value={title}
            disabled={isTemporaryEntry}
            onChange={e => setTitle(e.target.value.slice(0, TITLE_MAX))}
            placeholder="Título da entrada..."
            maxLength={TITLE_MAX}
            className={`w-full bg-transparent text-[var(--text-primary)] text-xl font-black outline-none placeholder:text-[var(--text-muted)] tracking-wide antialiased pr-16 ${
              isTemporaryEntry ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          />
          {showTitleWarn && (
            <span className={`absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold tabular-nums ${titleRemaining <= 5 ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
              {titleRemaining}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 mt-4">
          <span className="flex items-center gap-1.5 text-[9px] text-[var(--text-secondary)] font-mono antialiased">
            <Calendar size={10} className="opacity-70" />
            {formatDate(entry.createdAt)}
          </span>

          <div className="w-[1px] h-3 bg-[var(--border-subtle)]" />

          <div className="relative">
            <button
              disabled={isTemporaryEntry}
              onClick={() => setShowSkillPicker(!showSkillPicker)}
              className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-colors antialiased ${
                isTemporaryEntry ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
              }`}
              style={{ color: skill?.color ?? 'var(--text-muted)' }}
            >
              <Tag size={9} />
              {skill ? `${skill.icon} ${skill.name}` : 'Vincular módulo'}
              <ChevronDown size={8} className={`transition-transform duration-300 ${showSkillPicker ? 'rotate-180' : ''}`} />
            </button>

            {showSkillPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSkillPicker(false)} />
                <div className="absolute top-full left-0 mt-2 w-56 bg-[var(--bg-base)] border border-[var(--border-muted)] z-50 flex flex-col py-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-150">
                  <div className="px-3 py-1.5 border-b border-[var(--border-subtle)] mb-1">
                    <span className="text-[7px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em]">
                      Módulos disponíveis
                    </span>
                  </div>
                  <button
                    onClick={() => { setSkillId(null); setShowSkillPicker(false); }}
                    className="px-3 py-2 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] text-left transition-colors font-bold uppercase"
                  >
                    Nenhum vínculo
                  </button>
                  <div className="max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-visible) transparent' }}>
                    {availableSkills.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSkillId(s.id); setShowSkillPicker(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] hover:bg-[var(--bg-elevated)] text-left transition-colors border-l-2 border-transparent hover:border-current"
                        style={{ color: s.color ?? 'var(--text-contrast)' }}
                      >
                        <span className="text-[12px] opacity-80">{s.icon}</span>
                        <span className="font-bold uppercase tracking-wider">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2 mr-4">
              {isTemporaryEntry ? (
                <span className="flex items-center gap-1.5 text-[8px] text-[var(--text-primary)] font-black uppercase animate-pulse">
                  <Loader2 size={10} className="animate-spin" />
                  Criando entrada...
                </span>
              ) : isSaving ? (
                <span className="flex items-center gap-1.5 text-[8px] text-[var(--text-primary)] font-black uppercase animate-pulse">
                  <Loader2 size={10} className="animate-spin" />
                  Sincronizando...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[8px] text-[var(--text-secondary)] font-black uppercase antialiased">
                  <CloudCheck size={10} className="text-[var(--text-muted)]" />
                  Sincronizado
                </span>
              )}
            </div>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer antialiased"
            >
              <Trash2 size={10} />
              Excluir
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
            className={`h-full overflow-y-auto px-8 py-10 text-[var(--text-primary)] text-sm font-light leading-relaxed outline-none prose max-w-none antialiased prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-li:text-[var(--text-primary)] prose-code:text-[var(--text-primary)] prose-blockquote:text-[var(--text-secondary)] ${
              isTemporaryEntry ? 'opacity-70 cursor-wait' : ''
            }`}
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border-visible) transparent' }}
          />

          {showBodyCounter && (
            <div className="absolute bottom-4 right-6 pointer-events-none">
              <span className={`text-[9px] font-mono font-bold tabular-nums ${bodyRemaining <= 200 ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {bodyRemaining.toLocaleString()} restantes
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

