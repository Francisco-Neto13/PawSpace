'use client';
import { useMemo, useState, useEffect } from 'react';
import { useNexus } from '@/shared/contexts/NexusContext';
import OverviewHeader from './ui/OverviewHeader';
import StatsGrid from './features/stats/StatsGrid';
import CategoryChart from './features/stats/CategoryChart';
import TreeDepthChart from './features/stats/TreeDepthChart';
import CriticalNodesPanel from './features/insights/CriticalNodesPanel';
import JournalActivityChart from './features/activity/JournalActivityChart';
import LibraryStatsPanel from './features/insights/LibraryStatsPanel';
import RecentActivityFeed from './features/activity/RecentActivityFeed';

interface OverviewContentProps {
  initialData: {
    total: number;
    unlocked: number;
    progress: number;
  };
}

export default function OverviewContent({ initialData }: OverviewContentProps) {
  const { nodes, edges, isLoading } = useNexus();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(() => {
    if (!nodes || nodes.length === 0) return initialData;
    const unlocked = nodes.filter(n => n.data?.isUnlocked).length;
    const total = nodes.length;
    return {
      total,
      unlocked,
      progress: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    };
  }, [nodes, initialData]);

  if (isLoading && nodes.length === 0) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#030304]">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#c8b89a06_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-7 h-7 border-2 border-[#c8b89a]/20 border-t-[#c8b89a] rounded-full animate-spin" />
          <p className="text-[#c8b89a] text-[9px] font-black uppercase tracking-[0.5em] animate-pulse">
            Sincronizando Nexus...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full bg-[#030304] overflow-x-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#c8b89a05_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_50%,transparent_100%)]" />

      <main className="relative z-10 py-8 space-y-4 pb-20">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-4 bg-[#c8b89a]" />
          <span className="text-[#c8b89a] text-[9px] font-black uppercase tracking-[0.4em]">
            Nexus / Overview
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#c8b89a]/15 to-transparent" />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoryChart nodes={nodes} />
          <TreeDepthChart nodes={nodes} edges={edges} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <JournalActivityChart />
          </div>
          <LibraryStatsPanel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CriticalNodesPanel nodes={nodes} edges={edges} />
          <RecentActivityFeed nodes={nodes} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
          <div className="lg:col-span-2 border border-white/[0.06] bg-white/[0.02] p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c8b89a]/20 to-transparent" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#c8b89a] mb-6 flex items-center gap-2">
              <span className="w-1 h-3 bg-[#c8b89a] inline-block" />
              Resumo do Currículo
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <p className="text-zinc-400 text-sm leading-relaxed font-light max-w-sm">
                Você domina{' '}
                <span className="text-white font-bold">{stats.unlocked} módulos</span>,
                representando{' '}
                <span className="text-[#c8b89a] font-black">{stats.progress}%</span>{' '}
                do planejamento. Faltam{' '}
                <span className="text-zinc-200 font-semibold">{stats.total - stats.unlocked} tecnologias</span>{' '}
                para maestria total.
              </p>
              <div className="flex gap-6 shrink-0 font-mono">
                <div className="text-right">
                  <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-white text-3xl font-black tabular-nums">{stats.total}</p>
                </div>
                <div className="w-[1px] bg-white/[0.06]" />
                <div className="text-right">
                  <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Concluídos</p>
                  <p className="text-[#c8b89a] text-3xl font-black tabular-nums">{stats.unlocked}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-[#c8b89a]/15 bg-[#c8b89a]/[0.02] p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c8b89a]/25 to-transparent" />
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-4">Próxima Meta</p>
            <div className="flex-1 flex flex-col items-start justify-center gap-3">
              <div className="border border-[#c8b89a]/20 px-3 py-1.5 bg-black/40">
                <p className="text-[#c8b89a] text-[10px] font-black uppercase tracking-wider">
                  {stats.progress < 100 ? 'Expandir Árvore' : 'Sistema Completo'}
                </p>
              </div>
              <p className="text-[10px] text-zinc-600 font-mono leading-snug">
                {stats.total - stats.unlocked > 0
                  ? `${stats.total - stats.unlocked} passos pendentes`
                  : 'Protocolo finalizado.'}
              </p>
            </div>
            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#c8b89a]/15" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#c8b89a]/15" />
          </div>
        </div>
      </main>
    </div>
  );
}
