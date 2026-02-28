'use client';

const inputClass = "w-full bg-white/[0.02] border border-white/[0.06] p-3.5 text-white text-sm outline-none focus:border-[#c8b89a]/30 transition-colors font-light placeholder:text-zinc-700 cursor-text";
const labelClass = "text-[8px] text-zinc-600 uppercase font-black tracking-[0.25em] block mb-2";

interface UrlFormProps {
  url: string;
  onChange: (url: string) => void;
}

export function LinkForm({ url, onChange }: UrlFormProps) {
  return (
    <div>
      <label className={labelClass}>URL *</label>
      <input
        type="url"
        value={url}
        onChange={e => onChange(e.target.value)}
        className={inputClass}
        placeholder="https://..."
      />
    </div>
  );
}

export function VideoForm({ url, onChange }: UrlFormProps) {
  return (
    <div>
      <label className={labelClass}>URL do Vídeo *</label>
      <input
        type="url"
        value={url}
        onChange={e => onChange(e.target.value)}
        className={inputClass}
        placeholder="https://youtube.com/watch?v=..."
      />
    </div>
  );
}