'use client';
import { useState } from 'react';
import { Link2, Video, FileText, StickyNote, X } from 'lucide-react';
import { addContent, uploadPdf } from '@/app/actions/library';
import { ContentType } from '../../types';
import { LinkForm, VideoForm } from './UrlForms';
import { PdfForm } from './PdfForm';
import { NoteForm } from './NoteForm';

const TABS: { type: ContentType; label: string; icon: React.ReactNode }[] = [
  { type: 'link',  label: 'Link',   icon: <Link2 size={13} />      },
  { type: 'video', label: 'Vídeo',  icon: <Video size={13} />      },
  { type: 'pdf',   label: 'PDF',    icon: <FileText size={13} />   },
  { type: 'note',  label: 'Nota',   icon: <StickyNote size={13} /> },
];

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

const labelClass = "text-[9px] text-zinc-500 uppercase font-black tracking-[0.25em] block mb-2.5";
const inputClass = "w-full bg-white/[0.02] border border-white/[0.08] p-3.5 text-white text-sm outline-none focus:border-[#c8b89a]/40 transition-colors font-normal placeholder:text-zinc-600 cursor-text";

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  skillId: string;
}

export function AddContentModal({
  isOpen,
  onClose,
  onSuccess,
  skillId,
}: AddContentModalProps) {
  const [activeTab, setActiveTab] = useState<ContentType>('link');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfMode, setPdfMode] = useState<'upload' | 'link'>('upload');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title: '', url: '', body: '' });

  const reset = () => {
    setForm({ title: '', url: '', body: '' });
    setPdfFile(null);
    setPdfMode('upload');
    setActiveTab('link');
  };

  const handleClose = () => { reset(); onClose(); };

  const isValid = () => {
    if (!form.title.trim()) return false;
    if (activeTab === 'link' || activeTab === 'video') return !!form.url.trim();
    if (activeTab === 'pdf') return pdfMode === 'upload' ? !!pdfFile : !!form.url.trim();
    if (activeTab === 'note') return !!form.body.trim();
    return false;
  };

  const handleSubmit = async () => {
    if (!isValid() || isLoading) return;
    setIsLoading(true);

    try {
      let payload: any = { 
        skillId, 
        type: activeTab, 
        title: form.title.trim() 
      };

      if (activeTab === 'link' || activeTab === 'video') {
        payload.url = form.url.trim();
      }

      if (activeTab === 'pdf') {
        if (pdfMode === 'upload' && pdfFile) {
          const fd = new FormData();
          fd.append('file', pdfFile);
          const upload = await uploadPdf(fd); 
          if (!upload.success) throw new Error('Falha no upload');
          payload.url = upload.publicUrl;
          payload.fileKey = upload.fileKey;
        } else {
          payload.url = form.url.trim();
        }
      }

      if (activeTab === 'note') {
        payload.body = form.body.trim();
      }

      const result = await addContent(payload);
      if (!result.success) throw new Error('Falha ao salvar');

      onSuccess();
      handleClose();
    } catch (err) {
      console.error('❌ [AddContentModal] Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer" onClick={handleClose} />

      <div
        className="relative w-full max-w-md animate-in zoom-in-95 fade-in duration-300 p-[1.5px] z-10"
        style={{ clipPath: poly, backgroundColor: '#c8b89a33' }}
      >
        <div className="w-full h-full" style={{ clipPath: poly, backgroundColor: '#000' }}>
          <div
            className="flex flex-col p-8 relative overflow-hidden"
            style={{ clipPath: poly, backgroundColor: '#080808' }}
          >
            <div
              className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }}
            />

            <div className="relative z-10 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 bg-[#c8b89a]" />
                  <div>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-black mb-0.5">
                      Repositório de Conhecimento
                    </p>
                    <h2 className="text-[#c8b89a] text-[13px] font-black uppercase tracking-[0.3em]">
                      Adicionar Conteúdo
                    </h2>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-7 h-7 flex items-center justify-center border border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-all duration-300 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="h-[1px] w-full" style={{ background: 'linear-gradient(to right, #c8b89a22, transparent)' }} />
            </div>

            <div className="relative z-10 grid grid-cols-4 gap-1.5 mb-6">
              {TABS.map(tab => (
                <button
                  key={tab.type}
                  onClick={() => {
                    setActiveTab(tab.type);
                    setForm({ title: '', url: '', body: '' });
                    setPdfFile(null);
                  }}
                  className={`flex flex-col items-center gap-2 py-3.5 border text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer
                    ${activeTab === tab.type
                      ? 'border-[#c8b89a]/40 bg-[#c8b89a]/[0.06] text-[#c8b89a]'
                      : 'border-white/[0.04] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                    }`}
                >
                  <div className={activeTab === tab.type ? 'text-[#c8b89a]' : 'text-zinc-500'}>
                    {tab.icon}
                  </div>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative z-10 space-y-6">
              <div>
                <label className={labelClass}>Título Identificador *</label>
                <input
                  autoFocus
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                  placeholder={
                    activeTab === 'link'  ? 'Ex: Documentação oficial'   :
                    activeTab === 'video' ? 'Ex: Aula completa de React' :
                    activeTab === 'pdf'   ? 'Ex: Clean Code — Resumo'    :
                    'Ex: Anotações sobre Generics'
                  }
                />
              </div>

              <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                {activeTab === 'link'  && <LinkForm  url={form.url} onChange={url => setForm({ ...form, url })} />}
                {activeTab === 'video' && <VideoForm url={form.url} onChange={url => setForm({ ...form, url })} />}
                {activeTab === 'pdf'   && (
                  <PdfForm
                    mode={pdfMode}
                    url={form.url}
                    file={pdfFile}
                    onModeChange={setPdfMode}
                    onUrlChange={url => setForm({ ...form, url })}
                    onFileChange={setPdfFile}
                  />
                )}
                {activeTab === 'note'  && <NoteForm body={form.body} onChange={body => setForm({ ...form, body })} />}
              </div>
            </div>

            <div
              className="relative z-10 h-[1px] my-8"
              style={{ background: 'linear-gradient(to right, transparent, #ffffff08, transparent)' }}
            />

            <div className="relative z-10 flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-4 border border-white/[0.06] text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.02] hover:text-zinc-300 hover:border-white/20 transition-all duration-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid() || isLoading}
                className="flex-1 py-4 border border-[#c8b89a]/30 bg-[#c8b89a]/[0.06] text-[#c8b89a] text-[10px] font-black uppercase tracking-widest hover:bg-[#c8b89a]/10 hover:border-[#c8b89a]/50 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
              >
                {isLoading ? 'Sincronizando...' : 'Confirmar Registro'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}