'use client';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

const THEME_OPTIONS = [
  {
    key: 'dark' as const,
    label: 'Escuro',
    sub: 'fundo preto, clima padrão do PawSpace',
    icon: Moon,
    preview: {
      bg: '#0a0a0a',
      surface: 'rgba(255,255,255,0.04)',
      border: 'rgba(255,255,255,0.08)',
      text: 'rgba(255,255,255,0.9)',
      muted: '#52525b',
    },
  },
  {
    key: 'light' as const,
    label: 'Claro',
    sub: 'fundo claro, leitura com alto contraste',
    icon: Sun,
    preview: {
      bg: '#f4f4f5',
      surface: 'rgba(0,0,0,0.03)',
      border: 'rgba(0,0,0,0.10)',
      text: 'rgba(0,0,0,0.85)',
      muted: '#71717a',
    },
  },
];

function ThemePreview({ preview }: { preview: (typeof THEME_OPTIONS)[0]['preview'] }) {
  return (
    <div className="w-full h-16 rounded-lg overflow-hidden border p-2 flex flex-col gap-1.5" style={{ backgroundColor: preview.bg, borderColor: preview.border }}>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: preview.surface, border: `1px solid ${preview.border}` }} />
        <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: preview.muted, opacity: 0.4 }} />
        <div className="flex-1" />
        <div className="h-1.5 w-8 rounded" style={{ backgroundColor: preview.surface, border: `1px solid ${preview.border}` }} />
      </div>
      <div className="flex-1 rounded" style={{ backgroundColor: preview.surface, border: `1px solid ${preview.border}` }}>
        <div className="p-1.5 flex gap-1.5 items-center">
          <div className="w-2 h-2 rounded" style={{ backgroundColor: preview.muted, opacity: 0.3 }} />
          <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: preview.text, opacity: 0.15 }} />
        </div>
      </div>
    </div>
  );
}

export default function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="library-panel p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <p className="library-kicker mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
        Aparência
      </p>
      <p className="library-subtitle mb-5 ml-3">o clima visual do seu espaço de estudo</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEME_OPTIONS.map((option) => {
          const isActive = theme === option.key;
          return (
            <button
              key={option.key}
              onClick={() => setTheme(option.key)}
              className="text-left rounded-xl border p-4 transition-all duration-200"
              style={{
                borderColor: isActive ? 'var(--border-visible)' : 'var(--border-subtle)',
                backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
              }}
            >
              <ThemePreview preview={option.preview} />

              <div className="flex items-start justify-between mt-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                    <option.icon size={10} />
                    {option.label}
                  </p>
                  <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider font-bold mt-0.5">{option.sub}</p>
                </div>
                <div
                  className="w-3 h-3 rounded-full border-2 shrink-0 mt-0.5 transition-all duration-200"
                  style={{
                    borderColor: isActive ? 'var(--text-primary)' : 'var(--border-muted)',
                    backgroundColor: isActive ? 'var(--text-primary)' : 'transparent',
                    transform: isActive ? 'scale(1)' : 'scale(0.85)',
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
