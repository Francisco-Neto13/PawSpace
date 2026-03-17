'use client';
import { ExternalLink, Clock, Trash2 } from 'lucide-react';
import { Content } from '../types';
import { TYPE_CONFIG } from '../constants';
import { useConfirmDialog } from '@/shared/contexts/ConfirmDialogContext';

interface ContentCardProps {
  content: Content;
  onDelete?: (id: string) => void;
}

export function ContentCard({ content, onDelete }: ContentCardProps) {
  const cfg = TYPE_CONFIG[content.type];
  const confirmDialog = useConfirmDialog();
  const parsedDate = new Date(content.createdAt);
  const formattedDate = Number.isNaN(parsedDate.getTime())
    ? content.createdAt
    : parsedDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

  const handleDelete = async () => {
    const isConfirmed = await confirmDialog({
      title: 'Remover material',
      description: `Este material será retirado da estante: "${content.title}".`,
      confirmLabel: 'Remover',
      cancelLabel: 'Manter',
      tone: 'danger',
    });
    if (!isConfirmed) return;
    onDelete?.(content.id);
  };

  return (
    <article className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition-all duration-200 hover:border-[var(--border-visible)] hover:bg-[var(--bg-elevated)] sm:flex-row sm:items-start sm:gap-4">
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: cfg.color }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to right, ${cfg.color}33, transparent)` }}
      />
      <div
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
        style={{ borderColor: `${cfg.color}30`, backgroundColor: `${cfg.color}0d`, color: cfg.color }}
      >
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1.5 flex items-start justify-between gap-3">
          <p className="sidebar-title leading-tight">{content.title}</p>
          <div className="flex items-center gap-2.5 shrink-0 mt-0.5">
            {content.url && (
              <a
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-7 w-7 rounded-lg border border-transparent flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                <ExternalLink size={13} />
              </a>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="h-7 w-7 rounded-lg border border-transparent flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
        {content.body && (
          <p className="ui-copy text-sm mb-2.5 line-clamp-2">
            {content.body}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
          <span
            className="data-label px-2 py-1 border rounded-lg"
            style={{ color: cfg.color, borderColor: `${cfg.color}30`, backgroundColor: `${cfg.color}0d` }}
          >
            {cfg.label}
          </span>
          <span className="ui-meta font-mono flex items-center gap-1.5">
            <Clock size={9} />
            {formattedDate}
          </span>
        </div>
      </div>
    </article>
  );
}
