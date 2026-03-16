'use client';
import { Loader2 } from 'lucide-react';
import { Content, ContentType } from '../../types';
import { TYPE_CONFIG } from '../../constants';
import { ContentCard } from '../../ui/ContentCard';
import { EmptyState } from '../../ui/EmptyState';

interface LibraryContentListProps {
  contents: Content[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export function LibraryContentList({
  contents,
  isLoading,
  onDelete,
  onAdd,
}: LibraryContentListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 size={20} className="text-[var(--text-secondary)] animate-spin" />
        <p className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest">
          Abrindo a estante...
        </p>
      </div>
    );
  }

  if (contents.length === 0) {
    return <EmptyState onAdd={onAdd} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {(['link', 'video', 'pdf', 'note'] as ContentType[]).map((type) => {
        const items = contents.filter((c) => c.type === type);
        if (items.length === 0) return null;
        const cfg = TYPE_CONFIG[type];
        return (
          <section
            key={type}
            className="library-panel p-4 md:p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2" style={{ color: cfg.color }}>
                {cfg.icon}
                <span className="text-[9px] font-black uppercase tracking-[0.28em]">{cfg.label}s</span>
              </div>
              <div
                className="h-[1px] flex-1"
                style={{ background: `linear-gradient(to right, ${cfg.color}35, transparent)` }}
              />
              <span className="library-chip">{items.length}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {items.map((c) => (
                <ContentCard key={c.id} content={c} onDelete={onDelete} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
