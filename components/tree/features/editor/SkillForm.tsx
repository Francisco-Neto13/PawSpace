'use client';
import { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import { EmojiPicker } from './EmojiPicker';
import { SkillCategory, SkillShape } from '../../types';

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
}

export function SkillForm({
  onSubmit,
  onCancel,
  isLoading,
  initialParentId,
  existingSkills,
}: SkillFormProps) {
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    category: 'core' as SkillCategory,
    icon: '✦',
    color: '#3b82f6',
    shape: 'hexagon' as SkillShape,
    parentId: initialParentId ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) return;
    onSubmit(formData);
  };

  const labelClass = "text-[8px] text-zinc-600 uppercase font-black tracking-[0.25em] block mb-2";
  const inputClass = "w-full bg-white/[0.02] border border-white/[0.06] p-3.5 text-white text-sm outline-none focus:border-[#c8b89a]/30 transition-colors font-light placeholder:text-zinc-700 cursor-text";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div>
        <label className={labelClass}>Identificação *</label>
        <input
          autoFocus
          type="text"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          className={inputClass}
          placeholder="Ex: TypeScript Avançado"
        />
      </div>

      <div>
        <label className={labelClass}>Identidade Visual</label>
        <div className="grid grid-cols-2 gap-3">
          <EmojiPicker
            currentEmoji={formData.icon}
            onSelect={(emoji) => setFormData({ ...formData, icon: emoji })}
          />
          <ColorPicker
            value={formData.color}
            onChange={(color) => setFormData({ ...formData, color })}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Arquitetura do Nó</label>
        <div className="grid grid-cols-4 gap-2">
          {SHAPES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setFormData({ ...formData, shape: s.value })}
              className={`group flex flex-col items-center gap-2.5 p-3 border transition-all duration-300 cursor-pointer ${
                formData.shape === s.value
                  ? 'border-[#c8b89a]/40 bg-[#c8b89a]/[0.06]'
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
              <span
                className={`text-[7px] font-black uppercase tracking-wider transition-colors duration-300 ${
                  formData.shape === s.value ? 'text-[#c8b89a]' : 'text-zinc-600 group-hover:text-zinc-500'
                }`}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Manifesto</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`${inputClass} resize-none`}
          placeholder="O que será dominado neste nível..."
          rows={3}
        />
      </div>

      {initialParentId === undefined && (
        <div>
          <label className={labelClass}>Requisito de Desbloqueio</label>
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

      <div
        className="h-[1px]"
        style={{ background: 'linear-gradient(to right, transparent, #ffffff08, transparent)' }}
      />

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3.5 border border-white/[0.06] text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.02] hover:text-zinc-400 hover:border-white/10 transition-all duration-300 cursor-pointer"
        >
          Abortar
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.label.trim()}
          className="flex-1 py-3.5 border border-[#c8b89a]/30 bg-[#c8b89a]/[0.06] text-[#c8b89a] text-[10px] font-black uppercase tracking-widest hover:bg-[#c8b89a]/10 hover:border-[#c8b89a]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
        >
          {isLoading ? 'Sincronizando...' : 'Confirmar'}
        </button>
      </div>

    </form>
  );
}