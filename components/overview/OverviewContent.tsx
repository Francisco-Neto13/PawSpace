'use client';
import { useMemo } from 'react';
import OverviewHeader from './OverviewHeader';
import StatsGrid from './StatsGrid';
import { useNexus } from '@/contexts/NexusContext';

interface OverviewContentProps {
  initialData: {
    total: number;
    unlocked: number;
    progress: number;
  };
}

export default function OverviewContent({ initialData }: OverviewContentProps) {
  const { nodes, isLoading } = useNexus();

  const treeStats = useMemo(() => {
    if (!nodes || nodes.length === 0) return initialData;

    const unlockedCount = nodes.reduce((acc, skill) => 
      skill.data?.isUnlocked ? acc + 1 : acc, 0
    );
    
    const totalCount = nodes.length;
    
    return {
      total: totalCount,
      unlocked: unlockedCount,
      progress: totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0,
    };
  }, [nodes, initialData]);

  return (
    <div className="relative min-h-screen w-full bg-[#030304] overflow-x-hidden flex flex-col">
      
      {isLoading && nodes.length === 0 && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#030304]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#c8b89a06_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
          </div>
          <div className="relative flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#c8b89a]/20 border-t-[#c8b89a] rounded-full animate-spin" />
            <p className="text-[#c8b89a] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
              Sincronizando Nexus...
            </p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#c8b89a06_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto p-6 space-y-10 w-full flex-1">
        <header className="space-y-2 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-[#c8b89a]" />
            <h2 className="text-[#c8b89a] text-[10px] font-black uppercase tracking-[0.4em]">
              Roadmap / Overview de Estudos
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#c8b89a]/20 to-transparent" />
          </div>
        </header>

        <section className="space-y-10">
          <OverviewHeader 
            initialProgress={treeStats.progress} 
            unlockedCount={treeStats.unlocked} 
            totalCount={treeStats.total} 
          />
          <StatsGrid 
            unlockedCount={treeStats.unlocked} 
            totalCount={treeStats.total} 
            progress={treeStats.progress} 
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
          <article className="lg:col-span-2 p-8 border border-white/5 bg-white/[0.02] rounded-sm relative group overflow-hidden">
            <h3 className="text-[#c8b89a] text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#c8b89a] shadow-[0_0_8px_#c8b89a]" />
              Resumo do Currículo
            </h3>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="text-zinc-300 text-sm leading-relaxed max-w-xl font-normal">
                <p>
                  Atualmente, você domina <span className="text-white font-bold">{treeStats.unlocked} módulos</span>.
                  Isso representa <span className="text-[#c8b89a] font-black">{treeStats.progress}%</span> do seu planejamento.
                  Faltam <span className="text-zinc-100 font-semibold">{treeStats.total - treeStats.unlocked} tecnologias</span> para a maestria total do sistema.
                </p>
              </div>

              <div className="flex gap-8 shrink-0 font-mono">
                <div className="text-right">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Total</p>
                  <p className="text-white text-3xl font-black tabular-nums">{treeStats.total}</p>
                </div>
                <div className="w-[1px] bg-white/10" />
                <div className="text-right">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Concluídos</p>
                  <p className="text-[#c8b89a] text-3xl font-black tabular-nums">{treeStats.unlocked}</p>
                </div>
              </div>
            </div>
          </article>

          {/* Side Card - Próxima Meta (AJUSTADO PARA LEITURA) */}
          <aside className="flex flex-col justify-center p-8 border border-[#c8b89a]/20 bg-gradient-to-br from-[#c8b89a]/[0.05] to-transparent rounded-sm text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10 font-mono text-[40px] font-black select-none pointer-events-none">
              NEX
            </div>
            
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-5">Próxima Meta</p>
            
            <div className="py-2.5 px-5 border border-[#c8b89a]/30 bg-black/60 inline-block mx-auto mb-4 backdrop-blur-sm">
              <p className="text-[#c8b89a] font-black text-xs uppercase tracking-wider">
                {treeStats.progress < 100 ? 'Expandir Árvore' : 'Sistema Completo'}
              </p>
            </div>
            
            <p className="text-[11px] text-zinc-500 font-mono tracking-normal leading-tight">
              {treeStats.total - treeStats.unlocked > 0 
                ? `${treeStats.total - treeStats.unlocked} passos pendentes para evolução`
                : "Protocolo de treinamento finalizado."}
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}