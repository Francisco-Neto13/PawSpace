'use client';
import React, { useState, useEffect } from 'react';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    name: string;
    description?: string;
    icon?: string;
    category: string;
    parentId: string | null;
  }) => Promise<void>;
  existingSkills: { id: string; name: string }[];
  preselectedParentId?: string | null; // undefined = não definido, null = raiz
}

const CATEGORIES = ['Frontend', 'Backend', 'Mobile', 'DevOps', 'SoftSkill', 'keystone'];

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
  const [category, setCategory]       = useState('Frontend');
  const [parentId, setParentId]       = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincroniza pai pré-selecionado ao abrir
  useEffect(() => {
    if (isOpen) {
      setParentId(preselectedParentId ?? '');
      setName('');
      setDescription('');
      setIcon('');
      setCategory('Frontend');
    }
  }, [isOpen, preselectedParentId]);

  if (!isOpen) return null;

  // Se veio do context menu, o pai está fixo
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
      category,
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

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-[#c8b89a] text-[11px] font-black uppercase tracking-[0.5em] mb-2">
            {isRootCreation ? 'Iniciar Nexus' : 'Novo Módulo'}
          </h2>
          <div className="h-px w-12 bg-[#c8b89a]" />
          {/* Mostra o pai quando vem do context menu */}
          {parentName && (
            <div className="mt-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c8b89a]/40" />
              <p className="text-[10px] text-zinc-500">
                Filho de{' '}
                <span className="text-[#c8b89a] font-bold">{parentName}</span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">

          {/* Nome */}
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

          {/* Ícone + Categoria */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <label className={labelClass}>Setor do Nexus</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Descrição */}
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

          {/* Pai — só aparece quando não veio do context menu */}
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

        {/* Actions */}
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