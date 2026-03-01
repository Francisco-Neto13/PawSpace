'use client';
import { useMemo } from 'react';
import { Zap, Target, Layout, LucideIcon } from 'lucide-react';

interface StatsGridProps {
  unlockedCount: number;
  totalCount: number;
  progress: number;
}

interface StatItem {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  color: string;
  glowColor: string;
  barColor: string;
  barWidth: number;
}

const DOTS = [0, 1, 2];

export default function StatsGrid({ unlockedCount, totalCount, progress }: StatsGridProps) {
  
  const stats = useMemo<StatItem[]>(() => {
    const pending = totalCount - unlockedCount;
    const progressSafe = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
    const pendingSafe = totalCount > 0 ? (pending / totalCount) * 100 : 0;

    return [
      {
        label: 'Nós Concluídos',
        value: unlockedCount,
        sub: `de ${totalCount} no roadmap`,
        icon: Zap,
        color: 'text-amber-400',
        glowColor: 'rgba(251, 191, 36, 0.15)',
        barColor: '#fbbf24',
        barWidth: progressSafe,
      },
      {
        label: 'Aproveitamento',
        value: `${progress}%`,
        sub: 'Total Dominado',
        icon: Target,
        color: 'text-[#c8b89a]',
        glowColor: 'rgba(200, 184, 154, 0.15)',
        barColor: '#c8b89a',
        barWidth: progress,
      },
      {
        label: 'Nós Pendentes',
        value: pending,
        sub: 'Aguardando ação',
        icon: Layout,
        color: 'text-zinc-400', 
        glowColor: 'rgba(161, 161, 170, 0.1)',
        barColor: '#71717a', 
        barWidth: pendingSafe,
      },
    ];
  }, [unlockedCount, totalCount, progress]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((item, index) => (
        <div
          key={item.label}
          className="group relative rounded-sm overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
            style={{
              background: `linear-gradient(135deg, ${item.glowColor}, transparent 60%)`,
            }}
          />
          <div className="absolute inset-[1px] bg-[#0a0a0c] rounded-sm z-0" />

          <div className="absolute inset-0 opacity-[0.025] pointer-events-none z-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />

          <div className="relative z-10 p-8 flex flex-col justify-between h-full border border-white/[0.06] group-hover:border-white/[0.12] transition-colors duration-500 rounded-sm">
            
            <div className="flex justify-between items-start mb-8">
              <div className="relative">
                <div
                  className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ backgroundColor: item.glowColor }}
                />
                <item.icon
                  size={20} 
                  className={`${item.color} relative z-10 transition-transform duration-300 group-hover:scale-110`}
                />
              </div>

              <div className="flex gap-1.5 mt-1">
                {DOTS.map((i) => (
                  <div
                    key={i}
                    className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors duration-300"
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="text-5xl font-black text-white mb-4 tracking-tighter font-mono leading-none tabular-nums">
                {item.value}
              </div>
              <span className="text-[10px] font-black text-[#c8b89a] uppercase tracking-[0.3em] block mb-1.5">
                {item.label}
              </span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">
                <span className="opacity-50 font-mono mr-1">//</span> {item.sub}
              </span>
            </div>

            <div className="mt-8 space-y-2">
              <div className="h-[3px] w-full bg-white/[0.03] overflow-hidden">
                <div
                  className="h-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]"
                  style={{
                    width: `${item.barWidth}%`,
                    backgroundColor: item.barColor,
                    color: item.barColor 
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-zinc-500 font-mono font-bold">0%</span>
                <span className="text-[10px] font-mono font-black" style={{ color: item.barColor }}>
                  {Math.round(item.barWidth)}%
                </span>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-white/10 group-hover:border-white/30 transition-colors duration-300" />
          </div>
        </div>
      ))}
    </section>
  );
}