'use client';

import { ArrowRight, BookMarked, Compass, NotebookPen } from 'lucide-react';

import { SectionHeading } from './SectionHeading';

const STEPS = [
  {
    number: '01',
    title: 'Mapeie o território',
    description: 'Desenhe a árvore, descubra dependências e enxergue qual trilha destrava mais progresso.',
    icon: Compass,
  },
  {
    number: '02',
    title: 'Alimente a estante',
    description: 'Guarde o que realmente importa em cada trilha para nunca mais perder contexto no meio do estudo.',
    icon: BookMarked,
  },
  {
    number: '03',
    title: 'Deixe pegadas',
    description: 'Anote sessões, revisões e insights para que o seu processo possa ser retomado sem atrito.',
    icon: NotebookPen,
  },
] as const;

export function WorkflowSection() {
  return (
    <section id="fluxo" className="scroll-mt-24 py-16 md:scroll-mt-32 md:py-24 xl:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 xl:max-w-7xl xl:px-10 2xl:max-w-[1600px] 2xl:px-16">
        <SectionHeading
          eyebrow="Fluxo"
          title="Três passos para estudar com intenção."
          description="PawSpace organiza o terreno para que você saiba o que vem antes, o que merece material e o que precisa de revisão, sem precisar lembrar de nada."
          className="mb-14 md:mb-16"
        />

        <div className="grid gap-4 md:gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {STEPS.map((step, index) => (
              <article
                key={step.number}
                className={`relative rounded-[1.3rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 reveal-up md:rounded-[1.5rem] md:p-6 ${index === 0 ? 'delay-100' : index === 1 ? 'delay-200' : 'delay-300'} ${index === 2 ? 'md:col-span-2 xl:col-span-1' : ''}`}
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-3xl font-black tracking-[-0.04em] text-[var(--text-primary)]/20">
                    {step.number}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)]">
                    <step.icon size={17} strokeWidth={1.8} />
                  </div>
                </div>
                <h3 className="text-[17px] font-black tracking-[-0.025em] text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[12px] leading-[1.75] text-[var(--text-secondary)]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>

          <aside className="relative overflow-hidden rounded-[1.3rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 reveal-up delay-400 md:rounded-[1.5rem] md:p-7">
            <div className="absolute right-[-3rem] top-[-3rem] h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_70%)] blur-xl" />

            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--text-secondary)]">
              Por que funciona
            </p>
            <h3 className="mt-3 text-xl font-black leading-tight tracking-[-0.035em] text-[var(--text-primary)] sm:text-2xl [font-family:Georgia,serif]">
              Você para de gerenciar ferramentas e volta a estudar.
            </h3>
            <p className="mt-3.5 text-[12px] leading-6 text-[var(--text-secondary)] sm:text-[13px] sm:leading-7">
              Quando árvore, materiais, notas e progresso vivem juntos, a cabeça para de guardar logística e começa a guardar conhecimento.
            </p>

            <div className="mt-7 space-y-2.5">
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
                <ArrowRight size={13} className="shrink-0 text-[var(--text-primary)]" />
                <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--text-primary)]">
                  Prioridades visíveis no mapa
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
                <ArrowRight size={13} className="shrink-0 text-[var(--text-primary)]" />
                <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                  Cada material nasce com contexto, não solto.
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
                <ArrowRight size={13} className="shrink-0 text-[var(--text-primary)]" />
                <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                  O diário vira memória real do processo.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
