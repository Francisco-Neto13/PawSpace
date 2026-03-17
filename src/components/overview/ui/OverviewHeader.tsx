'use client';

import { useState, useEffect, useMemo } from 'react';
import { PawIcon } from '@/components/shared/PawIcon';
import { useAuthDisplayName } from '@/shared/hooks/useAuthDisplayName';

interface OverviewHeaderProps {
  initialProgress?: number;
  unlockedCount?: number;
  totalCount?: number;
  criticalUncovered?: number;
  currentMonthEntries?: number;
}

const MARKS = [0, 20, 40, 60, 80, 100];

function getProgressMessage(progress: number, unlocked: number, total: number, criticalUncovered: number): string {
  if (total === 0) return 'Abra sua árvore para começar a mapear as trilhas do PawSpace.';
  if (progress === 0) return 'Sua árvore ainda não tem material. Comece pela trilha mais importante.';
  if (progress === 100) return 'Todas as trilhas têm material. Seu PawSpace está completo.';
  if (criticalUncovered > 0) {
    return `${criticalUncovered} trilha${criticalUncovered > 1 ? 's críticas sem' : ' crítica sem'} material. Elas sustentam boa parte do seu território.`;
  }
  const remaining = total - unlocked;
  if (remaining <= 3) return `Faltam apenas ${remaining} trilha${remaining > 1 ? 's' : ''} para cobertura total.`;
  return `${unlocked} de ${total} trilhas com material. Continue enchendo as que faltam.`;
}

export default function OverviewHeader({
  initialProgress = 0,
  unlockedCount = 0,
  totalCount = 0,
  criticalUncovered = 0,
  currentMonthEntries = 0,
}: OverviewHeaderProps) {
  const [progress, setProgress] = useState(initialProgress);
  const { displayName } = useAuthDisplayName();

  const [firstName, restName] = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return ['Usuário', ''];
    if (parts.length === 1) return [parts[0], ''];
    return [parts[0], parts.slice(1).join(' ')];
  }, [displayName]);

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

  const message = useMemo(
    () => getProgressMessage(progress, unlockedCount, totalCount, criticalUncovered),
    [progress, unlockedCount, totalCount, criticalUncovered]
  );

  const pending = totalCount - unlockedCount;
  const progressToneClass =
    progress >= 80
      ? 'text-[var(--text-primary)]'
      : progress >= 40
        ? 'text-[var(--text-secondary)]'
        : 'text-[var(--text-muted)]';

  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3 overview-card overview-card-hover relative overflow-hidden p-5 sm:p-6 lg:p-8 render-isolate">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

        <div className="relative z-10">
          <div className="mb-5">
            <p className="overview-kicker mb-2">Radar da Patinha</p>
            <h1 className="page-display max-w-4xl mb-3">
              Olá, {firstName}
              {restName && <span className="text-[var(--text-secondary)]"> {restName}</span>}
            </h1>
            <p className="page-summary max-w-3xl text-[0.88rem] leading-[1.56]">{message}</p>
          </div>

          <div className="space-y-3 border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--bg-surface)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="ui-label flex items-center gap-2">
                <PawIcon className="w-3 h-3 text-[var(--text-secondary)]" />
                Cobertura atual
              </span>
              <span className={`metric-value font-mono tabular-nums ${progressToneClass}`}>
                {progress}
                <span className="text-xs ml-0.5 text-[var(--text-secondary)]">%</span>
              </span>
            </div>

            <div className="h-2.5 w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-full p-[1.5px] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: 'var(--chart-strong)',
                  transition: 'width 320ms ease',
                }}
              />
            </div>

            <div className="flex justify-between w-full px-0.5">
              {MARKS.map((mark) => (
                <div key={mark} className="flex flex-col items-center gap-1">
                  <div
                    className="w-[1px] h-2 transition-colors duration-500"
                    style={{ backgroundColor: progress >= mark ? 'var(--chart-soft)' : 'var(--chart-faint)' }}
                  />
                  <span
                    className="ui-meta font-mono transition-colors duration-500"
                    style={{ color: progress >= mark ? 'var(--text-secondary)' : 'var(--text-faint)' }}
                  >
                    {mark}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
              <p className="data-label mb-1">Trilhas com material</p>
              <p className="text-[var(--text-primary)] text-base font-black font-mono tabular-nums leading-none">
                {unlockedCount}
                <span className="text-[11px] text-[var(--text-secondary)]">/{totalCount}</span>
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
              <p className="data-label mb-1">Críticos em aberto</p>
              <p className="text-[var(--text-primary)] text-base font-black font-mono tabular-nums leading-none">{criticalUncovered}</p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
              <p className="data-label mb-1">Notas do mês</p>
              <p className="text-[var(--text-primary)] text-base font-black font-mono tabular-nums leading-none">{currentMonthEntries}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overview-card overview-card-hover relative flex flex-col justify-between overflow-hidden p-5 sm:p-6 render-isolate">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
        <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-[var(--text-primary)] opacity-[0.04]" />

        <div className="space-y-5">
          <div>
            <p className="ui-label mb-3">Neste ciclo</p>
            <p className="metric-value font-mono tabular-nums">{currentMonthEntries}</p>
            <p className="ui-meta uppercase mt-1">notas no diário</p>
          </div>

          <div className="w-full h-px bg-[var(--border-subtle)]" />

          <div>
            <p className="ui-label mb-3">Pendentes</p>
            <p
              className="metric-value font-mono tabular-nums"
              style={{ color: pending > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              {pending}
            </p>
            <p className="ui-meta uppercase mt-1">trilhas sem material</p>
          </div>

          {criticalUncovered > 0 && (
            <>
              <div className="w-full h-px bg-[var(--border-subtle)]" />
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] shrink-0" />
                <p className="ui-meta uppercase leading-snug">
                  {criticalUncovered} crítico{criticalUncovered > 1 ? 's' : ''} sem material
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
