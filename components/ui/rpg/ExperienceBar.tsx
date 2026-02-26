'use client';
import React, { useState, useEffect } from 'react';

interface ExperienceBarProps {
  onExportLayout?: () => void;
}

export function ExperienceBar({ onExportLayout }: ExperienceBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const ce = e as CustomEvent<number>;
      if (typeof ce.detail === 'number') setProgress(ce.detail);
    };
    window.addEventListener('skill-progress-update', handleUpdate);
    return () => window.removeEventListener('skill-progress-update', handleUpdate);
  }, []);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 pointer-events-none z-40">
      <div className="pointer-events-auto">

        <div className="flex justify-between items-end mb-2 px-1">
          <div className="flex flex-col">
            <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#c8b89a] font-bold">
              Mastery Progression
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onExportLayout && (
              <button
                onClick={onExportLayout}
                className="bg-[#0d0d0f]/80 border border-[#4a4840] text-[#c8b89a]/60 px-3 py-0.5 font-mono text-[8px] uppercase tracking-tighter hover:bg-[#c8b89a] hover:text-black transition-all"
              >
                EXPORT
              </button>
            )}
            <div className="bg-[#0d0d0f] px-2 py-0.5 border border-[#c8b89a]/20">
              <span className="font-mono text-[11px] font-bold text-[#c8b89a]">
                {progress}%
              </span>
            </div>
          </div>
        </div>

        <div className="h-2.5 w-full bg-[#030304] border border-[#3a3830] p-[1px] relative">
          <div
            className="h-full relative transition-all duration-1000 ease-out"
            style={{ width: `${progress}%`, background: '#c8b89a' }}
          >
            <div className="absolute top-0 left-0 w-full h-[30%] bg-white/20" />
          </div>
        </div>

        <div className="flex justify-between w-full mt-2">
          {[...Array(11)].map((_, i) => (
            <div
              key={i}
              className={`w-[1px] ${i % 5 === 0 ? 'h-2 bg-[#c8b89a]/40' : 'h-1 bg-[#3a3830]'} ${progress >= i * 10 ? 'bg-[#c8b89a]' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}