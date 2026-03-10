'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

const EXPORT_ITEMS = [
  { key: 'tree', label: 'Arvore de Conhecimento', sub: 'nodes e conexoes em JSON' },
  { key: 'journal', label: 'Diario', sub: 'todas as entradas em JSON' },
  { key: 'library', label: 'Biblioteca', sub: 'conteudos e links em JSON' },
  { key: 'all', label: 'Tudo', sub: 'exportacao completa' },
] as const;

type ExportKey = (typeof EXPORT_ITEMS)[number]['key'];

function getFileNameFromResponse(response: Response, fallbackScope: ExportKey) {
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="([^"]+)"/i);
  if (match?.[1]) return match[1];

  const fileDate = new Date().toISOString().slice(0, 10);
  return `pawspace-${fallbackScope}-${fileDate}.json`;
}

function getExportErrorMessage(scope: ExportKey) {
  if (scope === 'tree') return 'Falha ao exportar arvore.';
  if (scope === 'journal') return 'Falha ao exportar diario.';
  if (scope === 'library') return 'Falha ao exportar biblioteca.';
  return 'Falha ao exportar dados completos.';
}

export default function ExportSection() {
  const [loading, setLoading] = useState<ExportKey | null>(null);

  const handleExport = async (key: ExportKey) => {
    setLoading(key);

    try {
      const response = await fetch(`/api/export?scope=${key}`, { method: 'GET' });
      if (!response.ok) {
        const fallback = getExportErrorMessage(key);
        try {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || fallback);
        } catch {
          throw new Error(fallback);
        }
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const fileName = getFileNameFromResponse(response, key);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : getExportErrorMessage(key);
      window.alert(message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="library-panel p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <p className="library-kicker mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
        Exportar Dados
      </p>
      <p className="library-subtitle mb-5 ml-3">baixe seus dados em formato JSON</p>

      <div className="space-y-2">
        {EXPORT_ITEMS.map((item) => {
          const isLoading = loading === item.key;
          return (
            <div
              key={item.key}
              className="flex items-center justify-between px-4 py-3 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-elevated)] group hover:border-[var(--border-muted)] transition-colors"
            >
              <div>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider group-hover:text-[var(--text-primary)] transition-colors">
                  {item.label}
                </p>
                <p className="text-[8px] text-[var(--text-faint)] uppercase tracking-wider font-bold mt-0.5">{item.sub}</p>
              </div>
              <button
                onClick={() => void handleExport(item.key)}
                disabled={!!loading}
                className="h-8 px-3 rounded-lg flex items-center gap-1.5 border border-[var(--border-muted)] text-[8px] font-black uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-all duration-200 disabled:opacity-40"
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
    </section>
  );
}
