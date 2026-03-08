'use client';

import { useEffect, useMemo } from 'react';
import { useNexus } from '@/shared/contexts/NexusContext';
import { useOverview } from '@/shared/contexts/OverviewContext';
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

const EMPTY_OVERVIEW_SUMMARY = {
  total: 0,
  unlocked: 0,
  progress: 0,
};

export default function OverviewContent() {
  const { nodes, edges, isLoading } = useNexus();
  const { bootstrap, isLoading: isBootstrapLoading, refreshOverview } = useOverview();

  useEffect(() => {
    void refreshOverview();
  }, [refreshOverview]);

  const libraryStats = bootstrap?.libraryStats ?? null;
  const recentActivity = bootstrap?.recentActivity ?? null;

  const snapshot = useMemo(
    () => buildOverviewSnapshot(nodes, edges, EMPTY_OVERVIEW_SUMMARY),
    [nodes, edges]
  );
  const stats = snapshot.stats;

  if (isLoading && nodes.length === 0) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--bg-base)]">
        <div className="theme-grid-overlay absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-7 h-7 border-2 border-[var(--border-visible)] border-t-[var(--text-primary)] rounded-full animate-spin" />
          <p className="text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.5em] animate-pulse">
            Sincronizando Pawspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <PageBackground src="/cat.webp" />

      <main className="relative z-10 py-8 space-y-4 pb-20">

        <div className="flex items-center gap-3 mb-6">
          <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
          <span className="text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.4em]">
            Pawspace / Visao Geral
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border-subtle)] to-transparent" />
        </div>

        <OverviewHeader
          initialProgress={stats.progress}
          unlockedCount={stats.unlocked}
          totalCount={stats.total}
        />

        <StatsGrid
          unlockedCount={stats.unlocked}
          totalCount={stats.total}
          progress={stats.progress}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={deferredSectionStyle}>
          <LazyMount minHeight={330}>
            <CategoryChart data={snapshot.categoryData} />
          </LazyMount>
          <LazyMount minHeight={330}>
            <TreeDepthChart data={snapshot.depthData} maxGapLevel={snapshot.maxGapLevel} />
          </LazyMount>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={deferredSectionStyle}>
          <div className="lg:col-span-2">
            <LazyMount minHeight={290}>
              <JournalActivityChart />
            </LazyMount>
          </div>
          <LazyMount minHeight={290}>
            <LibraryStatsPanel stats={libraryStats} isBootstrapLoading={isBootstrapLoading} />
          </LazyMount>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={deferredSectionStyle}>
          <CriticalNodesPanel critical={snapshot.criticalNodes} />
          <RecentActivityFeed initialPage={recentActivity} isBootstrapLoading={isBootstrapLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2" style={deferredSectionStyle}>

          <div className="lg:col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
              Resumo do Curriculo
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <p className="text-[var(--text-muted)] text-sm leading-relaxed font-light max-w-sm">
                Voce tem conteudo em{' '}
                <span className="text-[var(--text-primary)] font-bold">{stats.unlocked} modulos</span>,
                representando{' '}
                <span className="text-[var(--text-primary)] font-black">{stats.progress}%</span>{' '}
                da sua arvore. Ainda sem conteudo:{' '}
                <span className="text-[var(--text-secondary)] font-semibold">{stats.total - stats.unlocked} modulos</span>.
              </p>
              <div className="flex gap-6 shrink-0 font-mono">
                <div className="text-right">
                  <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Total</p>
                  <p className="text-[var(--text-primary)] text-3xl font-black tabular-nums">{stats.total}</p>
                </div>
                <div className="w-[1px] bg-[var(--bg-elevated)]" />
                <div className="text-right">
                  <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Com Conteudo</p>
                  <p className="text-[var(--text-primary)] text-3xl font-black tabular-nums">{stats.unlocked}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-surface)] p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
            <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-[0.4em] mb-4">
              Proxima Meta
            </p>
            <div className="flex-1 flex flex-col items-start justify-center gap-3">
              <div className="rounded-lg border border-[var(--border-visible)] px-3 py-1.5 bg-[var(--bg-input)]">
                <p className="text-[var(--text-primary)] text-[10px] font-black uppercase tracking-wider">
                  {stats.progress < 100 ? 'Adicionar Conteudo' : 'Cobertura Completa'}
                </p>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono leading-snug">
                {stats.total - stats.unlocked > 0
                  ? `${stats.total - stats.unlocked} modulos sem conteudo`
                  : 'Todos os modulos tem conteudo!'}
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

