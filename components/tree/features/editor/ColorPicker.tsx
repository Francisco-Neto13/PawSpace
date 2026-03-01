'use client';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
        Cor
      </label>
      <div className="flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-sm hover:border-white/20 transition-colors">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer bg-transparent border-none"
          />
        </div>
        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
          {value}
        </span>
      </div>
    </div>
  );
}