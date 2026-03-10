'use client';

import { useEffect, useMemo } from 'react';
import { useNexus } from '@/shared/contexts/NexusContext';
import { useOverview } from '@/shared/contexts/OverviewContext';
import { useJournal } from '@/contexts/JournalContext';
import OverviewHeader from './ui/OverviewHeader';
import StatsGrid from './features/stats/StatsGrid';
import CategoryChart from './features/stats/CategoryChart';
import TreeDepthChart from './features/stats/TreeDepthChart';
import CriticalNodesPanel from './features/insights/CriticalNodesPanel';
import JournalActivityChart from './features/activity/JournalActivityChart';
import LibraryStatsPanel from './features/insights/LibraryStatsPanel';
import RecentActivityFeed from './features/activity/RecentActivityFeed';
import { PawIcon } from '@/components/shared/PawIcon';
import { PageBackground } from '@/components/shared/PageBackground';
import LazyMount from './ui/LazyMount';
import { buildOverviewSnapshot } from './lib/overviewMetrics';

const deferredSectionStyle = {
  contentVisibility: 'auto' as const,
  containIntrinsicSize: '1px 700px',
};

const EMPTY_OVERVIEW_SUMMARY = { total: 0, unlocked: 0, progress: 0 };

export default function OverviewContent() {
  const { nodes, edges, isLoading } = useNexus();
  const { bootstrap, isLoading: isBootstrapLoading, refreshOverview } = useOverview();
  const { entries } = useJournal();

  useEffect(() => { void refreshOverview(); }, [refreshOverview]);

  const libraryStats   = bootstrap?.libraryStats   ?? null;
  const recentActivity = bootstrap?.recentActivity ?? null;

  const snapshot = useMemo(
    () => buildOverviewSnapshot(nodes, edges, EMPTY_OVERVIEW_SUMMARY),
    [nodes, edges]
  );
  const stats = snapshot.stats;

  const currentMonthEntries = useMemo(() => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return entries.filter(e => {
      const d = new Date(typeof e.createdAt === 'string' ? e.createdAt : e.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === currentKey;
    }).length;
  }, [entries]);

  const criticalUncovered = useMemo(
    () => snapshot.criticalNodes.filter(n => !n.hasContent).length,
    [snapshot.criticalNodes]
  );

  if (isLoading && nodes.length === 0) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--bg-base)]">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-7 h-7 border-2 border-[var(--border-visible)] border-t-[var(--text-primary)] rounded-full animate-spin" />
          <p className="text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.5em] animate-pulse">
            Sincronizando Pawspace...
          </p>
        </div>
      </div>
    );
  }

  const pending = stats.total - stats.unlocked;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <PageBackground src="/cat.webp" />

      <main className="relative z-10 py-8 space-y-4 pb-20">

        <div className="flex items-center gap-3 mb-6 reveal-fade delay-0">
          <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
          <span className="text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.4em]">
            Pawspace / Visão Geral
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border-subtle)] to-transparent" />
        </div>

        <div className="reveal-up delay-100">
          <OverviewHeader
            initialProgress={stats.progress}
            unlockedCount={stats.unlocked}
            totalCount={stats.total}
            criticalUncovered={criticalUncovered}
            currentMonthEntries={currentMonthEntries}
          />
        </div>

        <div className="reveal-up delay-200">
          <StatsGrid
            unlockedCount={stats.unlocked}
            totalCount={stats.total}
            progress={stats.progress}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 reveal-up delay-300" style={deferredSectionStyle}>
          <LazyMount minHeight={330}>
            <CategoryChart data={snapshot.categoryData} />
          </LazyMount>
          <LazyMount minHeight={330}>
            <TreeDepthChart data={snapshot.depthData} maxGapLevel={snapshot.maxGapLevel} />
          </LazyMount>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 reveal-up delay-400" style={deferredSectionStyle}>
          <div className="lg:col-span-2">
            <LazyMount minHeight={360}>
              <JournalActivityChart />
            </LazyMount>
          </div>
          <LazyMount minHeight={360}>
            <LibraryStatsPanel stats={libraryStats} isBootstrapLoading={isBootstrapLoading} />
          </LazyMount>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 reveal-up delay-500" style={deferredSectionStyle}>
          <CriticalNodesPanel critical={snapshot.criticalNodes} />
          <RecentActivityFeed initialPage={recentActivity} isBootstrapLoading={isBootstrapLoading} />
        </div>

        {stats.total > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 reveal-up delay-500" style={deferredSectionStyle}>

            <div className="lg:col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
                Próximo Passo
              </p>

              {pending === 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-[var(--text-primary)] text-sm font-bold">
                    Árvore completa — todos os módulos têm conteúdo.
                  </p>
                  <p className="text-[var(--text-muted)] text-[11px] font-medium leading-relaxed">
                    Continue atualizando os conteúdos existentes para manter a árvore relevante.
                  </p>
                </div>
              ) : criticalUncovered > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-[var(--text-primary)] text-sm font-bold">
                    Priorize os {criticalUncovered} módulo{criticalUncovered > 1 ? 's críticos' : ' crítico'} sem conteúdo.
                  </p>
                  <p className="text-[var(--text-muted)] text-[11px] font-medium leading-relaxed max-w-lg">
                    Estes módulos sustentam outros na sua árvore. Preencher eles primeiro
                    desbloqueia o avanço em mais áreas ao mesmo tempo.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-[var(--text-primary)] text-sm font-bold">
                    {pending} módulo{pending > 1 ? 's ainda sem' : ' ainda sem'} conteúdo.
                  </p>
                  <p className="text-[var(--text-muted)] text-[11px] font-medium leading-relaxed max-w-lg">
                    Veja o painel de módulos críticos acima para saber por onde continuar.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-surface)] p-6 flex flex-col justify-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

              <div>
                <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Total na árvore</p>
                <p className="text-[var(--text-primary)] text-3xl font-black font-mono tabular-nums leading-none">{stats.total}</p>
              </div>

              <div className="w-full h-px bg-[var(--border-subtle)]" />

              <div>
                <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Com conteúdo</p>
                <p className="text-[var(--text-primary)] text-3xl font-black font-mono tabular-nums leading-none">{stats.unlocked}</p>
              </div>

              <div className="w-full h-px bg-[var(--border-subtle)]" />

              <div>
                <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Cobertura</p>
                <p className="text-[var(--text-primary)] text-3xl font-black font-mono tabular-nums leading-none">{stats.progress}<span className="text-lg ml-0.5 text-[var(--text-secondary)]">%</span></p>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
