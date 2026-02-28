'use client';

const inputClass = "w-full bg-white/[0.02] border border-white/[0.06] p-3.5 text-white text-sm outline-none focus:border-[#c8b89a]/30 transition-colors font-light placeholder:text-zinc-700 cursor-text";
const labelClass = "text-[8px] text-zinc-600 uppercase font-black tracking-[0.25em] block mb-2";

interface NoteFormProps {
  body: string;
  onChange: (body: string) => void;
}

export function NoteForm({ body, onChange }: NoteFormProps) {
  return (
    <div>
      <label className={labelClass}>Conteúdo da Nota *</label>
      <textarea
        value={body}
        onChange={e => onChange(e.target.value)}
        className={`${inputClass} resize-none`}
        placeholder="Escreva suas anotações aqui..."
        rows={5}
      />
    </div>
  );
}