'use client';

import { useState, useEffect, useMemo } from 'react';
import { PawIcon } from '@/components/shared/PawIcon';
import { useAuthDisplayName } from '@/shared/hooks/useAuthDisplayName';

interface OverviewHeaderProps {
  initialProgress?: number;
  unlockedCount?: number;
  totalCount?: number;
}

const RANKS = [
  { threshold: 100, title: 'Gato Lendário', label: 'SS' },
  { threshold: 80, title: 'Gato Ninja', label: 'S' },
  { threshold: 50, title: 'Gato de Rua', label: 'A' },
  { threshold: 20, title: 'Gatinho', label: 'B' },
  { threshold: 0, title: 'Filhote', label: 'C' },
];

const MARKS = [0, 20, 40, 60, 80, 100];

export default function OverviewHeader({
  initialProgress = 0,
  unlockedCount = 0,
  totalCount = 0,
}: OverviewHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const { displayName } = useAuthDisplayName();

  const [firstName, restName] = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return ['Usuario', ''];
    if (parts.length === 1) return [parts[0], ''];
    return [parts[0], parts.slice(1).join(' ')];
  }, [displayName]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  useEffect(() => {
    const handle = (e: Event) => {
      const val = (e as CustomEvent<number>).detail;
      if (typeof val === 'number') setProgress(val);
    };

    window.addEventListener('skill-progress-update', handle);
    return () => window.removeEventListener('skill-progress-update', handle);
  }, []);

  const rank = useMemo(
    () => RANKS.find((r) => progress >= r.threshold) ?? RANKS[RANKS.length - 1],
    [progress]
  );

  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)] animate-pulse" />
                <span className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.4em]">
                  {rank.title}
                </span>
              </div>
              <h1 className="text-[var(--text-primary)] text-3xl font-black uppercase tracking-tighter leading-none">
                {firstName}
                {restName && <span className="text-[var(--text-secondary)]"> {restName}</span>}
              </h1>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Rank</span>
              <div className="w-14 h-14 flex items-center justify-center border border-[var(--border-muted)] bg-[var(--bg-elevated)] rounded-xl">
                <span className="text-[var(--text-primary)] text-2xl font-black font-mono">{rank.label}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                <PawIcon className="w-3 h-3 text-[var(--text-secondary)]" />
                {unlockedCount} / {totalCount} módulos com conteúdo
              </span>
              <span className="font-mono text-xl text-[var(--text-primary)] font-black leading-none">
                {progress}
                <span className="text-xs ml-0.5 text-[var(--text-secondary)]">%</span>
              </span>
            </div>

            <div className="h-2 w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-full p-[1.5px] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: mounted ? `${progress}%` : '0%',
                  backgroundColor: 'var(--chart-strong)',
                  transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 0 10px var(--chart-faint)',
                }}
              />
            </div>

            <div className="flex justify-between w-full px-0.5">
              {MARKS.map((mark) => (
                <div key={mark} className="flex flex-col items-center gap-1">
                  <div
                    className="w-[1px] h-2 transition-colors duration-500"
                    style={{
                      backgroundColor:
                        progress >= mark ? 'var(--chart-soft)' : 'var(--chart-faint)',
                    }}
                  />
                  <span
                    className="text-[9px] font-mono font-bold transition-colors duration-500"
                    style={{ color: progress >= mark ? 'var(--text-secondary)' : 'var(--text-faint)' }}
                  >
                    {mark}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-surface)] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

        <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-[var(--text-primary)] opacity-[0.04]" />

        <div className="space-y-6 w-full">
          <div>
            <span className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest block mb-2">
              Versão do Pawspace
            </span>
            <div className="text-[var(--text-primary)] font-mono text-[11px] font-bold tracking-[0.2em] border border-[var(--border-muted)] rounded-lg px-4 py-2 bg-[var(--bg-input)] inline-block">
              v1.0.4
            </div>
          </div>

          <div className="w-full h-px bg-[var(--border-subtle)]" />

          <div>
            <p className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-2">Status</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)] animate-pulse" />
              <p className="text-[var(--text-primary)] text-[11px] font-black uppercase tracking-[0.2em]">Online</p>
            </div>
          </div>

          <div className="w-full h-px bg-[var(--border-subtle)]" />

          <div>
            <p className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mb-1">Cobertura</p>
            <p className="text-[var(--text-primary)] text-3xl font-black font-mono tabular-nums leading-none">{progress}%</p>
          </div>
        </div>
      </div>
    </section>
  );
}
