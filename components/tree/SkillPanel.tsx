'use client';
import React from 'react';
import { SkillData } from './types';

interface SkillPanelProps {
  data: SkillData | null;
  onClose: () => void;
}

export function SkillPanel({ data, onClose }: SkillPanelProps) {
  if (!data) return null;

  const xpPercent = data.xpToNextLevel > 0
    ? Math.round((data.xp / data.xpToNextLevel) * 100)
    : 0;

  return (
    <div className="absolute bottom-6 right-6 z-50 w-60 rounded-xl border border-purple-500/30 bg-zinc-950/95 p-5 shadow-[0_0_40px_rgba(168,85,247,0.2)] backdrop-blur-md">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors text-base leading-none"
      >
        ✕
      </button>

      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 ${
          data.isUnlocked
            ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
            : 'border-zinc-700 bg-zinc-900'
        }`}>
          {data.isUnlocked ? data.icon : '🔒'}
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-100">{data.label}</p>
          <p className="text-[10px] text-purple-400 uppercase tracking-widest">
            {data.isUnlocked ? `Level ${data.level}` : 'Locked'}
          </p>
        </div>
      </div>

      <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{data.description}</p>

      {data.isUnlocked && (
        <>
          <div className="flex justify-between mb-1.5">
            <span className="text-[11px] text-zinc-400">Experience</span>
            <span className="text-[11px] text-purple-400 font-bold">
              {data.xp} / {data.xpToNextLevel} XP
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-400 transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-600 text-right mt-1">{xpPercent}% to next level</p>

          <button className="mt-3 w-full rounded-lg bg-gradient-to-r from-violet-700 to-purple-500 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_15px_rgba(168,85,247,0.4)] hover:opacity-90 transition-opacity">
            View Missions
          </button>
        </>
      )}
    </div>
  );
}