'use client';
import { useRef } from 'react';
import { Upload } from 'lucide-react';

const inputClass = "w-full bg-white/[0.02] border border-white/[0.08] p-3.5 text-white text-sm outline-none focus:border-[#ffffff]/40 transition-colors font-normal placeholder:text-zinc-600 cursor-text";
const labelClass = "text-[9px] text-zinc-500 uppercase font-black tracking-[0.25em] block mb-2.5";

interface PdfFormProps {
  mode: 'upload' | 'link';
  url: string;
  file: File | null;
  onModeChange: (mode: 'upload' | 'link') => void;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
}

export function PdfForm({ mode, url, file, onModeChange, onUrlChange, onFileChange }: PdfFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(['upload', 'link'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { onModeChange(m); onFileChange(null); onUrlChange(''); }}
            className={`flex-1 py-3 border text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer
              ${mode === m
                ? 'border-[#ffffff]/40 bg-[#ffffff]/[0.08] text-[#ffffff]'
                : 'border-white/[0.04] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1]'
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
            className={`w-full flex flex-col items-center justify-center gap-3 py-8 border border-dashed transition-all duration-300 cursor-pointer
              ${file
                ? 'border-[#ffffff]/40 bg-[#ffffff]/[0.04] text-[#ffffff]'
                : 'border-white/[0.08] text-zinc-500 hover:border-[#ffffff]/20 hover:text-zinc-300'
              }`}
          >
            <Upload size={16} className={file ? 'text-[#ffffff]' : 'text-zinc-600'} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest">
                {file ? file.name : 'Selecionar Documento PDF'}
              </span>
              {file && (
                <span className="text-[9px] text-zinc-500 font-mono">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
            </div>
          </button>
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
