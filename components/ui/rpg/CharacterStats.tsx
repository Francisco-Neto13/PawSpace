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
    if (progress >= 100) return { title: "Nexus Master",     rank: "SS" };
    if (progress >= 80)  return { title: "Lead Architect",   rank: "S"  };
    if (progress >= 50)  return { title: "Senior Developer", rank: "A"  };
    if (progress >= 20)  return { title: "Specialist",       rank: "B"  };
    return                      { title: "The Initiate",     rank: "C"  };
  }, [progress]);

  return (
    <div className="absolute top-12 left-12 right-12 flex flex-row justify-between items-start pointer-events-none z-40">

      <div className="flex flex-col pointer-events-auto">
        <div className="relative">
          <h1 className="text-2xl font-normal tracking-wider text-[#c8b89a] leading-none">
            Learning Path
          </h1>
          <div className="absolute -top-2 -left-3 w-3 h-3 border-t-2 border-l-2 border-[#c8b89a]/40" />
        </div>
      </div>

      <div className="pointer-events-auto">
        <GlassPanel title="Character Status" className="w-[320px]">
          <div className="p-5 flex items-center gap-5">

            <div className="relative shrink-0">
              <div className="w-14 h-14 border-2 border-[#3a3830] bg-[#1a1a1c] flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                <div className="text-3xl grayscale opacity-60">👤</div>
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#c8b89a] text-[#0d0d0f] flex items-center justify-center font-bold text-[13px] border-2 border-[#0d0d0f] shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                {rank.rank}
              </div>
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#c8b89a]/60 font-bold mb-1">
                {rank.title}
              </span>
              <h2 className="text-lg text-[#ddd8cc] truncate leading-none mb-3">
                Francisco
              </h2>

              <div className="space-y-2.5 w-full">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-[9px] text-[#c8b89a]/80 font-bold tracking-tighter">EXP</span>
                    <span className="text-[9px] text-[#c8b89a]/50">{progress}/100</span>
                  </div>
                  <div className="h-2 w-full bg-black border border-[#3a3830] p-[1px]">
                    <div
                      className="h-full bg-[#c8b89a] transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-blue-400/80 font-bold tracking-tighter">SYN</span>
                  <div className="h-2 w-full bg-black border border-[#3a3830] p-[1px]">
                    <div
                      className="h-full bg-blue-600/60 animate-pulse"
                      style={{ width: `${Math.min(progress * 1.1, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
        </GlassPanel>
      </div>
    </div>
  );
}