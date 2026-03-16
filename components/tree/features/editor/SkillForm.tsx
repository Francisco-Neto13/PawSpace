'use client';
import { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import { EmojiPicker } from './EmojiPicker';
import type { SkillData, SkillShape } from '../../types';
import { LIMITS } from '@/lib/limits';

const NAME_MAX = LIMITS.skill.name;
const DESC_MAX = LIMITS.skill.description;
const DEFAULT_SHAPE: SkillShape = 'circle';

interface SkillFormProps {
  onSubmit: (data: SkillFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialParentId?: string | null;
  existingSkills: { id: string; name: string }[];
  initialData?: (Partial<SkillData> & { id?: string }) | null;
  isEditing?: boolean;
}

export interface SkillFormData {
  label: string;
  description: string;
  icon: string;
  color: string;
  shape: SkillShape;
  parentId: string;
}

function normalizeHexColor(color: string | null | undefined) {
  const candidate = (color || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(candidate) ? candidate : '#22d3ee';
}

function getInitialFormData(
  initialData?: (Partial<SkillData> & { id?: string }) | null,
  initialParentId?: string | null
): SkillFormData {
  return {
    label: initialData?.label || initialData?.name || '',
    description: initialData?.description || '',
    icon: initialData?.icon || '*',
    color: normalizeHexColor(initialData?.color || '#22d3ee'),
    shape: (initialData?.shape as SkillShape) || DEFAULT_SHAPE,
    parentId: initialData?.parentId || initialParentId || '',
  };
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const remaining = max - current;
  if (current < max * 0.8) return null;
  return (
    <span className={`text-[9px] font-mono font-bold tabular-nums ${remaining <= 5 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
      {remaining}
    </span>
  );
}

export function SkillForm({
  onSubmit,
  onCancel,
  isLoading,
  initialParentId,
  existingSkills,
  initialData,
  isEditing = false,
}: SkillFormProps) {
  const [formData, setFormData] = useState(() => getInitialFormData(initialData, initialParentId));

  const emitPreview = (patch: Partial<typeof formData>) => {
    if (!initialData?.id) return;
    window.dispatchEvent(
      new CustomEvent('skill-preview', {
        detail: { skillId: initialData.id, ...patch },
      })
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.label.trim()) return;
    onSubmit(formData);
  };

  const labelClass = 'text-[8px] text-[var(--text-secondary)] uppercase font-black tracking-[0.25em]';
  const inputClass = 'library-input p-3.5 text-sm font-light placeholder:text-[var(--text-muted)] cursor-text';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Nome da Trilha *</label>
          <CharCounter current={formData.label.length} max={NAME_MAX} />
        </div>
        <input
          autoFocus
          type="text"
          value={formData.label}
          maxLength={NAME_MAX}
          onChange={(event) => {
            const label = event.target.value.slice(0, NAME_MAX);
            setFormData((prev) => ({ ...prev, label }));
            emitPreview({ label });
          }}
          className={inputClass}
          placeholder="Ex: Fundamentos de TypeScript"
        />
      </div>

      <div>
        <label className={`${labelClass} block mb-2`}>Identidade Visual</label>
        <div className="grid grid-cols-2 gap-3">
          <EmojiPicker
            currentEmoji={formData.icon}
            onSelect={(icon) => {
              setFormData((prev) => ({ ...prev, icon }));
              emitPreview({ icon });
            }}
          />
          <ColorPicker
            value={formData.color}
            onChange={(color) => {
              setFormData((prev) => ({ ...prev, color }));
              emitPreview({ color });
            }}
          />
        </div>
      </div>

      <input type="hidden" value={formData.shape} readOnly />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Resumo da Trilha</label>
          <CharCounter current={formData.description.length} max={DESC_MAX} />
        </div>
        <textarea
          value={formData.description}
          maxLength={DESC_MAX}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, description: event.target.value.slice(0, DESC_MAX) }))
          }
          className={`${inputClass} resize-none`}
          placeholder="O que esta trilha precisa dominar..."
          rows={3}
        />
      </div>

      {!isEditing && initialParentId === undefined && (
        <div>
          <label className={`${labelClass} block mb-2`}>Trilha pai (opcional)</label>
          <select
            value={formData.parentId}
            onChange={(event) => setFormData((prev) => ({ ...prev, parentId: event.target.value }))}
            className={`${inputClass} appearance-none cursor-pointer uppercase text-[10px]`}
          >
            <option value="">Sem trilha pai</option>
            {existingSkills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--border-subtle)] to-transparent" />

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-11 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] hover:border-[var(--border-muted)] transition-all duration-200 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.label.trim()}
          className="flex-1 h-11 rounded-xl border border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-input)] hover:border-[var(--text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          {isLoading ? 'Sincronizando...' : isEditing ? 'Salvar trilha' : 'Criar trilha'}
        </button>
      </div>
    </form>
  );
}
