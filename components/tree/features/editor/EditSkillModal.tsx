'use client';
import { createPortal } from 'react-dom';
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

const poly = `polygon(
  10px 0,
  calc(100% - 10px) 0,
  100% 10px,
  100% calc(100% - 14px),
  calc(100% - 10px) 100%,
  calc(50% + 12px) 100%,
  50% calc(100% - 10px),
  calc(50% - 12px) 100%,
  10px 100%,
  0 calc(100% - 14px),
  0 10px
)`;

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
    setNodes((nds) =>
      nds.map((node) =>
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
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-md animate-in zoom-in-95 fade-in duration-300 p-[1.5px] z-10 pointer-events-auto"
        style={{ clipPath: poly, backgroundColor: 'var(--border-muted)' }}
      >
        <div className="w-full h-full" style={{ clipPath: poly, backgroundColor: 'var(--bg-base)' }}>
          <div
            className="flex flex-col p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{
              clipPath: poly,
              backgroundColor: 'var(--bg-strong)',
              scrollbarWidth: 'none',
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--grid-line) 2px, var(--grid-line) 4px)',
              }}
            />

            <div className="relative z-10 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 bg-[var(--text-primary)]" />
                  <div>
                    <p className="text-[8px] text-[var(--text-secondary)] uppercase tracking-[0.3em] font-black mb-0.5">
                      Configuração de Módulo
                    </p>
                    <h2 className="text-[var(--text-primary)] text-[13px] font-black uppercase tracking-[0.3em]">
                      Ajustar Módulo
                    </h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center border border-[var(--border-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-all duration-300 text-xs cursor-pointer bg-[var(--bg-elevated)]"
                >
                  ✕
                </button>
              </div>
              <div
                className="h-[1px] w-full"
                style={{ background: 'linear-gradient(to right, var(--shimmer-via), transparent)' }}
              />
            </div>

            <div className="relative z-10 pointer-events-auto">
              <SkillForm
                key={skillData.id}
                onSubmit={handleFormSubmit}
                onCancel={onClose}
                isEditing={true}
                initialData={skillData}
                existingSkills={existingSkills}
              />
            </div>

            <div className="mt-8 flex justify-center gap-3 opacity-20 relative z-10">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rotate-45 border border-[var(--border-muted)]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
