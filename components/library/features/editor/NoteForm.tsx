'use client';

const inputClass = "w-full bg-white/[0.02] border border-white/[0.08] p-3.5 text-white text-sm outline-none focus:border-[#ffffff]/40 transition-colors font-normal placeholder:text-zinc-600 cursor-text";
const labelClass = "text-[9px] text-zinc-500 uppercase font-black tracking-[0.25em] block mb-2.5";

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
        className={`${inputClass} resize-none min-h-[120px]`}
        placeholder="Escreva suas anotações detalhadas aqui..."
        rows={5}
      />
    </div>
  );
}
