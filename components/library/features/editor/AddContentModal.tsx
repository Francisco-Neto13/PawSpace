'use client';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link2, Video, FileText, StickyNote, X } from 'lucide-react';
import { addContent, uploadPdf } from '@/app/actions/library';
import type { ContentInput } from '@/app/actions/library/types';
import { ContentType } from '../../types';
import { LinkForm, VideoForm } from './UrlForms';
import { PdfForm } from './PdfForm';
import { NoteForm } from './NoteForm';
import { LIMITS } from '@/lib/limits';

const TITLE_MAX = LIMITS.library.title;
const URL_MAX = LIMITS.library.url;
const BODY_MAX = LIMITS.library.body;
const PDF_MAX_BYTES = LIMITS.library.pdfMaxBytes;
const PDF_MAX_MB = Math.floor(PDF_MAX_BYTES / 1024 / 1024);

const TABS: { type: ContentType; label: string; icon: React.ReactNode }[] = [
  { type: 'link',  label: 'Link',   icon: <Link2 size={13} />      },
  { type: 'video', label: 'Vídeo',  icon: <Video size={13} />      },
  { type: 'pdf',   label: 'PDF',    icon: <FileText size={13} />   },
  { type: 'note',  label: 'Nota',   icon: <StickyNote size={13} /> },
];

