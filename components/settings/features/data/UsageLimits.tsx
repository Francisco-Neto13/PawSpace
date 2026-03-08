'use client';
import { PawIcon } from '@/components/shared/PawIcon';

const USAGE_ITEMS = [
  { label: 'Entradas no Diário',   current: 12,  max: 100,  unit: 'entradas' },
  { label: 'Módulos na Árvore',    current: 34,  max: 200,  unit: 'módulos'  },
  { label: 'Conteúdos na Biblioteca', current: 8, max: 500, unit: 'itens'    },
];

export default function UsageLimits() {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
        Uso Atual
      </p>
      <p className="text-[9px] text-[var(--text-muted)] mb-6 ml-3">consumo vs limites do plano</p>

      <div className="space-y-5">
        {USAGE_ITEMS.map(item => {
          const pct = Math.min((item.current / item.max) * 100, 100);
          const isHigh = pct >= 80;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-[9px] font-mono font-black"
                  style={{ color: isHigh ? 'rgba(239,68,68,0.8)' : 'var(--text-secondary)' }}
                >
                  {item.current} / {item.max}
                </span>
              </div>
              <div className="h-[3px] w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isHigh ? 'rgba(239,68,68,0.7)' : 'var(--text-secondary)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[7px] text-[var(--text-faint)] uppercase tracking-wider font-bold">
                  {item.unit}
                </span>
                <span className="text-[7px] font-mono font-bold"
                  style={{ color: isHigh ? 'rgba(239,68,68,0.6)' : 'var(--text-faint)' }}
                >
                  {Math.round(pct)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
