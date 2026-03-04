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

  const skill = getSkill(skillId, skills);
  const unlockedSkills = skills.filter(s => s.isUnlocked);

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
      className="flex flex-col bg-white/[0.01] border border-white/[0.04] rounded-sm shadow-2xl"
      style={{
        height: 'calc(100dvh - var(--navbar-height) - 120px)',
        position: 'sticky',
        top: 'calc(var(--navbar-height) + 24px)',
      }}
    >
      <div className="shrink-0 px-8 pt-8 pb-4 border-b border-white/[0.04]">

        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value.slice(0, TITLE_MAX))}
            placeholder="Título da entrada..."
            maxLength={TITLE_MAX}
            className="w-full bg-transparent text-white text-xl font-black outline-none placeholder:text-zinc-700 tracking-wide antialiased pr-16"
          />
          {showTitleWarn && (
            <span className={`absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold tabular-nums ${titleRemaining <= 5 ? 'text-red-400' : 'text-zinc-500'}`}>
              {titleRemaining}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 mt-4">
          <span className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono antialiased">
            <Calendar size={10} className="opacity-70" />
            {formatDate(entry.createdAt)}
          </span>

          <div className="w-[1px] h-3 bg-white/[0.06]" />

          <div className="relative">
            <button
              onClick={() => setShowSkillPicker(!showSkillPicker)}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer hover:opacity-80 antialiased"
              style={{ color: skill?.color ?? '#71717a' }}
            >
              <Tag size={9} />
              {skill ? `${skill.icon} ${skill.name}` : 'Vincular skill'}
              <ChevronDown size={8} className={`transition-transform duration-300 ${showSkillPicker ? 'rotate-180' : ''}`} />
            </button>

            {showSkillPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSkillPicker(false)} />
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#0a0a0a] border border-white/[0.1] z-50 flex flex-col py-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-150">
                  <div className="px-3 py-1.5 border-b border-white/[0.05] mb-1">
                    <span className="text-[7px] text-zinc-500 font-black uppercase tracking-[0.2em]">
                      Protocolos Disponíveis
                    </span>
                  </div>
                  <button
                    onClick={() => { setSkillId(null); setShowSkillPicker(false); }}
                    className="px-3 py-2 text-[10px] text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] text-left transition-colors font-bold uppercase"
                  >
                    Nenhum vínculo
                  </button>
                  <div className="max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,184,154,0.1) transparent' }}>
                    {unlockedSkills.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSkillId(s.id); setShowSkillPicker(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] hover:bg-white/[0.03] text-left transition-colors border-l-2 border-transparent hover:border-current"
                        style={{ color: s.color ?? '#ffffff' }}
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
              {isSaving ? (
                <span className="flex items-center gap-1.5 text-[8px] text-[#c8b89a] font-black uppercase animate-pulse">
                  <Loader2 size={10} className="animate-spin" />
                  Sincronizando...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[8px] text-zinc-500 font-black uppercase antialiased">
                  <CloudCheck size={10} className="text-zinc-600" />
                  Sincronizado
                </span>
              )}
            </div>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400/80 text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer antialiased"
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
            contentEditable
            suppressContentEditableWarning
            onInput={handleBodyInput}
            onBlur={save}
            className="h-full overflow-y-auto px-8 py-10 text-zinc-200 text-sm font-light leading-relaxed outline-none prose prose-invert max-w-none antialiased"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,184,154,0.1) transparent' }}
          />

          {showBodyCounter && (
            <div className="absolute bottom-4 right-6 pointer-events-none">
              <span className={`text-[9px] font-mono font-bold tabular-nums ${bodyRemaining <= 200 ? 'text-red-400' : 'text-zinc-600'}`}>
                {bodyRemaining.toLocaleString()} restantes
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
