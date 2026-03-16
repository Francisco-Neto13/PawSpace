'use client';

const inputClass = 'library-input p-3.5 text-sm font-normal placeholder:text-[var(--text-muted)] cursor-text';
const labelClass = 'text-[9px] text-[var(--text-secondary)] uppercase font-black tracking-[0.25em] block mb-2.5';

interface NoteFormProps {
  body: string;
  onChange: (body: string) => void;
}

export function NoteForm({ body, onChange }: NoteFormProps) {
  return (
    <div>
      <label className={labelClass}>Corpo da Nota *</label>
      <textarea
        value={body}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-y min-h-[120px]`}
        placeholder="Registre aqui o resumo, a aula ou o material dessa trilha..."
        rows={5}
      />
    </div>
  );
}
