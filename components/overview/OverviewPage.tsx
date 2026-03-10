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
  const nextAction = (() => {
    if (pending <= 0) {
      return {
        title: 'Cobertura completa atingida',
        body: 'Todos os módulos têm conteúdo. Foque agora em revisão e atualização dos itens mais antigos.',
        tag: 'Manutenção',
      };
    }
    if (criticalUncovered > 0) {
      return {
        title: `${criticalUncovered} módulo${criticalUncovered > 1 ? 's críticos sem' : ' crítico sem'} conteúdo`,
        body: 'Preencha esses módulos primeiro. Eles destravam mais avanço na árvore do que módulos isolados.',
        tag: 'Prioridade alta',
      };
    }
    return {
      title: `${pending} módulo${pending > 1 ? 's ainda sem' : ' ainda sem'} conteúdo`,
      body: 'Continue por categoria para aumentar cobertura geral sem perder consistência entre níveis.',
      tag: 'Próximo passo',
    };
  })();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <PageBackground src="/cat.webp" />

      <main className="relative z-10 py-8 pb-20">
        <div className="relative max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 2xl:px-16 space-y-5">

          <div className="flex items-center gap-3 reveal-fade delay-0">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 reveal-up delay-200" style={deferredSectionStyle}>
            <div className="lg:col-span-2 overview-card overview-card-hover p-7 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
              <div className="flex items-center justify-between mb-4">
                <p className="overview-kicker text-[var(--text-primary)] flex items-center gap-2">
                  <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
                  Decisão Imediata
                </p>
                <span className="overview-chip">
                  {nextAction.tag}
                </span>
              </div>
              <h3 className="text-[var(--text-primary)] text-xl font-black tracking-tight leading-snug mb-2">
                {nextAction.title}
              </h3>
              <p className="overview-subtitle max-w-2xl">
                {nextAction.body}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="overview-chip">Pendentes: {pending}</span>
                <span className="overview-chip">Críticos: {criticalUncovered}</span>
                <span className="overview-chip">Cobertura: {stats.progress}%</span>
              </div>
            </div>

            <div className="overview-card overview-card-hover p-6 flex flex-col justify-center gap-5 relative overflow-hidden">
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
                <p className="text-[var(--text-primary)] text-3xl font-black font-mono tabular-nums leading-none">
                  {stats.progress}<span className="text-lg ml-0.5 text-[var(--text-secondary)]">%</span>
                </p>
              </div>
            </div>
          </div>

          <div className="reveal-up delay-300">
            <StatsGrid
              unlockedCount={stats.unlocked}
              totalCount={stats.total}
              progress={stats.progress}
            />
          </div>

          <div className="reveal-fade delay-400 pt-0.5">
            <div className="flex items-center gap-3">
              <span className="overview-kicker">Prioridades</span>
              <div className="flex-1 overview-subtle-divider" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 reveal-up delay-400" style={deferredSectionStyle}>
            <CriticalNodesPanel critical={snapshot.criticalNodes} />
            <RecentActivityFeed initialPage={recentActivity} isBootstrapLoading={isBootstrapLoading} />
          </div>

          <div className="reveal-fade delay-500 pt-0.5">
            <div className="flex items-center gap-3">
              <span className="overview-kicker">Análises</span>
              <div className="flex-1 overview-subtle-divider" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 reveal-up delay-500" style={deferredSectionStyle}>
            <LazyMount minHeight={330}>
              <CategoryChart data={snapshot.categoryData} />
            </LazyMount>
            <LazyMount minHeight={330}>
              <TreeDepthChart data={snapshot.depthData} maxGapLevel={snapshot.maxGapLevel} />
            </LazyMount>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 reveal-up delay-500" style={deferredSectionStyle}>
            <div className="lg:col-span-2">
              <LazyMount minHeight={360}>
                <JournalActivityChart />
              </LazyMount>
            </div>
            <LazyMount minHeight={360}>
              <LibraryStatsPanel stats={libraryStats} isBootstrapLoading={isBootstrapLoading} />
            </LazyMount>
          </div>
        </div>
      </main>
    </div>
  );
}
