'use client';
import { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import { EmojiPicker } from './EmojiPicker';
import { SkillCategory, SkillShape } from '../../types';

const SHAPES: { value: SkillShape; label: string; preview: string }[] = [
  { value: 'hexagon', label: 'Hexágono', preview: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)' },
  { value: 'circle', label: 'Círculo', preview: 'circle(50% at 50% 50%)' },
  { value: 'square', label: 'Quadrado', preview: 'inset(0% round 4px)' },
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
  existingSkills 
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

  const labelClass = "text-[9px] text-zinc-500 uppercase font-black tracking-widest block mb-2";
  const inputClass = "w-full bg-white/[0.03] border border-white/10 p-4 text-white text-sm outline-none focus:border-[#c8b89a]/40 transition-colors font-light";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 flex flex-col h-full">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Identificação da Tech *</label>
          <input
            autoFocus
            type="text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            className={inputClass}
            placeholder="Ex: TypeScript Avançado"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <EmojiPicker 
            currentEmoji={formData.icon} 
            onSelect={(emoji) => setFormData({ ...formData, icon: emoji })} 
          />
          <ColorPicker 
            value={formData.color} 
            onChange={(color) => setFormData({ ...formData, color })} 
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Arquitetura do Nó</label>
          <div className="grid grid-cols-4 gap-2">
            {SHAPES.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setFormData({ ...formData, shape: s.value })}
                className={`flex flex-col items-center gap-2 p-2 border transition-all ${
                  formData.shape === s.value 
                    ? 'border-[#c8b89a] bg-[#c8b89a]/10' 
                    : 'border-white/5 bg-white/[0.01]'
                }`}
              >
                <div 
                  className="w-6 h-6" 
                  style={{ 
                    clipPath: s.preview, 
                    backgroundColor: formData.shape === s.value ? formData.color : '#3f3f46' 
                  }} 
                />
                <span className="text-[7px] font-bold uppercase tracking-tighter">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Manifesto (Descrição)</label>
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
      </div>

      <div className="mt-6 flex gap-3">
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 py-3 border border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.02]"
        >
          Abortar
        </button>
        <button 
          type="submit" 
          disabled={isLoading || !formData.label.trim()} 
          className="flex-1 py-3 bg-[#c8b89a] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 font-bold"
        >
          {isLoading ? 'Sincronizando...' : 'Confirmar'}
        </button>
      </div>
    </form>
  );
}