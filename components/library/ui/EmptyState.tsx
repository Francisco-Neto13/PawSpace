'use client';
import { BookOpen } from 'lucide-react';

export function EmptyState({ nodeUnlocked }: { nodeUnlocked: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-700">
      <div className="w-16 h-16 border border-white/[0.08] bg-white/[0.01] flex items-center justify-center mb-6 text-zinc-600 group-hover:text-[#c8b89a] transition-colors">
        <BookOpen size={24} strokeWidth={1.5} />
      </div>

      <p className="text-zinc-400 text-[11px] font-black uppercase tracking-[0.4em] mb-4">
        {nodeUnlocked ? 'Biblioteca Vazia' : 'Acesso Restrito'}
      </p>

      <p className="text-zinc-500 text-[13px] font-normal max-w-[280px] leading-relaxed italic">
        {nodeUnlocked
          ? 'Adicione links, PDFs, notas ou vídeos a este módulo para começar sua biblioteca.'
          : 'Desbloqueie este módulo na árvore para adicionar conteúdos.'}
      </p>

      <div className="mt-8 w-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}