'use client';

const inputClass = "w-full bg-white/[0.02] border border-white/[0.08] p-3.5 text-white text-sm outline-none focus:border-[#2dd4bf]/40 transition-colors font-normal placeholder:text-zinc-600 cursor-text";
const labelClass = "text-[9px] text-zinc-500 uppercase font-black tracking-[0.25em] block mb-2.5";

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