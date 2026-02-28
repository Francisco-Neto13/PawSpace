'use client';
import { Loader2 } from 'lucide-react';
import { Content, ContentType } from '../../types';
import { TYPE_CONFIG } from '../../constants';
import { ContentCard } from '../../ui/ContentCard';
import { EmptyState } from '../../ui/EmptyState';


interface BibliotecaContentListProps {
  contents: Content[];
  isLoading: boolean;
  isUnlocked: boolean;
  search: string;
}

export function BibliotecaContentList({
  contents,
  isLoading,
  isUnlocked,
  search,
}: BibliotecaContentListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 size={20} className="text-[#c8b89a]/40 animate-spin" />
        <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">
          Carregando conteúdos...
        </p>
      </div>
    );
  }

  if (!isUnlocked || contents.length === 0) {
    return <EmptyState nodeUnlocked={isUnlocked} />;
  }

  if (contents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">
          Nenhum resultado para "{search}"
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {(['link', 'video', 'pdf', 'note'] as ContentType[]).map(type => {
        const items = contents.filter(c => c.type === type);
        if (items.length === 0) return null;
        const cfg = TYPE_CONFIG[type];
        return (
          <div key={type}>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-2" style={{ color: cfg.color }}>
                {cfg.icon}
                <span className="text-[9px] font-black uppercase tracking-[0.35em]">{cfg.label}s</span>
              </div>
              <div
                className="h-[1px] flex-1"
                style={{ background: `linear-gradient(to right, ${cfg.color}25, transparent)` }}
              />
              <span className="text-[9px] text-zinc-700 font-mono">{items.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {items.map(c => <ContentCard key={c.id} content={c} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}