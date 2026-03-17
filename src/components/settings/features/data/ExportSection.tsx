'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

const EXPORT_ITEMS = [
  { key: 'tree', label: 'Árvore do PawSpace', sub: 'módulos e conexões em JSON' },
  { key: 'journal', label: 'Diário', sub: 'todas as notas em JSON' },
  { key: 'library', label: 'Estante', sub: 'materiais e links em JSON' },
  { key: 'all', label: 'Tudo', sub: 'backup completo do espaço' },
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
  if (scope === 'tree') return 'Falha ao exportar árvore.';
  if (scope === 'journal') return 'Falha ao exportar diário.';
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
        Mochila de Backup
      </p>
      <p className="library-subtitle mb-5 ml-3">leve uma cópia do seu PawSpace em formato JSON</p>

      <div className="space-y-2">
        {EXPORT_ITEMS.map((item) => {
          const isLoading = loading === item.key;
          return (
            <div
              key={item.key}
              className="group flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 transition-colors hover:border-[var(--border-muted)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="sidebar-title text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  {item.label}
                </p>
                <p className="ui-meta uppercase mt-0.5">{item.sub}</p>
              </div>
              <button
                onClick={() => void handleExport(item.key)}
                disabled={!!loading}
                className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border-muted)] button-label text-[var(--text-muted)] transition-all duration-200 hover:border-[var(--border-visible)] hover:text-[var(--text-primary)] disabled:opacity-40 sm:w-auto"
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
