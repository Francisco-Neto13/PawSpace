'use client';
import { useMemo } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { SkillNode } from '@/contexts/NexusContext';
import { BookOpen, Zap } from 'lucide-react';

interface Props { nodes: SkillNode[] }

function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d atrás`;
  if (hours > 0) return `${hours}h atrás`;
  if (mins > 0) return `${mins}m atrás`;
  return 'agora';
}

export default function RecentActivityFeed({ nodes }: Props) {
  const { entries } = useJournal();

  const items = useMemo(() => {
    const journalItems = entries.slice(0, 4).map(e => ({
      type: 'journal' as const,
      id: e.id,
      title: e.title || 'Sem título',
      date: e.createdAt,
    }));

    const unlockedNodes = nodes
      .filter(n => n.data.isUnlocked && n.data.updatedAt)
      .sort((a, b) => new Date(b.data.updatedAt as string).getTime() - new Date(a.data.updatedAt as string).getTime())
      .slice(0, 4)
      .map(n => ({
        type: 'skill' as const,
        id: n.id,
        title: n.data.label || n.data.name,
        icon: n.data.icon ?? '🔹',
        date: n.data.updatedAt as string,
      }));

    return [...journalItems, ...unlockedNodes]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [entries, nodes]);

  return (
    <div className="border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c8b89a]/20 to-transparent" />
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#c8b89a] mb-1 flex items-center gap-2">
        <span className="w-1 h-3 bg-[#c8b89a] inline-block" />
        Atividade Recente
      </p>
      <p className="text-[9px] text-zinc-600 mb-6 ml-3">journal e skills desbloqueados</p>

      {items.length === 0 ? (
        <p className="text-[9px] text-zinc-700 ml-3">Nenhuma atividade registrada ainda.</p>
      ) : (
        <div className="space-y-1">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0 group">
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                {item.type === 'journal'
                  ? <BookOpen size={11} className="text-[#c8b89a] opacity-60" />
                  : <span className="text-sm">{(item as any).icon}</span>
                }
              </div>
              <span className="text-[10px] text-zinc-400 font-medium flex-1 truncate group-hover:text-zinc-200 transition-colors">
                {item.title}
              </span>
              <span className="text-[8px] text-zinc-700 font-mono shrink-0">
                {timeAgo(item.date)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}