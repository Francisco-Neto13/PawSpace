'use client';
import { useMemo, useState, useEffect, useCallback } from 'react';
import OverviewHeader from './OverviewHeader';
import StatsGrid from './StatsGrid';
import { getSkillsSummary as getSkills } from '@/app/actions/skills';
import { createClient } from '@/utils/supabase/client';
import { SkillData } from '../tree/types';

const supabase = createClient();

interface OverviewContentProps {
  initialData: {
    total: number;
    unlocked: number;
    progress: number;
  };
}

export default function OverviewContent({ initialData }: OverviewContentProps) {
  const [rawSkills, setRawSkills] = useState<SkillData[]>([]);
  
  const [isLoading, setIsLoading] = useState(!initialData);

  const loadStats = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const data = await getSkills(session.user.id);
      
      if (data && data.length > 0) {
        setRawSkills(data as unknown as SkillData[]);
      }
    } catch (e) {
      console.error('Erro ao sincronizar Nexus:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const treeStats = useMemo(() => {
    if (rawSkills.length === 0) return initialData;

    const unlockedCount = rawSkills.reduce((acc, skill) => skill.isUnlocked ? acc + 1 : acc, 0);
    const totalCount = rawSkills.length;
    const progress = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    return {
      progress,
      total: totalCount,
      unlocked: unlockedCount,
    };
  }, [rawSkills, initialData]);

  return (
    <div className="relative min-h-screen w-full bg-[#030304] overflow-x-hidden flex flex-col">
      
      {isLoading && rawSkills.length === 0 && !initialData && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#030304]/90 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#c8b89a]/20 border-t-[#c8b89a] rounded-full animate-spin" />
            <p className="text-[#c8b89a] text-[10px] font-black uppercase tracking-[0.4em]">
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
              <div className="text-zinc-400 text-sm leading-relaxed max-w-xl font-light">
                <p>
                  Atualmente, você domina <span className="text-white font-bold">{treeStats.unlocked} módulos</span>.
                  Isso representa <span className="text-[#c8b89a] font-bold">{treeStats.progress}%</span> do roadmap.
                  Faltam <span className="text-white font-semibold">{treeStats.total - treeStats.unlocked} tecnologias</span> para a maestria.
                </p>
              </div>

              <div className="flex gap-6 shrink-0 font-mono">
                <div className="text-right">
                  <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-widest">Total</p>
                  <p className="text-white text-2xl font-black">{treeStats.total}</p>
                </div>
                <div className="w-[1px] bg-white/10" />
                <div className="text-right">
                  <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-widest">Concluídos</p>
                  <p className="text-[#c8b89a] text-2xl font-black">{treeStats.unlocked}</p>
                </div>
              </div>
            </div>
          </article>

          <aside className="flex flex-col justify-center p-8 border border-[#c8b89a]/10 bg-gradient-to-br from-[#c8b89a]/[0.04] to-transparent rounded-sm text-center relative">
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-4">Próxima Meta</p>
            <div className="py-2 px-4 border border-[#c8b89a]/20 bg-black/40 inline-block mx-auto mb-3">
              <p className="text-[#c8b89a] font-bold text-xs uppercase">
                {treeStats.progress < 100 ? 'Expandir Árvore' : 'Sistema Completo'}
              </p>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono tracking-tighter">
              {treeStats.total - treeStats.unlocked > 0 
                ? `${treeStats.total - treeStats.unlocked} passos restantes`
                : "Protocolo finalizado."}
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}