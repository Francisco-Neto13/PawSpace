'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Target } from 'lucide-react';

interface OverviewHeaderProps {
  initialProgress?: number;
  unlockedCount?: number;
  totalCount?: number;
}

export default function OverviewHeader({ 
  initialProgress = 0, 
  unlockedCount = 0, 
  totalCount = 0 
}: OverviewHeaderProps) {
  const [progress, setProgress] = useState(initialProgress);

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const ce = e as CustomEvent<number>;
      if (typeof ce.detail === 'number') setProgress(ce.detail);
    };
    window.addEventListener('skill-progress-update', handleUpdate);
    return () => window.removeEventListener('skill-progress-update', handleUpdate);
  }, []);

  const rank = useMemo(() => {
    if (progress >= 100) return { title: "Nexus Master",    rank: "SS" };
    if (progress >= 80)  return { title: "Lead Architect",   rank: "S"  };
    if (progress >= 50)  return { title: "Senior Developer", rank: "A"  };
    if (progress >= 20)  return { title: "Specialist",       rank: "B"  };
    return                      { title: "The Initiate",     rank: "C"  };
  }, [progress]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 p-8 border border-white/5 bg-white/5 rounded-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
          <Target size={140} strokeWidth={1} className="text-[#c8b89a]" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-[#c8b89a]/60 text-[9px] font-black uppercase tracking-[0.3em] block mb-2">
                {rank.title}
              </span>
              <h1 className="text-white text-3xl font-black uppercase tracking-tighter">
                Francisco <span className="text-[#c8b89a]">Neto</span>
              </h1>
            </div>
            
            <div className="text-right">
              <span className="text-[#c8b89a] text-[10px] font-black uppercase tracking-widest block mb-1 text-center">Rank</span>
              <div className="w-10 h-10 bg-[#c8b89a] text-black flex items-center justify-center font-black text-xl border border-black shadow-[0_0_10px_rgba(200,184,154,0.3)]">
                {rank.rank}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end leading-none">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                {unlockedCount} / {totalCount} Nós Concluídos
              </span>
              <span className="font-mono text-[11px] text-[#c8b89a] font-bold">{progress}%</span>
            </div>
            
            <div className="h-2 w-full bg-black/50 border border-white/5 p-[1px]">
              <div 
                className="h-full bg-[#c8b89a] transition-all duration-1000 ease-out relative shadow-[0_0_15px_rgba(200,184,154,0.2)]"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute top-0 left-0 w-full h-[30%] bg-white/20" />
              </div>
            </div>

            <div className="flex justify-between w-full opacity-30">
              {[...Array(11)].map((_, i) => (
                <div
                  key={i}
                  className={`w-[1px] h-1.5 ${i % 5 === 0 ? 'bg-[#c8b89a] h-2.5' : 'bg-zinc-600'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 border border-[#c8b89a]/20 bg-[#c8b89a]/5 rounded-sm flex flex-col items-center justify-center text-center group">
        <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-3">Versão do Sistema</span>
        <div className="text-[#c8b89a] font-mono text-[10px] tracking-widest border border-[#c8b89a]/20 px-3 py-1 bg-black/40">
          v1.0.4
        </div>
        <div className="mt-6 space-y-1">
           <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-40">Status da Rede</p>
           <p className="text-[#c8b89a] text-[11px] font-bold uppercase tracking-tighter">Sincronizado</p>
        </div>
      </div>
    </section>
  );
}