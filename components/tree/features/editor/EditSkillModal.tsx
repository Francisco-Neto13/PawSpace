'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, ExternalLink, Link2, FileText, StickyNote, Video } from 'lucide-react';
import { SkillForm } from './SkillForm';
import { AddContentModal } from '@/components/library/features/editor/AddContentModal';
import { useNexus } from '@/contexts/NexusContext';
import { getContentsBySkill, deleteContent } from '@/app/actions/contents'; 

interface Content {
  id: string;
  type: 'link' | 'video' | 'pdf' | 'note' | string;
  title: string;
  url?: string | null;
  body?: string | null;
  createdAt: string | Date; 
}

interface EditSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (skillId: string, data: any) => Promise<void>;
  skillData?: any;
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

const TYPE_ICON: Record<string, React.ReactNode> = {
  link:  <Link2 size={11} />,
  video: <Video size={11} />,
  pdf:   <FileText size={11} />,
  note:  <StickyNote size={11} />,
};

export function EditSkillModal({
  isOpen,
  onClose,
  onUpdate,
  skillData,
  existingSkills,
}: EditSkillModalProps) {
  const { setNodes } = useNexus(); 
  const [showAddContent, setShowAddContent] = useState(false);
  const [contents, setContents] = useState<Content[]>([]);

  useEffect(() => {
    if (skillData?.contents) {
      setContents(skillData.contents);
    }
  }, [skillData]);

  if (!isOpen || !skillData) return null;

  const handleFormSubmit = async (formData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === skillData.id
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                ...formData, 
                label: formData.name || formData.label 
              } 
            }
          : node
      )
    );

    onClose();

    try {
      await onUpdate(skillData.id, formData);
    } catch (error) {
      console.error("Erro ao sincronizar com o servidor:", error);
    }
  };

  const handleContentAdded = async () => {
    const updated = await getContentsBySkill(skillData.id);
    const newContents = updated as Content[];
    setContents(newContents);

    setNodes((nds) =>
      nds.map((node) =>
        node.id === skillData.id
          ? { ...node, data: { ...node.data, contents: newContents } }
          : node
      )
    );
  };

  const handleDeleteContent = async (contentId: string) => {
    const filtered = contents.filter(c => c.id !== contentId);
    setContents(filtered);
    
    setNodes((nds) =>
      nds.map((node) =>
        node.id === skillData.id
          ? { ...node, data: { ...node.data, contents: filtered } }
          : node
      )
    );

    await deleteContent(contentId);
  };

  return (
    <>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer" onClick={onClose} />

        <div
          className="relative w-full max-w-md animate-in zoom-in-95 fade-in duration-300 p-[1.5px] z-10"
          style={{ clipPath: poly, backgroundColor: '#c8b89a33' }}
        >
          <div className="w-full h-full" style={{ clipPath: poly, backgroundColor: '#000' }}>
            <div
              className="flex flex-col p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{
                clipPath: poly,
                backgroundColor: '#080808',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(200,184,154,0.1) transparent',
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                }}
              />

              <div className="relative z-10 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-5 bg-[#c8b89a]" />
                    <div>
                      <p className="text-[8px] text-zinc-600 uppercase tracking-[0.3em] font-black mb-0.5">
                        Configuração de Unidade
                      </p>
                      <h2 className="text-[#c8b89a] text-[13px] font-black uppercase tracking-[0.3em]">
                        Ajustar Protocolo
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center border border-white/10 text-zinc-600 hover:text-zinc-300 hover:border-white/20 transition-all duration-300 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div
                  className="h-[1px] w-full"
                  style={{ background: 'linear-gradient(to right, #c8b89a22, transparent)' }}
                />
              </div>

              <div className="relative z-10">
                <SkillForm
                  onSubmit={handleFormSubmit}
                  onCancel={onClose}
                  isEditing={true}
                  initialData={skillData}
                  existingSkills={existingSkills}
                />
              </div>

              <div className="relative z-10 mt-8">
                <div
                  className="h-[1px] w-full mb-6"
                  style={{ background: 'linear-gradient(to right, transparent, #ffffff08, transparent)' }}
                />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-[#c8b89a]/40" />
                    <div className="flex items-center gap-2 text-zinc-600">
                      <BookOpen size={11} />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em]">
                        Biblioteca
                      </span>
                    </div>
                    <span className="text-[8px] text-zinc-700 font-mono">
                      {contents.length} {contents.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowAddContent(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.06] text-zinc-600 text-[8px] font-black uppercase tracking-widest hover:border-[#c8b89a]/30 hover:text-[#c8b89a] transition-all duration-300 cursor-pointer"
                  >
                    <Plus size={10} />
                    Adicionar
                  </button>
                </div>

                {contents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 border border-dashed border-white/[0.04]">
                    <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">
                      Nenhum conteúdo ainda
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {contents.map(c => (
                      <div
                        key={c.id}
                        className="group flex items-center gap-3 p-3 border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] transition-all duration-300"
                      >
                        <div className="text-zinc-600 shrink-0">
                          {TYPE_ICON[c.type] || <Link2 size={11} />}
                        </div>

                        <p className="flex-1 text-zinc-400 text-[10px] font-medium truncate">
                          {c.title}
                        </p>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
                            >
                              <ExternalLink size={10} />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteContent(c.id)}
                            className="w-6 h-6 flex items-center justify-center text-zinc-700 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddContentModal
        isOpen={showAddContent}
        onClose={() => setShowAddContent(false)}
        onSuccess={handleContentAdded}
        skillId={skillData.id}
      />
    </>
  );
}