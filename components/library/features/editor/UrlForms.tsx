'use client';

const inputClass = 'library-input p-3.5 text-sm font-normal placeholder:text-[var(--text-muted)] cursor-text';
const labelClass = 'text-[9px] text-[var(--text-secondary)] uppercase font-black tracking-[0.25em] block mb-2.5';

interface UrlFormProps {
  url: string;
  onChange: (url: string) => void;
}

export function LinkForm({ url, onChange }: UrlFormProps) {
  return (
    <div className="animate-in fade-in duration-300">
      <label className={labelClass}>Link de Referencia *</label>
      <input
        type="url"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder="https://material-de-apoio.com"
      />
    </div>
  );
}

export function VideoForm({ url, onChange }: UrlFormProps) {
  return (
    <div className="animate-in fade-in duration-300">
      <label className={labelClass}>Link do Video *</label>
      <input
        type="url"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder="https://www.youtube.com/watch?v=..."
      />
    </div>
  );
}
