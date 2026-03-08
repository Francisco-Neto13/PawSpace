'use client';
import { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import { EmojiPicker } from './EmojiPicker';
import type { SkillData, SkillShape } from '../../types';
import { LIMITS } from '@/lib/limits';

const NAME_MAX = LIMITS.skill.name;
const DESC_MAX = LIMITS.skill.description;

const SHAPES: { value: SkillShape; label: string; preview: string }[] = [
  { value: 'hexagon', label: 'Hexágono', preview: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)' },
  { value: 'circle',  label: 'Círculo',  preview: 'circle(50% at 50% 50%)' },
  { value: 'square',  label: 'Quadrado', preview: 'inset(0% round 4px)' },
  { value: 'diamond', label: 'Diamante', preview: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
];

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
    icon: initialData?.icon || '✦',
    color: normalizeHexColor(initialData?.color || '#22d3ee'),
    shape: (initialData?.shape as SkillShape) || 'hexagon',
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
    window.dispatchEvent(new CustomEvent('skill-preview', {
      detail: { skillId: initialData.id, ...patch },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) return;
    onSubmit(formData);
  };

  const labelClass = 'text-[8px] text-[var(--text-secondary)] uppercase font-black tracking-[0.25em]';
  const inputClass = 'w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3.5 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--border-visible)] transition-colors font-light placeholder:text-[var(--text-muted)] cursor-text';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Identificação *</label>
          <CharCounter current={formData.label.length} max={NAME_MAX} />
        </div>
        <input
          autoFocus
          type="text"
          value={formData.label}
          maxLength={NAME_MAX}
          onChange={(e) => {
            const label = e.target.value.slice(0, NAME_MAX);
            setFormData((prev) => ({ ...prev, label }));
            emitPreview({ label });
          }}
          className={inputClass}
          placeholder="Ex: TypeScript Avançado"
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

      <div>
        <label className={`${labelClass} block mb-2`}>Arquitetura do Nó</label>
        <div className="grid grid-cols-4 gap-2">
          {SHAPES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, shape: s.value }))}
              className={`group flex flex-col items-center gap-2.5 p-3 border transition-all duration-300 cursor-pointer ${
                formData.shape === s.value
                  ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)]'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-muted)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              <div
                className="w-5 h-5 transition-colors duration-300"
                style={{
                  clipPath: s.preview,
                  backgroundColor: formData.shape === s.value ? formData.color : 'var(--text-faint)',
                }}
              />
              <span className={`text-[7px] font-black uppercase tracking-wider transition-colors duration-300 ${
                formData.shape === s.value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
              }`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Manifesto</label>
          <CharCounter current={formData.description.length} max={DESC_MAX} />
        </div>
        <textarea
          value={formData.description}
          maxLength={DESC_MAX}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value.slice(0, DESC_MAX) }))}
          className={`${inputClass} resize-none`}
          placeholder="O que será dominado neste nível..."
          rows={3}
        />
      </div>

      {!isEditing && initialParentId === undefined && (
        <div>
          <label className={`${labelClass} block mb-2`}>Módulo pai (opcional)</label>
          <select
            value={formData.parentId}
            onChange={(e) => setFormData((prev) => ({ ...prev, parentId: e.target.value }))}
            className={`${inputClass} appearance-none cursor-pointer uppercase text-[10px]`}
          >
            <option value="">Raiz</option>
            {existingSkills.map(skill => (
              <option key={skill.id} value={skill.id}>{skill.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="h-[1px]" style={{ background: 'linear-gradient(to right, transparent, var(--border-subtle), transparent)' }} />

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3.5 border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] hover:border-[var(--border-muted)] transition-all duration-300 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.label.trim()}
          className="flex-1 py-3.5 border border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-input)] hover:border-[var(--text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
        >
          {isLoading ? 'Sincronizando...' : isEditing ? 'Salvar Pawspace' : 'Confirmar'}
        </button>
      </div>
    </form>
  );
}
