'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { usePawSpace } from '@/shared/contexts/PawSpaceContext';
import { useOverview } from '@/shared/contexts/OverviewContext';
import { useJournal } from '@/contexts/JournalContext';
import OverviewHeader from '../ui/OverviewHeader';
import StatsGrid from '../features/stats/StatsGrid';
import CriticalNodesPanel from '../features/insights/CriticalNodesPanel';
import RecentActivityFeed from '../features/activity/RecentActivityFeed';
import { PawIcon } from '@/components/shared/PawIcon';
import { PageBackground } from '@/components/shared/PageBackground';
import { WorkspaceEmptyState } from '@/components/shared/WorkspaceEmptyState';
import LazyMount from '../ui/LazyMount';
import { buildOverviewSnapshot } from '../lib/overviewMetrics';

const deferredSectionStyle = {
  contentVisibility: 'auto' as const,
  containIntrinsicSize: '1px 700px',
};

const EMPTY_OVERVIEW_SUMMARY = { total: 0, unlocked: 0, progress: 0 };

function ChartLoadingCard({ message }: { message: string }) {
  return (
    <div className="h-full overview-card overview-card-hover p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
      <p className="field-label text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

const CategoryChart = dynamic(() => import('../features/stats/CategoryChart'), {
  ssr: false,
  loading: () => <ChartLoadingCard message="Carregando categorias..." />,
});

const TreeDepthChart = dynamic(() => import('../features/stats/TreeDepthChart'), {
  ssr: false,
  loading: () => <ChartLoadingCard message="Carregando profundidade..." />,
});

const JournalActivityChart = dynamic(() => import('../features/activity/JournalActivityChart'), {
  ssr: false,
  loading: () => <ChartLoadingCard message="Carregando atividade..." />,
});

const LibraryStatsPanel = dynamic(() => import('../features/insights/LibraryStatsPanel'), {
  ssr: false,
  loading: () => <ChartLoadingCard message="Carregando estante..." />,
});

export default function OverviewContent() {
  const { nodes, edges, isLoading } = usePawSpace();
  const { bootstrap, isLoading: isBootstrapLoading, refreshOverview } = useOverview();
  const { entries } = useJournal();

  useEffect(() => {
    void refreshOverview({ force: true });
  }, [refreshOverview]);

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
          <p className="button-label text-[var(--text-primary)] animate-pulse">
            Sincronizando PawSpace...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoading && nodes.length === 0) {
    return (
      <WorkspaceEmptyState
        title="Painel sem pegadas"
        description="Crie sua árvore para abrir o radar do seu território de estudos."
        actionLabel="Ir para a árvore"
        actionHref="/tree"
      />
    );
  }

  const pending = stats.total - stats.unlocked;
  const nextAction = (() => {
    if (pending <= 0) {
      return {
        title: 'Cobertura completa atingida',
        body: 'Todas as trilhas já têm material. Agora vale revisar, atualizar e podar o que ficou antigo.',
        tag: 'Manutenção',
      };
    }
    if (criticalUncovered > 0) {
      return {
        title: `${criticalUncovered} trilha${criticalUncovered > 1 ? 's críticas sem' : ' crítica sem'} material`,
        body: 'Comece por elas. Essas trilhas sustentam mais avanços no mapa do que trilhas isoladas.',
        tag: 'Prioridade',
      };
    }
    return {
      title: `${pending} trilha${pending > 1 ? 's aguardando' : ''} material`,
      body: 'Avance por área para manter a estante equilibrada em todo o mapa.',
      tag: 'Próxima passada',
    };
  })();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <PageBackground src="/backgrounds/pages/cat.webp" />

      <main className="relative z-10 py-8 pb-20">
        <div className="relative mx-auto max-w-6xl space-y-5 px-4 sm:px-6 xl:max-w-7xl xl:px-10 2xl:max-w-[1600px] 2xl:px-16">

          <div className="flex items-center gap-3 reveal-fade delay-0">
            <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
            <span className="app-breadcrumb">
              PawSpace / Painel
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border-subtle)] to-transparent" />
          </div>

          <div className="reveal-up delay-100 deferred-section">
            <OverviewHeader
              initialProgress={stats.progress}
              unlockedCount={stats.unlocked}
              totalCount={stats.total}
              criticalUncovered={criticalUncovered}
              currentMonthEntries={currentMonthEntries}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 reveal-up delay-200 deferred-section" style={deferredSectionStyle}>
            <div className="lg:col-span-2 overview-card overview-card-hover p-7 relative overflow-hidden render-isolate">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
              <div className="flex items-center justify-between mb-4">
                <p className="overview-kicker text-[var(--text-primary)] flex items-center gap-2">
                  <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
                  Próxima passada
                </p>
                <span className="overview-chip">
                  {nextAction.tag}
                </span>
              </div>
              <h3 className="surface-title mb-2">
                {nextAction.title}
              </h3>
              <p className="overview-subtitle max-w-2xl">
                {nextAction.body}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="overview-chip">Pendentes: {pending}</span>
                <span className="overview-chip">Críticas: {criticalUncovered}</span>
                <span className="overview-chip">Cobertura: {stats.progress}%</span>
              </div>
            </div>

            <div className="overview-card overview-card-hover p-6 flex flex-col justify-center gap-5 relative overflow-hidden render-isolate">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
              <div>
                <p className="data-label mb-1">Trilhas no mapa</p>
                <p className="metric-value font-mono tabular-nums">{stats.total}</p>
              </div>
              <div className="w-full h-px bg-[var(--border-subtle)]" />
              <div>
                <p className="data-label mb-1">Com material</p>
                <p className="metric-value font-mono tabular-nums">{stats.unlocked}</p>
              </div>
              <div className="w-full h-px bg-[var(--border-subtle)]" />
              <div>
                <p className="data-label mb-1">Cobertura</p>
                <p className="metric-value font-mono tabular-nums">
                  {stats.progress}<span className="text-sm ml-0.5 text-[var(--text-secondary)]">%</span>
                </p>
              </div>
            </div>
          </div>

          <div className="reveal-up delay-300 deferred-section">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 reveal-up delay-400 deferred-section" style={deferredSectionStyle}>
            <LazyMount minHeight={440}>
              <CriticalNodesPanel critical={snapshot.criticalNodes} />
            </LazyMount>
            <LazyMount minHeight={440}>
              <RecentActivityFeed initialPage={recentActivity} isBootstrapLoading={isBootstrapLoading} />
            </LazyMount>
          </div>

          <div className="reveal-fade delay-500 pt-0.5">
            <div className="flex items-center gap-3">
              <span className="overview-kicker">Leituras do mapa</span>
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
