'use client';
import { useState, useEffect, useMemo } from 'react';
import { Cpu } from 'lucide-react';

interface OverviewHeaderProps {
  initialProgress?: number;
  unlockedCount?: number;
  totalCount?: number;
}

const RANKS = [
  { threshold: 100, title: 'Nexus Master',   rank: 'SS' },
  { threshold: 80,  title: 'Lead Architect', rank: 'S'  },
  { threshold: 50,  title: 'Senior Dev',     rank: 'A'  },
  { threshold: 20,  title: 'Specialist',     rank: 'B'  },
  { threshold: 0,   title: 'The Initiate',   rank: 'C'  },
];

const MARKS = [0, 20, 40, 60, 80, 100];

export default function OverviewHeader({
  initialProgress = 0,
  unlockedCount = 0,
  totalCount = 0,
}: OverviewHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(initialProgress);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { setProgress(initialProgress); }, [initialProgress]);

  useEffect(() => {
    const handle = (e: Event) => {
      const val = (e as CustomEvent<number>).detail;
      if (typeof val === 'number') setProgress(val);
    };
    window.addEventListener('skill-progress-update', handle);
    return () => window.removeEventListener('skill-progress-update', handle);
  }, []);

  const rank = useMemo(
    () => RANKS.find(r => progress >= r.threshold) ?? RANKS[RANKS.length - 1],
    [progress]
  );

  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">

      <div className="lg:col-span-3 border border-white/[0.06] bg-white/[0.02] p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2dd4bf]/25 to-transparent" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-pulse" />
                <span className="text-[#2dd4bf]/70 text-[10px] font-black uppercase tracking-[0.4em]">
                  {rank.title}
                </span>
              </div>
              <h1 className="text-white text-3xl font-black uppercase tracking-tighter leading-none">
                Francisco <span className="text-[#2dd4bf]">Neto</span>
              </h1>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Rank</span>
              <div className="w-12 h-12 flex items-center justify-center font-black text-xl border border-[#2dd4bf]/25 bg-[#2dd4bf]/[0.07] text-[#2dd4bf]">
                {rank.rank}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Cpu size={11} className="text-[#2dd4bf]/50" />
                {unlockedCount} / {totalCount} Módulos Concluídos
              </span>
              <span className="font-mono text-xl text-[#2dd4bf] font-black leading-none">
                {progress}<span className="text-xs ml-0.5 opacity-50">%</span>
              </span>
            </div>

            <div className="h-2 w-full bg-black/50 border border-white/[0.06] p-[1.5px] overflow-hidden">
              <div
                style={{
                  height: '100%',
                  width: mounted ? `${progress}%` : '0%',
                  backgroundColor: '#2dd4bf',
                  transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 0 10px rgba(45,212,191,0.25)',
                }}
              />
            </div>

            <div className="flex justify-between w-full px-0.5">
              {MARKS.map(mark => (
                <div key={mark} className="flex flex-col items-center gap-1">
                  <div
                    className="w-[1px] h-2 transition-colors duration-500"
                    style={{ backgroundColor: progress >= mark ? 'rgba(45,212,191,0.4)' : 'rgba(255,255,255,0.08)' }}
                  />
                  <span
                    className="text-[9px] font-mono font-bold transition-colors duration-500"
                    style={{ color: progress >= mark ? 'rgba(45,212,191,0.7)' : '#3f3f46' }}
                  >
                    {mark}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border border-[#2dd4bf]/15 bg-[#2dd4bf]/[0.03] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2dd4bf]/25 to-transparent" />

        <div className="space-y-6 w-full">
          <div>
            <span className="text-zinc-400 text-[9px] font-black uppercase tracking-widest block mb-2">
              Versão do Sistema
            </span>
            <div className="text-[#2dd4bf] font-mono text-[11px] font-bold tracking-[0.2em] border border-[#2dd4bf]/25 px-4 py-2 bg-black/40 inline-block">
              v1.0.4
            </div>
          </div>

          <div className="w-full h-px bg-white/[0.06]" />

          <div>
            <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-2">Status</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em]">Online</p>
            </div>
          </div>

          <div className="w-full h-px bg-white/[0.06]" />

          <div>
            <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-1">Completude</p>
            <p className="text-[#2dd4bf] text-3xl font-black font-mono tabular-nums leading-none">{progress}%</p>
          </div>
        </div>

        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#2dd4bf]/20" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#2dd4bf]/20" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#2dd4bf]/20" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#2dd4bf]/20" />
      </div>
    </section>
  );
}