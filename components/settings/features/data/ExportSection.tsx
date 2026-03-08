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
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
        Exportar Dados
      </p>
      <p className="text-[9px] text-[var(--text-muted)] mb-6 ml-3">baixe seus dados em formato JSON</p>

      <div className="space-y-2">
        {EXPORT_ITEMS.map(item => {
          const isLoading = loading === item.key;
          return (
            <div
              key={item.key}
              className="flex items-center justify-between px-4 py-3 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-elevated)] group hover:border-[var(--border-muted)] transition-colors"
            >
              <div>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider group-hover:text-[var(--text-primary)] transition-colors">
                  {item.label}
                </p>
                <p className="text-[8px] text-[var(--text-faint)] uppercase tracking-wider font-bold mt-0.5">
                  {item.sub}
                </p>
              </div>
              <button
                onClick={() => handleExport(item.key)}
                disabled={!!loading}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-muted)] text-[8px] font-black uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-all duration-200 disabled:opacity-40"
              >
                {isLoading ? (
                  <div className="w-2.5 h-2.5 border border-[var(--border-visible)] border-t-[var(--text-primary)] rounded-full animate-spin" />
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
