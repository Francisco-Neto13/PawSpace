'use client';
import { Zap, Target, Layout } from 'lucide-react';

export default function StatsGrid({ unlockedCount, totalCount, progress }: any) {
  const stats = [
    { 
      label: 'Nós Concluídos', 
      value: unlockedCount, 
      sub: `de ${totalCount} no roadmap`, 
      icon: Zap, 
      color: 'text-amber-400' 
    },
    { 
      label: 'Aproveitamento', 
      value: `${progress}%`, 
      sub: 'Total Dominado', 
      icon: Target, 
      color: 'text-[#c8b89a]' 
    },
    { 
      label: 'Nós Pendentes', 
      value: totalCount - unlockedCount, 
      sub: 'Aguardando ação', 
      icon: Layout, 
      color: 'text-zinc-500' 
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((item) => (
        <div 
          key={item.label} 
          className="group relative p-[1px] rounded-sm overflow-hidden bg-white/5 hover:bg-gradient-to-br hover:from-[#c8b89a]/30 hover:to-transparent transition-all duration-500"
        >
          <div className="relative bg-[#0d0d0f] p-8 h-full w-full flex flex-col justify-between overflow-hidden">
            
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_6px]" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <item.icon size={20} className={`${item.color} opacity-80 group-hover:opacity-100 transition-all`} />
                <div className="h-px w-8 bg-white/10 mt-2.5" />
              </div>
              
              <div className="text-4xl font-black text-white mb-2 tracking-tighter font-mono">
                {item.value}
              </div>
              
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#c8b89a] uppercase tracking-[0.2em] mb-1">
                  {item.label}
                </span>
                <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-tight italic">
                  // {item.sub}
                </span>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-[#c8b89a]/5 blur-2xl group-hover:bg-[#c8b89a]/10 transition-all duration-700" />
          </div>
        </div>
      ))}
    </section>
  );
}