const labelClass = 'text-[9px] text-[var(--text-secondary)] uppercase font-black tracking-[0.25em] block mb-2.5';
const inputClass = 'library-input p-3.5 text-sm font-normal placeholder:text-[var(--text-muted)] cursor-text';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdContent?: unknown) => void;
  onOptimisticCreate?: (tempContent: unknown) => void;
  onOptimisticResolve?: (tempId: string, createdContent?: unknown) => void;
  onOptimisticRollback?: (tempId: string) => void;
  skillId: string;
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const remaining = max - current;
  const warn = current >= max * 0.8;
  if (!warn) return null;
  return (
    <span className={`text-[9px] font-mono font-bold tabular-nums ${remaining <= 10 ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
      {remaining}
    </span>
  );
}

export function AddContentModal({
  isOpen,
  onClose,
  onSuccess,
  onOptimisticCreate,
  onOptimisticResolve,
  onOptimisticRollback,
  skillId,
}: AddContentModalProps) {
  const [activeTab, setActiveTab] = useState<ContentType>('link');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfMode, setPdfMode] = useState<'upload' | 'link'>('upload');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', url: '', body: '' });

  const reset = () => {
    setForm({ title: '', url: '', body: '' });
    setPdfFile(null);
    setPdfMode('upload');
    setActiveTab('link');
    setSubmitError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const isValid = () => {
    if (!form.title.trim()) return false;
    if (activeTab === 'link' || activeTab === 'video') return !!form.url.trim();
    if (activeTab === 'pdf') {
      if (pdfMode !== 'upload') return !!form.url.trim();
      if (!pdfFile) return false;
      const isPdf = pdfFile.type === 'application/pdf' || pdfFile.name.toLowerCase().endsWith('.pdf');
      return isPdf && pdfFile.size <= PDF_MAX_BYTES;
    }
    if (activeTab === 'note') return !!form.body.trim();
    return false;
  };

  const handleSubmit = async () => {
    if (!isValid() || isLoading) return;
    setSubmitError(null);
    const isPdfUpload = activeTab === 'pdf' && pdfMode === 'upload';
    const useOptimistic = !isPdfUpload;
    let tempId: string | null = null;
    if (!useOptimistic) setIsLoading(true);

    try {
      const payload: ContentInput = { skillId, type: activeTab, title: form.title.trim() };

      if (useOptimistic) {
        tempId = `temp-content-${Date.now()}`;
        const optimisticContent = {
          id: tempId,
          skillId,
          type: activeTab,
          title: form.title.trim(),
          url: form.url.trim() || null,
          body: form.body.trim() || null,
          fileKey: null,
          createdAt: new Date().toISOString(),
        };
        onOptimisticCreate?.(optimisticContent);
        handleClose();
      }

      if (activeTab === 'link' || activeTab === 'video') payload.url = form.url.trim();

      if (activeTab === 'pdf') {
        if (pdfMode === 'upload' && pdfFile) {
          const isPdf = pdfFile.type === 'application/pdf' || pdfFile.name.toLowerCase().endsWith('.pdf');
          if (!isPdf) {
            setSubmitError('Apenas arquivos PDF sao permitidos.');
            if (!useOptimistic) setIsLoading(false);
            return;
          }
          if (pdfFile.size > PDF_MAX_BYTES) {
            setSubmitError(`Arquivo excede o limite de ${PDF_MAX_MB} MB.`);
            if (!useOptimistic) setIsLoading(false);
            return;
          }

          const fd = new FormData();
          fd.append('file', pdfFile);
          const upload = await uploadPdf(fd);
          if (!upload.success) {
            setSubmitError(upload.error || 'Falha no upload de PDF.');
            if (!useOptimistic) setIsLoading(false);
            return;
          }
          payload.url     = upload.publicUrl;
          payload.fileKey = upload.fileKey;
        } else {
          payload.url = form.url.trim();
        }
      }

      if (activeTab === 'note') payload.body = form.body.trim();

      const result = await addContent(payload);
      if (!result.success) {
        setSubmitError('Falha ao guardar o material na estante.');
        if (tempId) onOptimisticRollback?.(tempId);
        return;
      }

      if (tempId) {
        onOptimisticResolve?.(tempId, result.content);
      } else {
        onSuccess(result.content);
        handleClose();
      }
    } catch (err) {
      console.error('❌ [AddContentModal] Erro:', err);
      setSubmitError('Erro inesperado ao guardar o material.');
      if (tempId) {
        onOptimisticRollback?.(tempId);
      }
    } finally {
      if (!useOptimistic) setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-strong)] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
        <div className="relative p-6 md:p-7">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <p className="library-kicker mb-1">Estante da Patinha</p>
                <h2 className="text-[var(--text-primary)] text-lg font-black tracking-tight">Adicionar material</h2>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-all duration-200 cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-[var(--border-subtle)] to-transparent" />
          </div>

          <div className="grid grid-cols-4 gap-1.5 mb-6">
            {TABS.map(tab => (
              <button
                key={tab.type}
                onClick={() => { setActiveTab(tab.type); setForm({ title: '', url: '', body: '' }); setPdfFile(null); setSubmitError(null); }}
                className={`h-[58px] rounded-xl border flex flex-col items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer
                  ${activeTab === tab.type
                    ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                  }`}
              >
                <div className={activeTab === tab.type ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}>{tab.icon}</div>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-[9px] text-[var(--text-secondary)] uppercase font-black tracking-[0.25em]">
                  Título Identificador *
                </label>
                <CharCounter current={form.title.length} max={TITLE_MAX} />
              </div>
              <input
                autoFocus
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value.slice(0, TITLE_MAX) })}
                maxLength={TITLE_MAX}
                className={inputClass}
                placeholder={
                  activeTab === 'link'  ? 'Ex: Documentação oficial'   :
                  activeTab === 'video' ? 'Ex: Aula completa de React' :
                  activeTab === 'pdf'   ? 'Ex: Clean Code - Resumo'    :
                  'Ex: Rascunho sobre generics'
                }
              />
            </div>

            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              {activeTab === 'link' && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className={labelClass.replace('mb-2.5', '')}>URL *</label>
                    <CharCounter current={form.url.length} max={URL_MAX} />
                  </div>
                  <LinkForm url={form.url} onChange={url => setForm({ ...form, url: url.slice(0, URL_MAX) })} />
                </div>
              )}
              {activeTab === 'video' && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className={labelClass.replace('mb-2.5', '')}>URL *</label>
                    <CharCounter current={form.url.length} max={URL_MAX} />
                  </div>
                  <VideoForm url={form.url} onChange={url => setForm({ ...form, url: url.slice(0, URL_MAX) })} />
                </div>
              )}
              {activeTab === 'pdf' && (
                <PdfForm
                  mode={pdfMode}
                  url={form.url}
                  file={pdfFile}
                  maxFileSizeBytes={PDF_MAX_BYTES}
                  onModeChange={mode => { setPdfMode(mode); setSubmitError(null); }}
                  onUrlChange={url => { setForm({ ...form, url: url.slice(0, URL_MAX) }); setSubmitError(null); }}
                  onFileChange={file => { setPdfFile(file); setSubmitError(null); }}
                />
              )}
              {activeTab === 'note' && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className={labelClass.replace('mb-2.5', '')}>Material *</label>
                    <CharCounter current={form.body.length} max={BODY_MAX} />
                  </div>
                  <NoteForm body={form.body} onChange={body => setForm({ ...form, body: body.slice(0, BODY_MAX) })} />
                </div>
              )}
            </div>
          </div>

          {submitError && (
            <p className="mt-4 text-[10px] font-medium text-red-400">{submitError}</p>
          )}

          <div className="h-[1px] my-6 bg-gradient-to-r from-transparent via-[var(--border-subtle)] to-transparent" />

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="h-11 flex-1 border border-[var(--border-subtle)] rounded-xl text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-all duration-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid() || isLoading}
              className="h-11 flex-1 border border-[var(--border-visible)] rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-input)] hover:border-[var(--text-secondary)] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              {isLoading ? 'Sincronizando...' : 'Guardar na estante'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

