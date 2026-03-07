'use client';
import { PawIcon } from '@/components/shared/PawIcon';

const USAGE_ITEMS = [
  { label: 'Entradas no Diário',   current: 12,  max: 100,  unit: 'entradas' },
  { label: 'Módulos na Árvore',    current: 34,  max: 200,  unit: 'módulos'  },
  { label: 'Conteúdos na Biblioteca', current: 8, max: 500, unit: 'itens'    },
];

export default function UsageLimits() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
        Uso Atual
      </p>
      <p className="text-[9px] text-zinc-500 mb-6 ml-3">consumo vs limites do plano</p>

      <div className="space-y-5">
        {USAGE_ITEMS.map(item => {
          const pct = Math.min((item.current / item.max) * 100, 100);
          const isHigh = pct >= 80;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-[9px] font-mono font-black"
                  style={{ color: isHigh ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.5)' }}
                >
                  {item.current} / {item.max}
                </span>
              </div>
              <div className="h-[3px] w-full bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isHigh ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.5)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[7px] text-zinc-700 uppercase tracking-wider font-bold">
                  {item.unit}
                </span>
                <span className="text-[7px] font-mono font-bold"
                  style={{ color: isHigh ? 'rgba(239,68,68,0.6)' : '#3f3f46' }}
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