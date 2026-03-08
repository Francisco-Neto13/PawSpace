'use client';

const inputClass = "w-full bg-[var(--bg-surface)] border border-[var(--border-muted)] p-3.5 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--border-visible)] transition-colors font-normal placeholder:text-[var(--text-muted)] cursor-text";
const labelClass = "text-[9px] text-[var(--text-secondary)] uppercase font-black tracking-[0.25em] block mb-2.5";

interface UrlFormProps {
  url: string;
  onChange: (url: string) => void;
}

export function LinkForm({ url, onChange }: UrlFormProps) {
  return (
    <div className="animate-in fade-in duration-300">
      <label className={labelClass}>Endereço URL *</label>
      <input
        type="url"
        value={url}
        onChange={e => onChange(e.target.value)}
        className={inputClass}
        placeholder="https://link-de-referencia.com"
      />
    </div>
  );
}

export function VideoForm({ url, onChange }: UrlFormProps) {
  return (
    <div className="animate-in fade-in duration-300">
      <label className={labelClass}>URL da Mídia de Vídeo *</label>
      <input
        type="url"
        value={url}
        onChange={e => onChange(e.target.value)}
        className={inputClass}
        placeholder="https://www.youtube.com/watch?v=..."
      />
    </div>
  );
}
