'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

const EXPORT_ITEMS = [
  { key: 'tree',    label: 'Árvore de Conhecimento', sub: 'nodes e conexões em JSON' },
  { key: 'journal', label: 'Diário',                 sub: 'todas as entradas em JSON' },
  { key: 'library', label: 'Biblioteca',             sub: 'conteúdos e links em JSON' },
  { key: 'all',     label: 'Tudo',                   sub: 'exportação completa'       },
];

export default function ExportSection() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = (key: string) => {
    setLoading(key);
    setTimeout(() => setLoading(null), 1500);
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
        Exportar Dados
      </p>
      <p className="text-[9px] text-zinc-500 mb-6 ml-3">baixe seus dados em formato JSON</p>

      <div className="space-y-2">
        {EXPORT_ITEMS.map(item => {
          const isLoading = loading === item.key;
          return (
            <div
              key={item.key}
              className="flex items-center justify-between px-4 py-3 border border-white/[0.05] rounded-lg bg-black/20 group hover:border-white/10 transition-colors"
            >
              <div>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider group-hover:text-white/90 transition-colors">
                  {item.label}
                </p>
                <p className="text-[8px] text-zinc-600 uppercase tracking-wider font-bold mt-0.5">
                  {item.sub}
                </p>
              </div>
              <button
                onClick={() => handleExport(item.key)}
                disabled={!!loading}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.08] text-[8px] font-black uppercase tracking-wider text-zinc-500 hover:text-white/70 hover:border-white/15 transition-all duration-200 disabled:opacity-40"
              >
                {isLoading ? (
                  <div className="w-2.5 h-2.5 border border-white/30 border-t-white/70 rounded-full animate-spin" />
                ) : (
                  <Download size={9} />
                )}
                {isLoading ? 'Gerando...' : 'Exportar'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}