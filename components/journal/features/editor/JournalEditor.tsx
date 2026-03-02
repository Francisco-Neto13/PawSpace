'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Tag, Trash2, CloudCheck, Loader2, ChevronDown } from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { JournalEntry, SkillBase, getSkill, formatDate } from '../../types';
import { saveJournalEntry } from '@/app/actions/journal';
import { useNexus } from '@/contexts/NexusContext';

interface JournalEditorProps {
  entry: JournalEntry;
  skills: SkillBase[];
  onDelete: () => void;
  onUpdate: (updated: JournalEntry) => void;
}

export function JournalEditor({ entry, skills, onDelete, onUpdate }: JournalEditorProps) {
  const { setIsSaving, isSaving } = useNexus();
  const [title, setTitle] = useState(entry.title);
  const [selectedSkillId, setSelectedSkillId] = useState(entry.skillId);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  
  const bodyRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  const skill = getSkill(selectedSkillId, skills);
  const unlockedSkills = skills.filter(s => s.isUnlocked);

  const handleSave = useCallback(async (currentTitle: string, currentSkillId: string | null) => {
    if (!bodyRef.current) return;
    
    setIsSaving(true);
    const currentBody = bodyRef.current.innerHTML;

    const result = await saveJournalEntry({
      id: entry.id,
      title: currentTitle,
      body: currentBody,
      skillId: currentSkillId,
    });

    if (result.success && result.entry) {
      isInternalUpdate.current = true;
      onUpdate(result.entry as unknown as JournalEntry);
    }
    setIsSaving(false);
  }, [entry.id, setIsSaving, onUpdate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== entry.title || selectedSkillId !== entry.skillId) {
        handleSave(title, selectedSkillId);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [title, selectedSkillId, handleSave, entry.title, entry.skillId]);

  useEffect(() => {
    setTitle(entry.title);
    setSelectedSkillId(entry.skillId);
    
    if (bodyRef.current && !isInternalUpdate.current) {
      bodyRef.current.innerHTML = entry.body;
    }
    isInternalUpdate.current = false;
  }, [entry]);

  return (
    <div className="flex flex-col h-full bg-white/[0.01]">
      <div className="shrink-0 px-8 pt-8 pb-4 border-b border-white/[0.04]">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título da entrada..."
          className="w-full bg-transparent text-white text-xl font-black outline-none placeholder:text-zinc-700 tracking-wide antialiased"
        />

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
              style={{ color: skill ? skill.color : '#71717a' }}
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
                    <span className="text-[7px] text-zinc-500 font-black uppercase tracking-[0.2em]">Protocolos Disponíveis</span>
                  </div>
                  
                  <button
                    onClick={() => { setSelectedSkillId(null); setShowSkillPicker(false); }}
                    className="px-3 py-2 text-[10px] text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] text-left transition-colors font-bold uppercase"
                  >
                    Nenhum vínculo
                  </button>

                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {unlockedSkills.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedSkillId(s.id); setShowSkillPicker(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] hover:bg-white/[0.03] text-left transition-colors border-l-2 border-transparent hover:border-current"
                        style={{ color: s.color || '#fff' }}
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
        <div
          ref={bodyRef}
          contentEditable
          suppressContentEditableWarning
          className="flex-1 overflow-y-auto px-8 py-10 text-zinc-200 text-sm font-light leading-relaxed outline-none prose prose-invert max-w-none antialiased"
          style={{ 
            scrollbarWidth: 'thin', 
            scrollbarColor: 'rgba(200,184,154,0.1) transparent',
            textShadow: '0 0 1px rgba(255,255,255,0.01)'
          }}
        />
      </div>
    </div>
  );
}