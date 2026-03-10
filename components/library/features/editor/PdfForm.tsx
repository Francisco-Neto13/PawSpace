'use client';
import { useRef } from 'react';
import { Upload } from 'lucide-react';

const inputClass = 'library-input p-3.5 text-sm font-normal placeholder:text-[var(--text-muted)] cursor-text';
const labelClass = 'text-[9px] text-[var(--text-secondary)] uppercase font-black tracking-[0.25em] block mb-2.5';

interface PdfFormProps {
  mode: 'upload' | 'link';
  url: string;
  file: File | null;
  maxFileSizeBytes: number;
  onModeChange: (mode: 'upload' | 'link') => void;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
}

export function PdfForm({ mode, url, file, maxFileSizeBytes, onModeChange, onUrlChange, onFileChange }: PdfFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxMb = Math.floor(maxFileSizeBytes / 1024 / 1024);
  const isOverLimit = !!file && file.size > maxFileSizeBytes;

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(['upload', 'link'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { onModeChange(m); onFileChange(null); onUrlChange(''); }}
            className={`h-10 flex-1 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer
              ${mode === m
                ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-muted)]'
              }`}
          >
            {m === 'upload' ? 'Fazer Upload' : 'Link Externo'}
          </button>
        ))}
      </div>

      {mode === 'upload' ? (
        <div className="animate-in fade-in duration-300">
          <label className={labelClass}>Arquivo PDF *</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => onFileChange(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full flex flex-col items-center justify-center gap-3 py-8 rounded-xl border border-dashed transition-all duration-200 cursor-pointer
              ${isOverLimit
                ? 'border-red-500/70 bg-red-500/10 text-[var(--text-primary)]'
                : file
                ? 'border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                : 'border-[var(--border-muted)] text-[var(--text-secondary)] hover:border-[var(--border-visible)] hover:text-[var(--text-primary)]'
              }`}
          >
            <Upload size={16} className={file ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest">
                {file ? file.name : 'Selecionar Documento PDF'}
              </span>
              {file && (
                <span className="text-[9px] text-[var(--text-secondary)] font-mono">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
            </div>
          </button>
          <p className={`mt-2 text-[9px] font-mono ${isOverLimit ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}>
            {isOverLimit ? `Arquivo acima do limite de ${maxMb} MB.` : `Tamanho maximo: ${maxMb} MB`}
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <label className={labelClass}>URL do Arquivo PDF *</label>
          <input
            type="url"
            value={url}
            onChange={e => onUrlChange(e.target.value)}
            className={inputClass}
            placeholder="https://exemplo.com/arquivo.pdf"
          />
        </div>
      )}
    </div>
  );
}
