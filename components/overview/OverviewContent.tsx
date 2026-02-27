'use client';
import { useMemo, useState, useEffect } from 'react';
import OverviewHeader from './OverviewHeader';
import StatsGrid from './StatsGrid';
import { generateTreeLayout, calculateGlobalProgress, buildHierarchy } from '@/utils/treeUtils';
import { getSkills } from '@/app/actions/skills';
import { createClient } from '@/utils/supabase/client';
import { Node } from '@xyflow/react';
import { SkillData } from '../tree/types';

interface OverviewContentProps {
  initialData: {
    total: number;
    unlocked: number;
    progress: number;
  };
}

export default function OverviewContent({ initialData }: OverviewContentProps) {
  const [nodes, setNodes] = useState<Node<SkillData>[]>([]);
  const [isLoading, setIsLoading] = useState(!initialData);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function loadStats() {
      if (!initialData) setIsLoading(true);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const rawSkills = await getSkills(user.id);
          if (rawSkills && rawSkills.length > 0) {
            const hierarchy = buildHierarchy(rawSkills);
            const { nodes: layoutNodes } = generateTreeLayout(hierarchy);
            setNodes(layoutNodes);
          }
        }
      } catch (e) {
        console.error('Erro ao carregar estatísticas', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, [supabase, initialData]);

  const treeStats = useMemo(() => {
    if (nodes.length === 0) return initialData;
    
    return {
      progress: calculateGlobalProgress(nodes),
      total: nodes.length,
      unlocked: nodes.filter(n => n.data.isUnlocked).length,
    };
  }, [nodes, initialData]);

  return (
    <div className="relative min-h-[calc(100vh-160px)] w-full bg-[#030304] overflow-x-hidden flex flex-col">

      {isLoading && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#030304]/80 backdrop-blur-md pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#c8b89a]/20 border-t-[#c8b89a] rounded-full animate-spin" />
            <p className="text-[#c8b89a] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
              Sincronizando Nexus...
            </p>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#c8b89a]/30 to-transparent" />
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#c8b89a08_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 w-full flex-1">

        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-[#c8b89a] text-[10px] font-black uppercase tracking-[0.4em]">
              Roadmap / Overview de Estudos
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#c8b89a]/30 to-transparent" />
          </div>
          <div className="h-px w-20 bg-[#c8b89a]/40" />
        </header>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
          <div className="lg:col-span-2 p-8 border border-white/5 bg-white/[0.02] rounded-sm relative group">
            <h3 className="text-[#c8b89a] text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#c8b89a] rounded-full shadow-[0_0_8px_#c8b89a]" />
              Resumo do Currículo
            </h3>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="text-zinc-400 text-sm leading-relaxed max-w-xl font-light min-h-[60px]">
                {treeStats.total > 0 ? (
                  <p>
                    Atualmente, você domina{' '}
                    <span className="text-white font-bold">{treeStats.unlocked} módulos</span> fundamentais.
                    Isso representa{' '}
                    <span className="text-[#c8b89a] font-bold">{treeStats.progress}%</span> do roadmap planejado.
                    Faltam{' '}
                    <span className="text-white font-semibold">{treeStats.total - treeStats.unlocked} tecnologias</span> para completar este ciclo de estudos.
                  </p>
                ) : (
                  !isLoading && <p>Nenhuma tecnologia cadastrada na sua árvore no momento.</p>
                )}
              </div>

              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-zinc-600 text-[9px] uppercase font-bold">Total Planejado</p>
                  <p className="text-white text-lg font-black font-mono">{treeStats.total}</p>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div className="text-right">
                  <p className="text-zinc-600 text-[9px] uppercase font-bold">Concluídos</p>
                  <p className="text-[#c8b89a] text-lg font-black font-mono">{treeStats.unlocked}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 border border-[#c8b89a]/10 bg-gradient-to-br from-[#c8b89a]/5 to-transparent rounded-sm text-center group">
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-3 group-hover:text-zinc-400 transition-colors">
              Próxima Meta
            </p>
            <div className="py-2 px-4 border border-[#c8b89a]/20 bg-black/40 inline-block mx-auto mb-2">
              <p className="text-[#c8b89a] font-bold text-xs uppercase tracking-tighter">
                {treeStats.progress < 100 && treeStats.total > 0 ? 'Expandir Árvore' : 'Meta Batida'}
              </p>
            </div>
            <p className="text-[10px] text-zinc-600 italic">Continue o fluxo de pré-requisitos</p>
          </div>
        </div>
      </div>
    </div>
  );
}