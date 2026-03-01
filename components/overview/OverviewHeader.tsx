'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Target, Cpu } from 'lucide-react';

interface OverviewHeaderProps {
  initialProgress?: number;
  unlockedCount?: number;
  totalCount?: number;
}

const RANKS = [
  { threshold: 100, title: 'Nexus Master', rank: 'SS', color: '#ffd700' },
  { threshold: 80, title: 'Lead Architect', rank: 'S', color: '#c8b89a' },
  { threshold: 50, title: 'Senior Developer', rank: 'A', color: '#86efac' },
  { threshold: 20, title: 'Specialist', rank: 'B', color: '#93c5fd' },
  { threshold: 0, title: 'The Initiate', rank: 'C', color: '#a1a1aa' },
];

const MARKS = [0, 20, 40, 60, 80, 100];

export default function OverviewHeader({
  initialProgress = 0,
  unlockedCount = 0,
  totalCount = 0,
}: OverviewHeaderProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [displayProgress, setDisplayProgress] = useState(0);
  
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  useEffect(() => {
    const start = displayProgress;
    const end = progress;
    if (start === end) return;

    const duration = 1000;

    const animate = (time: number) => {
      if (startTimeRef.current === null) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const p = Math.min(elapsed / duration, 1);
      
      const eased = 1 - Math.pow(1 - p, 3);
      const currentVal = Math.round(start + (end - start) * eased);
      
      setDisplayProgress(currentVal);

      if (p < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        startTimeRef.current = null;
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startTimeRef.current = null;
    };
  }, [progress, displayProgress]);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const ce = e as CustomEvent<number>;
      if (typeof ce.detail === 'number' && ce.detail !== progress) {
        setProgress(ce.detail);
      }
    };
    window.addEventListener('skill-progress-update', handleUpdate);
    return () => window.removeEventListener('skill-progress-update', handleUpdate);
  }, [progress]);

  const currentRank = useMemo(() => {
    return RANKS.find(r => progress >= r.threshold) || RANKS[RANKS.length - 1];
  }, [progress]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 p-8 border border-white/5 bg-white/[0.02] rounded-sm relative overflow-hidden group">
        
        <div className="absolute top-0 left-0 w-64 h-64 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle,#c8b89a,transparent_70%)]" />
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
          <Target size={140} strokeWidth={0.5} className="text-[#c8b89a]" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c8b89a] shadow-[0_0_6px_#c8b89a] animate-pulse" />
                <span className="text-[#c8b89a]/80 text-[10px] font-black uppercase tracking-[0.4em]">
                  {currentRank.title}
                </span>
              </div>
              <h1 className="text-white text-3xl font-black uppercase tracking-tighter leading-none">
                Francisco <span className="text-[#c8b89a]">Neto</span>
              </h1>
            </div>

            <div className="text-right flex flex-col items-center gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Rank</span>
              <div
                className="w-12 h-12 flex items-center justify-center font-black text-2xl relative transition-colors duration-500"
                style={{ 
                    color: currentRank.color, 
                    border: `1px solid ${currentRank.color}44`, 
                    backgroundColor: `${currentRank.color}15` 
                }}
              >
                <div className="absolute inset-0 opacity-20 blur-md" style={{ backgroundColor: currentRank.color }} />
                <span className="relative z-10">{currentRank.rank}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Cpu size={11} className="text-[#c8b89a]/60" />
                {unlockedCount} / {totalCount} Módulos Concluídos
              </span>
              <span className="font-mono text-xl text-[#c8b89a] font-black leading-none">
                {displayProgress}<span className="text-xs ml-0.5 opacity-70">%</span>
              </span>
            </div>

            <div className="h-2.5 w-full bg-black/60 border border-white/10 p-[1.5px] relative overflow-hidden">
              <div
                className="h-full relative transition-all duration-1000 ease-out will-change-[width]"
                style={{
                  width: `${progress}%`,
                  backgroundColor: '#c8b89a',
                  boxShadow: '0 0 15px rgba(200, 184, 154, 0.3)',
                }}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-[1200%] transition-transform duration-[2500ms] ease-in-out will-change-transform" />
                </div>
              </div>
            </div>

            <div className="flex justify-between w-full px-0.5">
              {MARKS.map((mark) => (
                <div key={mark} className="flex flex-col items-center gap-1.5">
                  <div className={`w-[1px] h-2 transition-colors duration-500 ${progress >= mark ? 'bg-[#c8b89a]/50' : 'bg-white/10'}`} />
                  <span className={`text-[9px] font-mono font-bold transition-colors duration-500 ${progress >= mark ? 'text-[#c8b89a]' : 'text-zinc-600'}`}>
                    {mark}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 border border-[#c8b89a]/20 bg-gradient-to-b from-[#c8b89a]/[0.05] to-transparent rounded-sm flex flex-col items-center justify-center text-center group relative overflow-hidden">
        <div className="relative z-10 space-y-7 w-full">
          <div>
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-3">Versão do Sistema</span>
            <div className="text-[#c8b89a] font-mono text-[11px] font-bold tracking-[0.2em] border border-[#c8b89a]/30 px-4 py-2 bg-black/60 inline-block">v1.0.4</div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2.5">Status do Protocolo</p>
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <p className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em]">Online</p>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Completude</p>
            <p className="text-[#c8b89a] text-3xl font-black font-mono tabular-nums leading-none">{displayProgress}%</p>
          </div>
        </div>
        
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#c8b89a]/40" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#c8b89a]/40" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#c8b89a]/40" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#c8b89a]/40" />
      </div>
    </section>
  );
}