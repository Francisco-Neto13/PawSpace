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
  const plainText = entry.body ? entry.body.replace(/<[^>]+>/g, '') : '';
  const previewLimit = 72;
  const preview = plainText ? plainText.slice(0, previewLimit) : 'Sem anotacoes por enquanto';
  const hasMorePreview = plainText.length > previewLimit;

  return (
    <button
      onClick={onSelect}
      className={`group relative w-full flex flex-col gap-2.5 px-3 py-3 border rounded-xl overflow-hidden text-left transition-all duration-200 ${
        isSelected
          ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)]'
          : 'border-[var(--border-subtle)] hover:border-[var(--border-muted)] hover:bg-[var(--bg-surface)]'
      }`}
    >
      {isSelected && (
        <>
          <div className="absolute left-0 top-[1px] bottom-[1px] w-[2px] bg-[var(--text-primary)]" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[var(--shimmer-via)] to-transparent" />
        </>
      )}

      <p
        className={`text-[11px] font-bold truncate transition-colors duration-200 ${
          isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
        }`}
      >
        {entry.title || 'Nota sem titulo'}
      </p>

      <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed line-clamp-2 min-h-[30px]">
        {preview}
        {hasMorePreview ? '...' : ''}
      </p>

      <div className="flex items-center gap-2 mt-0.5 min-w-0">
        {skill && (
          <span
            className="text-[8px] font-black uppercase tracking-wider px-2 py-1 border rounded-lg flex items-center gap-1.5 min-w-0"
            style={{
              color: skill.color || 'var(--text-contrast)',
              borderColor: skill.color ? `${skill.color}30` : 'var(--border-visible)',
              backgroundColor: skill.color ? `${skill.color}0d` : 'var(--bg-elevated)',
            }}
          >
            <span className="opacity-80 text-[10px] shrink-0">{skill.icon}</span>
            <span className="truncate">{skill.name}</span>
          </span>
        )}

        <span className="text-[9px] text-[var(--text-muted)] font-mono flex items-center gap-1 ml-auto shrink-0">
          <Calendar size={8} />
          {formatDate(entry.createdAt)}
        </span>
      </div>
    </button>
  );
}
