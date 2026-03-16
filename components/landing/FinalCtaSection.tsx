'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCtaSection() {
  return (
    <section id="comecar" className="scroll-mt-28 pb-28 pt-24 md:scroll-mt-32 md:pb-32 md:pt-28 xl:pb-36 xl:pt-32">
      <div className="mx-auto max-w-6xl px-6 xl:max-w-7xl xl:px-10 2xl:max-w-[1600px] 2xl:px-16">
        <div className="pointer-events-none absolute inset-x-0 translate-y-6">
          <div className="mx-auto h-56 max-w-5xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_68%)] blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          <div className="mx-auto max-w-3xl reveal-up delay-0">
            <h2 className="text-4xl font-black leading-[1.06] tracking-[-0.05em] text-[var(--text-primary)] md:text-5xl xl:text-6xl [font-family:Georgia,serif]">
              Comece a estudar com intenção hoje.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[14px] leading-[1.85] text-[var(--text-secondary)]">
              Mapeie trilhas, guarde o que importa e construa um registro real do seu processo, tudo num único território.
            </p>
          </div>

          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 reveal-up delay-200">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--text-primary)] px-6 py-4 text-[11px] font-black uppercase leading-none tracking-[0.2em] text-[var(--bg-base)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
            >
              <span className="translate-y-[0.5px]">Criar conta</span>
              <ArrowRight size={14} className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mx-auto mt-8 grid max-w-4xl gap-3 text-left reveal-up delay-300 md:grid-cols-3">
            {[
              ['Comece pelo mapa', 'Organize a árvore antes de mergulhar para enxergar o que destrava mais progresso.'],
              ['Abasteça o território', 'Guarde materiais, notas e referências no lugar certo em vez de perder contexto.'],
              ['Mantenha o ritmo vivo', 'Transforme sessões, revisões e conquistas em sinais concretos de continuidade.'],
            ].map(([title, detail]) => (
              <div
                key={title}
                className="rounded-[1.35rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-4"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-primary)]">
                  {title}
                </p>
                <p className="mt-2 text-[11px] leading-5 text-[var(--text-secondary)]">
                  {detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 reveal-fade delay-400">
            <p className="text-[11px] tracking-[0.04em] text-[var(--text-secondary)]/50">
              Grátis para começar - Crie sua conta rapidinho - Exclua sua conta quando quiser
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
