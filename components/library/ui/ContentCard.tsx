'use client';
import { ExternalLink, Clock } from 'lucide-react';
import { Content } from '../types';
import { TYPE_CONFIG } from '../constants';

export function ContentCard({ content }: { content: Content }) {
  const cfg = TYPE_CONFIG[content.type];
  return (
    <div className="group flex items-start gap-5 p-6 border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] hover:bg-white/[0.025] transition-all duration-300 relative overflow-hidden">
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: cfg.color }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to right, ${cfg.color}33, transparent)` }}
      />

      <div
        className="shrink-0 w-10 h-10 flex items-center justify-center border mt-0.5"
        style={{ borderColor: `${cfg.color}30`, backgroundColor: `${cfg.color}0d`, color: cfg.color }}
      >
        {cfg.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <p className="text-white text-sm font-bold leading-tight">{content.title}</p>
          {content.url && (
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-zinc-700 hover:text-zinc-300 transition-colors cursor-pointer mt-0.5"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>

        {content.body && (
          <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-3 line-clamp-2">
            {content.body}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <span
            className="text-[9px] font-black uppercase tracking-widest px-2 py-1 border"
            style={{ color: cfg.color, borderColor: `${cfg.color}30`, backgroundColor: `${cfg.color}0d` }}
          >
            {cfg.label}
          </span>
          <span className="text-[9px] text-zinc-700 font-mono flex items-center gap-1.5">
            <Clock size={9} />
            {content.createdAt}
          </span>
        </div>
      </div>
    </div>
  );
}