'use client';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const QUICK_SWATCHES = [
  '#ffffff',
  '#22d3ee',
  '#34d399',
  '#60a5fa',
  '#f59e0b',
  '#f87171',
];

function normalizeHexColor(color: string | null | undefined): string {
  const candidate = (color || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(candidate) ? candidate : '#ffffff';
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const safeValue = normalizeHexColor(value);

  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
        Cor
      </label>
      <div className="flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-sm hover:border-white/20 transition-colors">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
          <input
            type="color"
            value={safeValue}
            onInput={(e) => onChange((e.target as HTMLInputElement).value)}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full h-full cursor-pointer bg-transparent border-none p-0"
          />
        </div>
        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
          {safeValue}
        </span>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {QUICK_SWATCHES.map((swatch) => (
          <button
            key={swatch}
            type="button"
            onClick={() => onChange(swatch)}
            className="h-5 border border-white/20 hover:border-white/50 transition-colors cursor-pointer"
            style={{
              backgroundColor: swatch,
              boxShadow: safeValue === swatch ? '0 0 0 1px rgba(255,255,255,0.6) inset' : undefined,
            }}
            aria-label={`Selecionar cor ${swatch}`}
          />
        ))}
      </div>
    </div>
  );
}
