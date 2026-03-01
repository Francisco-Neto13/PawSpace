'use client';
import { Calendar } from 'lucide-react';
import { JournalEntry, MockSkill, getSkill, formatDate } from '../types';

interface EntryItemProps {
  entry: JournalEntry;
  skills: MockSkill[];
  isSelected: boolean;
  onSelect: () => void;
}

export function EntryItem({ entry, skills, isSelected, onSelect }: EntryItemProps) {
  const skill = getSkill(entry.skillId, skills);
  const preview = entry.body.replace(/<[^>]+>/g, '').slice(0, 60);

  return (
    <button
      onClick={onSelect}
      className={`group relative w-full flex flex-col gap-2 px-4 py-4 border text-left transition-all duration-300
        ${isSelected
          ? 'border-[#c8b89a]/20 bg-[#c8b89a]/[0.04]'
          : 'border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]'
        }`}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#c8b89a]" />
      )}
      {isSelected && (
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(to right, #c8b89a33, transparent)' }}
        />
      )}

      <p className={`text-[11px] font-bold truncate transition-colors ${isSelected ? 'text-[#c8b89a]' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
        {entry.title}
      </p>

      <p className="text-[10px] text-zinc-500 font-medium leading-relaxed line-clamp-2">
        {preview}…
      </p>

      <div className="flex items-center gap-2 mt-1">
        {skill && (
          <span
            className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border"
            style={{ color: skill.color, borderColor: `${skill.color}30`, backgroundColor: `${skill.color}0d` }}
          >
            {skill.icon} {skill.name}
          </span>
        )}
        <span className="text-[9px] text-zinc-700 font-mono flex items-center gap-1 ml-auto">
          <Calendar size={8} />
          {formatDate(entry.createdAt)}
        </span>
      </div>
    </button>
  );
}