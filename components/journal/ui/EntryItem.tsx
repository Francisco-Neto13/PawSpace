'use client';
import { Calendar } from 'lucide-react';
import { JournalEntry, SkillBase, getSkill, formatDate } from '../types';

interface EntryItemProps {
  entry: JournalEntry;
  skills: SkillBase[]; 
  isSelected: boolean;
  onSelect: () => void;
}

export function EntryItem({ entry, skills, isSelected, onSelect }: EntryItemProps) {
  const skill = getSkill(entry.skillId, skills);
  
  const preview = entry.body 
    ? entry.body.replace(/<[^>]+>/g, '').slice(0, 60) 
    : 'Sem conteúdo adicional...';

  return (
    <button
      onClick={onSelect}
      className={`group relative w-full flex flex-col gap-2 px-4 py-4 border rounded-xl overflow-hidden text-left transition-all duration-300
        ${isSelected
          ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)]'
          : 'border-[var(--border-subtle)] hover:border-[var(--border-visible)] hover:bg-[var(--bg-elevated)]'
        }`}
    >
      {isSelected && (
        <>
          <div className="absolute left-0 top-[1px] bottom-[1px] w-[2px] bg-[var(--text-primary)]" />
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(to right, var(--shimmer-via), transparent)' }}
          />
        </>
      )}

      <p className={`text-[11px] font-bold truncate transition-colors ${
        isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
      }`}>
        {entry.title || 'Sem Título'}
      </p>

      <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed line-clamp-2 min-h-[30px]">
        {preview}…
      </p>

      <div className="flex items-center gap-2 mt-1">
        {skill && (
          <div className="flex items-center gap-2">
            <span
              className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border flex items-center gap-1.5"
              style={{ 
                color: skill.color || 'var(--text-contrast)',
                borderColor: skill.color ? `${skill.color}30` : 'var(--border-visible)',
                backgroundColor: skill.color ? `${skill.color}0d` : 'var(--bg-elevated)',
              }}
            >
              <span className="opacity-80 text-[10px]">{skill.icon}</span>
              {skill.name}
            </span>
          </div>
        )}
        
        <span className="text-[9px] text-[var(--text-muted)] font-mono flex items-center gap-1 ml-auto">
          <Calendar size={8} />
          {formatDate(entry.createdAt)}
        </span>
      </div>

      <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[4px] border-r-[4px] border-transparent group-hover:border-r-[var(--border-muted)] group-hover:border-b-[var(--border-muted)] transition-all" />
    </button>
  );
}
