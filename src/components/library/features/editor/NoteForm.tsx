'use client';

const inputClass = 'library-input field-input p-3.5 placeholder:text-[var(--text-muted)] cursor-text';
const labelClass = 'field-label block mb-2.5';

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
