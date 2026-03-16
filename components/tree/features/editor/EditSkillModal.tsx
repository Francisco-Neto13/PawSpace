'use client';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { SkillForm, type SkillFormData } from './SkillForm';
import { useNexus } from '@/contexts/NexusContext';
import type { SkillData } from '../../types';

interface EditSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (skillId: string, data: Partial<SkillData>) => Promise<void>;
  skillData?: (SkillData & { id: string }) | null;
  existingSkills: { id: string; name: string }[];
}

export function EditSkillModal({
  isOpen,
  onClose,
  onUpdate,
  skillData,
  existingSkills,
}: EditSkillModalProps) {
  const { setNodes } = useNexus();

  if (!isOpen || !skillData || typeof document === 'undefined') return null;

  const handleFormSubmit = async (formData: SkillFormData) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === skillData.id
          ? {
              ...node,
              data: {
                ...node.data,
                ...formData,
                label: formData.label,
                name: formData.label,
              },
            }
          : node
      )
    );

    onClose();

    try {
      await onUpdate(skillData.id, {
        ...formData,
        name: formData.label,
      });
    } catch (error) {
      console.error('Erro ao sincronizar com o servidor:', error);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 isolate">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-200 z-10 pointer-events-auto">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

        <div className="flex flex-col p-6 md:p-7 relative max-h-[90vh] overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="library-kicker mb-1">Trilha do território</p>
                <h2 className="text-[var(--text-primary)] text-lg font-black tracking-tight">Ajustar trilha</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-[var(--border-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-all duration-200 cursor-pointer bg-[var(--bg-elevated)]"
              >
                <X size={13} />
              </button>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-[var(--shimmer-via)] to-transparent" />
          </div>

          <SkillForm
            key={skillData.id}
            onSubmit={handleFormSubmit}
            onCancel={onClose}
            isEditing
            initialData={skillData}
            existingSkills={existingSkills}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
