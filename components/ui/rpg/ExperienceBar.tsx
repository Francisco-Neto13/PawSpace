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
    <div className="absolute bottom-12 left-12 right-12 pointer-events-none z-40">
      <div className="pointer-events-auto">

        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[11px] uppercase tracking-widest text-[#c8b89a]">
            Mastery Progress
          </span>
          <div className="flex items-center gap-3">
            {onExportLayout && (
              <button
                onClick={onExportLayout}
                className="bg-[#1a1a1c] border-2 border-[#3a3830] text-[#c8b89a] px-3 py-0.5 text-[10px] uppercase hover:bg-[#c8b89a] hover:text-black transition-colors"
              >
                Export Layout
              </button>
            )}
            <span className="text-[11px] text-[#c8b89a] bg-[#1a1a1a] px-2 py-0.5 border border-[#3a3830]">
              {progress}%
            </span>
          </div>
        </div>

        <div className="h-4 w-full bg-black border-2 border-[#3a3830] p-[2px] relative shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
          <div className="absolute inset-[2px] bg-[#0d0d0f]" />
          <div
            className="h-full relative overflow-hidden transition-all duration-1000 ease-out"
            style={{ width: `${progress}%`, background: '#c8b89a' }}
          >
            <div className="absolute top-0 left-0 w-full h-[30%] bg-white/20" />
            <div className="absolute bottom-0 left-0 w-full h-[20%] bg-black/20" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] w-20 animate-[flow_3s_steps(10)_linear_infinite]" />
          </div>
        </div>

        <div className="flex justify-between w-full px-[2px] mt-1.5">
          {[...Array(11)].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1.5 transition-colors duration-700 ${
                progress >= i * 10 ? 'bg-[#c8b89a]' : 'bg-[#3a3830]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}