'use client';
import { memo, useMemo, useState, useEffect } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { SkillNode } from '@/contexts/NexusContext';
import { BookOpen } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';

interface Props { nodes: SkillNode[] }

function timeAgo(date: string | Date): string {
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (mins  > 0) return `${mins}m`;
  return 'agora';
}

type ActivityItem =
  | { type: 'journal'; id: string; title: string; date: string }
  | { type: 'skill';   id: string; title: string; icon: string; date: string };

function RecentActivityFeed({ nodes }: Props) {
  const { entries } = useJournal();
  const [filter, setFilter] = useState<'all' | 'journal' | 'skill'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const allItems = useMemo<ActivityItem[]>(() => {
    const journalItems: ActivityItem[] = entries.slice(0, 6).map(e => ({
      type:  'journal',
      id:    e.id,
      title: e.title || 'Sem título',
      date:  typeof e.createdAt === 'string' ? e.createdAt : new Date(e.createdAt).toISOString(),
    }));

    const skillItems: ActivityItem[] = nodes
      .filter(n => n.data.updatedAt)
      .sort((a, b) =>
        new Date(b.data.updatedAt as string).getTime() -
        new Date(a.data.updatedAt as string).getTime()
      )
      .slice(0, 6)
      .map(n => ({
        type:  'skill',
        id:    n.id,
        title: n.data.label || n.data.name,
        icon:  n.data.icon ?? '*',
        date:  n.data.updatedAt as string,
      }));

    return [...journalItems, ...skillItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [entries, nodes]);

  const filtered = useMemo(() => {
    if (filter === 'all') return allItems;
    return allItems.filter(i => i.type === filter);
  }, [allItems, filter]);

  const { journalCount, skillCount } = useMemo(() => ({
    journalCount: allItems.filter(i => i.type === 'journal').length,
    skillCount: allItems.filter(i => i.type === 'skill').length,
  }), [allItems]);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
        Atividade Recente
      </p>
      <p className="text-[9px] text-zinc-400 mb-4 ml-3">diário e módulos atualizados</p>

      <div className="flex gap-1 mb-4 ml-3">
        {([
          ['all',     'Tudo',    allItems.length],
          ['journal', 'Diário',  journalCount],
          ['skill',   'Módulos', skillCount],
        ] as const).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="text-[8px] font-black uppercase tracking-wider px-2 py-1 border transition-all duration-200"
            style={{
              borderColor:     filter === key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
              color:           filter === key ? 'rgba(255,255,255,0.8)' : '#a1a1aa',
              backgroundColor: filter === key ? 'rgba(255,255,255,0.04)' : 'transparent',
            }}
          >
            {label} <span className="opacity-50">{count}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[9px] text-zinc-500 ml-3">Nenhuma patinha por aqui ainda.</p>
      ) : (
        <div>
          {filtered.map((item, i) => {
            const isJournal = item.type === 'journal';
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2.5 border-b border-white/[0.03] last:border-0 group"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateX(0)' : 'translateX(-6px)',
                  transition: `opacity 0.4s ease ${i * 40}ms, transform 0.4s ease ${i * 40}ms`,
                }}
              >
                <div
                  className="w-6 h-6 flex items-center justify-center shrink-0 border transition-colors duration-200"
                  style={{
                    borderColor:     isJournal ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                    backgroundColor: isJournal ? 'rgba(255,255,255,0.04)' : 'transparent',
                  }}
                >
                  {isJournal
                    ? <BookOpen size={10} className="text-white/60 group-hover:text-white/80 transition-colors" />
                    : <span className="text-xs leading-none">{(item as any).icon}</span>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="text-[7px] font-black uppercase tracking-wider"
                      style={{ color: isJournal ? 'rgba(255,255,255,0.6)' : '#a1a1aa' }}
                    >
                      {isJournal ? 'Diário' : 'Módulo'}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium truncate block group-hover:text-zinc-200 transition-colors duration-200">
                    {item.title}
                  </span>
                </div>

                <span className="text-[8px] text-zinc-500 font-mono shrink-0 group-hover:text-zinc-300 transition-colors">
                  {timeAgo(item.date)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(RecentActivityFeed);
