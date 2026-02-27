'use client';
import React, { useState, useEffect } from 'react';
import { SkillShape } from '../types';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    name: string;
    description?: string;
    icon?: string;
    shape: SkillShape;
    parentId: string | null;
  }) => Promise<void>;
  existingSkills: { id: string; name: string }[];
  preselectedParentId?: string | null;
}

const SHAPES: { value: SkillShape; label: string; preview: string }[] = [
  {
    value: 'hexagon',
    label: 'Hexágono',
    preview: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
  },
  {
    value: 'circle',
    label: 'Círculo',
    preview: 'circle(50% at 50% 50%)',
  },
  {
    value: 'square',
    label: 'Quadrado',
    preview: 'inset(0% round 4px)',
  },
  {
    value: 'diamond',
    label: 'Diamante',
    preview: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  },
];

export function AddSkillModal({
  isOpen,
  onClose,
  onAdd,
  existingSkills,
  preselectedParentId,
}: AddSkillModalProps) {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon]               = useState('');
  const [shape, setShape]             = useState<SkillShape>('hexagon');
  const [parentId, setParentId]       = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setParentId(preselectedParentId ?? '');
      setName('');
      setDescription('');
      setIcon('');
      setShape('hexagon');
    }
  }, [isOpen, preselectedParentId]);

  if (!isOpen) return null;

  const isParentLocked = preselectedParentId !== undefined;
  const isRootCreation = preselectedParentId === null;
  const parentName = preselectedParentId
    ? existingSkills.find(s => s.id === preselectedParentId)?.name
    : null;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    await onAdd({
      name: name.trim(),
      description: description.trim() || undefined,
      icon: icon.trim() || undefined,
      shape,
      parentId: parentId === '' ? null : parentId,
    });
    setIsSubmitting(false);
    onClose();
  };

  const inputClass = "w-full bg-white/[0.03] border border-white/10 p-4 text-white text-sm outline-none focus:border-[#c8b89a]/40 transition-colors font-light";
  const labelClass = "text-[9px] text-zinc-500 uppercase font-black tracking-widest";

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#0a0a0b] border border-[#c8b89a]/20 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">

        <div className="mb-8">
          <h2 className="text-[#c8b89a] text-[11px] font-black uppercase tracking-[0.5em] mb-2">
            {isRootCreation ? 'Iniciar Nexus' : 'Novo Módulo'}
          </h2>
          <div className="h-px w-12 bg-[#c8b89a]" />
          {parentName && (
            <div className="mt-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c8b89a]/40" />
              <p className="text-[10px] text-zinc-500">
                Filho de <span className="text-[#c8b89a] font-bold">{parentName}</span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">

          <div className="space-y-2">
            <label className={labelClass}>Identificação da Tech *</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Ex: TypeScript Avançado"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Ícone (emoji)</label>
            <input
              type="text"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              placeholder="⚡"
              className={inputClass}
              maxLength={4}
            />
          </div>

          {!isRootCreation && (
            <div className="space-y-3">
              <label className={labelClass}>Formato do Nó</label>
              <div className="grid grid-cols-4 gap-3">
                {SHAPES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setShape(s.value)}
                    className={`flex flex-col items-center gap-2 p-3 border transition-all ${
                      shape === s.value
                        ? 'border-[#c8b89a] bg-[#c8b89a]/10'
                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 transition-colors"
                      style={{
                        clipPath: s.preview,
                        backgroundColor: shape === s.value ? '#c8b89a' : '#3a3a45',
                      }}
                    />
                    <span className={`text-[8px] font-black uppercase tracking-wider ${
                      shape === s.value ? 'text-[#c8b89a]' : 'text-zinc-600'
                    }`}>
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className={labelClass}>Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="O que você vai aprender com este módulo..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {!isParentLocked && (
            <div className="space-y-2">
              <label className={labelClass}>Requisito de Desbloqueio</label>
              <select
                value={parentId}
                onChange={e => setParentId(e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Raiz (Sem Dependência)</option>
                {existingSkills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.02] transition-all"
          >
            Abortar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="flex-1 px-4 py-3 bg-[#c8b89a] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(200,184,154,0.2)]"
          >
            {isSubmitting ? 'Injetando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}