'use client';
import { useState } from 'react';
import { Calendar, Tag, Trash2 } from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { JournalEntry, MockSkill, getSkill, formatDate } from '../../types';

interface JournalEditorProps {
  entry: JournalEntry;
  skills: MockSkill[];
  onDelete: () => void;
}

export function JournalEditor({ entry, skills, onDelete }: JournalEditorProps) {
  const [title, setTitle] = useState(entry.title);
  const [selectedSkillId, setSelectedSkillId] = useState(entry.skillId);
  const skill = getSkill(selectedSkillId, skills);

  return (
    <div className="flex flex-col h-full">

      <div className="shrink-0 px-8 pt-8 pb-4 border-b border-white/[0.04]">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título da entrada..."
          className="w-full bg-transparent text-white text-xl font-black outline-none placeholder:text-zinc-700 tracking-wide"
        />

        <div className="flex items-center gap-4 mt-4">
          <span className="flex items-center gap-1.5 text-[9px] text-zinc-600 font-mono">
            <Calendar size={10} />
            {formatDate(entry.createdAt)}
          </span>

          <div className="w-[1px] h-3 bg-white/[0.06]" />

          <div className="relative group/skill">
            <button
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer"
              style={{ color: skill ? skill.color : '#52525b' }}
            >
              <Tag size={9} />
              {skill ? `${skill.icon} ${skill.name}` : 'Vincular skill'}
            </button>

            <div className="absolute top-full left-0 mt-2 w-44 bg-[#0a0a0a] border border-white/[0.06] z-20 hidden group-hover/skill:flex flex-col py-1 shadow-2xl">
              <button
                onClick={() => setSelectedSkillId(null)}
                className="px-3 py-2 text-[10px] text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] text-left font-medium transition-colors cursor-pointer"
              >
                Nenhuma
              </button>
              {skills.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSkillId(s.id)}
                  className="flex items-center gap-2 px-3 py-2 text-[10px] hover:bg-white/[0.03] text-left transition-colors cursor-pointer"
                  style={{ color: s.color }}
                >
                  <span>{s.icon}</span>
                  <span className="font-bold uppercase tracking-wider">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-zinc-700 hover:text-red-400 text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer"
            >
              <Trash2 size={10} />
              Excluir
            </button>
            <div className="w-[1px] h-3 bg-white/[0.06]" />
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#c8b89a]/30 bg-[#c8b89a]/[0.06] text-[#c8b89a] text-[9px] font-black uppercase tracking-widest hover:bg-[#c8b89a]/10 transition-all duration-300 cursor-pointer">
              Salvar
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <EditorToolbar />
        <div
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: entry.body }}
          className="flex-1 overflow-y-auto px-8 py-6 text-zinc-200 text-sm font-light leading-relaxed outline-none"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,184,154,0.1) transparent' }}
        />
      </div>
    </div>
  );
}