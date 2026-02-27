'use client';
import React from 'react';
import { SkillShape } from '../../types';
import { SkillForm } from './SkillForm'; 

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    shape: SkillShape;
    parentId: string | null;
  }) => Promise<void>;
  existingSkills: { id: string; name: string }[];
  preselectedParentId?: string | null;
}

export function AddSkillModal({
  isOpen,
  onClose,
  onAdd,
  existingSkills,
  preselectedParentId,
}: AddSkillModalProps) {
  
  if (!isOpen) return null;

  const isRootCreation = preselectedParentId === null;
  const parentName = preselectedParentId
    ? existingSkills.find(s => s.id === preselectedParentId)?.name
    : null;

  const handleFormSubmit = async (formData: any) => {
    await onAdd({
      name: formData.label,
      description: formData.description,
      icon: formData.icon,
      color: formData.color,
      shape: formData.shape || 'hexagon',
      parentId: preselectedParentId ?? (formData.parentId || null),
    });
    onClose();
  };

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
              <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                Conectando ao nó: <span className="text-[#c8b89a] font-bold">{parentName}</span>
              </p>
            </div>
          )}
        </div>

        <SkillForm 
          onSubmit={handleFormSubmit}
          onCancel={onClose}
          initialParentId={preselectedParentId}
          existingSkills={existingSkills}
        />
        
      </div>
    </div>
  );
}