'use client';

const inputClass = "w-full bg-[var(--bg-surface)] border border-[var(--border-muted)] p-3.5 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--border-visible)] transition-colors font-normal placeholder:text-[var(--text-muted)] cursor-text";
const labelClass = "text-[9px] text-[var(--text-secondary)] uppercase font-black tracking-[0.25em] block mb-2.5";

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
