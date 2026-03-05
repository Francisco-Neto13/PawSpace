'use client';
import { useState, useEffect } from 'react';
import { ColorPicker } from './ColorPicker';
import { EmojiPicker } from './EmojiPicker';
import { SkillShape } from '../../types';
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
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialParentId?: string | null;
  existingSkills: { id: string; name: string }[];
  initialData?: any;
  isEditing?: boolean;
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const remaining = max - current;
  if (current < max * 0.8) return null;
  return (
    <span className={`text-[9px] font-mono font-bold tabular-nums ${remaining <= 5 ? 'text-red-400' : 'text-zinc-500'}`}>
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
  const [formData, setFormData] = useState({
    label:       '',
    description: '',
    icon:        '✦',
    color:       '#3b82f6',
    shape:       'hexagon' as SkillShape,
    parentId:    initialParentId ?? '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        label:       initialData.label || initialData.name || '',
        description: initialData.description || '',
        icon:        initialData.icon || '✦',
        color:       initialData.color || '#3b82f6',
        shape:       (initialData.shape as SkillShape) || 'hexagon',
        parentId:    initialData.parentId || initialParentId || '',
      });
    }
  }, [initialData, initialParentId]);

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

  const labelClass = "text-[8px] text-zinc-600 uppercase font-black tracking-[0.25em]";
  const inputClass = "w-full bg-white/[0.02] border border-white/[0.06] p-3.5 text-white text-sm outline-none focus:border-[#2dd4bf]/30 transition-colors font-light placeholder:text-zinc-700 cursor-text";

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
            setFormData({ ...formData, label });
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
              setFormData({ ...formData, icon });
              emitPreview({ icon });
            }}
          />
          <ColorPicker
            value={formData.color}
            onChange={(color) => {
              setFormData({ ...formData, color });
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
              onClick={() => setFormData({ ...formData, shape: s.value })}
              className={`group flex flex-col items-center gap-2.5 p-3 border transition-all duration-300 cursor-pointer ${
                formData.shape === s.value
                  ? 'border-[#2dd4bf]/40 bg-[#2dd4bf]/[0.06]'
                  : 'border-white/[0.04] bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03]'
              }`}
            >
              <div
                className="w-5 h-5 transition-colors duration-300"
                style={{
                  clipPath: s.preview,
                  backgroundColor: formData.shape === s.value ? formData.color : '#3f3f46',
                }}
              />
              <span className={`text-[7px] font-black uppercase tracking-wider transition-colors duration-300 ${
                formData.shape === s.value ? 'text-[#2dd4bf]' : 'text-zinc-600 group-hover:text-zinc-500'
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
          onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, DESC_MAX) })}
          className={`${inputClass} resize-none`}
          placeholder="O que será dominado neste nível..."
          rows={3}
        />
      </div>

      {!isEditing && initialParentId === undefined && (
        <div>
          <label className={`${labelClass} block mb-2`}>Modulo pai (opcional)</label>
          <select
            value={formData.parentId}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
            className={`${inputClass} appearance-none cursor-pointer uppercase text-[10px]`}
          >
            <option value="">Raiz (Protocolo Primário)</option>
            {existingSkills.map(skill => (
              <option key={skill.id} value={skill.id}>{skill.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="h-[1px]" style={{ background: 'linear-gradient(to right, transparent, #ffffff08, transparent)' }} />

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3.5 border border-white/[0.06] text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.02] hover:text-zinc-400 hover:border-white/10 transition-all duration-300 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.label.trim()}
          className="flex-1 py-3.5 border border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.06] text-[#2dd4bf] text-[10px] font-black uppercase tracking-widest hover:bg-[#2dd4bf]/10 hover:border-[#2dd4bf]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
        >
          {isLoading ? 'Sincronizando...' : isEditing ? 'Salvar Nexus' : 'Confirmar'}
        </button>
      </div>
    </form>
  );
}
