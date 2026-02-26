'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { GlassPanel } from "./GlassPanel";

export function CharacterStats() {
  const [progress, setProgress] = useState(0);

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
    <div className="absolute top-8 left-8 right-8 flex flex-row justify-between items-start pointer-events-none z-40">
      <div className="flex flex-col pointer-events-auto group">
        <div className="relative transition-transform duration-300 group-hover:scale-105">
          <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-[#c8b89a] leading-none drop-shadow-[0_0_8px_rgba(200,184,154,0.3)]">
            Learning Path
          </h1>
          <div className="absolute -top-2 -left-3 w-3 h-3 border-t border-l border-[#c8b89a]/40" />
          <span className="font-mono text-[8px] text-[#c8b89a]/30 uppercase mt-1.5 block tracking-[0.2em]">
            Neural Net v1.0.4
          </span>
        </div>
      </div>

      <div className="pointer-events-auto group/panel">
        <GlassPanel 
          title="Status" 
          className="w-[280px] transition-all duration-300 group-hover/panel:border-[#c8b89a]/40"
        >
          <div className="p-4 flex items-center gap-4 relative z-10">
            <div className="relative shrink-0">
              <div className="w-12 h-12 border border-[#3a3830] bg-[#0d0d0f] flex items-center justify-center">
                <div className="text-2xl grayscale opacity-40 transition-all group-hover/panel:grayscale-0 group-hover/panel:opacity-100">
                  👤
                </div>
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#c8b89a] text-[#0d0d0f] flex items-center justify-center font-mono font-bold text-[10px] border border-[#0d0d0f]">
                {rank.rank}
              </div>
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-sans text-[9px] uppercase tracking-wider text-[#c8b89a]/60 font-bold leading-none mb-1">
                {rank.title}
              </span>
              <h2 className="font-sans text-base font-bold text-[#ddd8cc] uppercase tracking-tight truncate leading-none mb-3 group-hover/panel:text-white">
                Francisco
              </h2>

              <div className="space-y-2 w-full">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-end leading-none">
                    <span className="font-sans text-[8px] text-[#c8b89a]/80 font-bold tracking-widest">EXP</span>
                    <span className="font-mono text-[9px] text-[#c8b89a]/50">{progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-black/50 border border-[#3a3830]">
                    <div className="h-full bg-[#c8b89a] transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}