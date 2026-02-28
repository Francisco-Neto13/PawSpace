'use client';
import { BookOpen } from 'lucide-react';

export function EmptyState({ nodeUnlocked }: { nodeUnlocked: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 border border-white/[0.04] flex items-center justify-center mb-6 text-zinc-700">
        <BookOpen size={24} />
      </div>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-3">
        {nodeUnlocked ? 'Nenhum conteúdo ainda' : 'Módulo bloqueado'}
      </p>
      <p className="text-zinc-700 text-xs font-medium max-w-[240px] leading-relaxed">
        {nodeUnlocked
          ? 'Adicione links, PDFs, notas ou vídeos a este módulo para começar sua biblioteca.'
          : 'Desbloqueie este módulo na árvore para adicionar conteúdos.'}
      </p>
    </div>
  );
}