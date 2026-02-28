'use client';
import { useRef } from 'react';
import { Upload } from 'lucide-react';

const inputClass = "w-full bg-white/[0.02] border border-white/[0.06] p-3.5 text-white text-sm outline-none focus:border-[#c8b89a]/30 transition-colors font-light placeholder:text-zinc-700 cursor-text";
const labelClass = "text-[8px] text-zinc-600 uppercase font-black tracking-[0.25em] block mb-2";

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
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['upload', 'link'] as const).map(m => (
          <button
            key={m}
            onClick={() => { onModeChange(m); onFileChange(null); onUrlChange(''); }}
            className={`flex-1 py-2.5 border text-[8px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer
              ${mode === m
                ? 'border-[#c8b89a]/40 bg-[#c8b89a]/[0.06] text-[#c8b89a]'
                : 'border-white/[0.04] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.08]'
              }`}
          >
            {m === 'upload' ? 'Fazer Upload' : 'Link Externo'}
          </button>
        ))}
      </div>

      {mode === 'upload' ? (
        <div>
          <label className={labelClass}>Arquivo PDF *</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => onFileChange(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-full flex items-center justify-center gap-3 py-5 border border-dashed transition-all duration-300 cursor-pointer
              ${file
                ? 'border-[#c8b89a]/40 bg-[#c8b89a]/[0.04] text-[#c8b89a]'
                : 'border-white/[0.06] text-zinc-600 hover:border-white/[0.12] hover:text-zinc-400'
              }`}
          >
            <Upload size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">
              {file ? file.name : 'Selecionar arquivo PDF'}
            </span>
            {file && (
              <span className="text-[8px] text-zinc-600 font-mono">
                {(file.size / 1024 / 1024).toFixed(1)}mb
              </span>
            )}
          </button>
        </div>
      ) : (
        <div>
          <label className={labelClass}>URL do PDF *</label>
          <input
            type="url"
            value={url}
            onChange={e => onUrlChange(e.target.value)}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
      )}
    </div>
  );
}