'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

import { SectionHeading } from './SectionHeading';

const SPACES = [
  {
    title: 'Árvore',
    description: 'Monte o mapa visual das suas trilhas e enxergue o que depende do quê antes de mergulhar.',
    icon: '/navigation/tree.webp',
    integration: 'Dependências da Árvore alimentam a ordem de estudo no Painel automaticamente.',
    items: ['dependências claras', 'prioridade por impacto', 'visão geral do território'],
  },
  {
    title: 'Estante',
    description: 'Guarde links, vídeos, PDFs e notas por trilha, sem transformar a pesquisa em pilha de abas.',
    icon: '/navigation/library.webp',
    integration: 'Materiais da Estante aparecem vinculados nas notas do Diário e no contexto do Painel.',
    items: ['materiais por contexto', 'busca rápida', 'organização por tipo'],
  },
  {
    title: 'Diário',
    description: 'Registre sessões, ideias e revisões com contexto, para que o aprendizado deixe rastros reais.',
    icon: '/navigation/journal.webp',
    integration: 'Entradas do Diário atualizam o progresso da trilha na Árvore e o histórico no Painel.',
    items: ['notas vinculadas', 'edição leve', 'histórico do processo'],
  },
  {
    title: 'Painel',
    description: 'Veja lacunas, trilhas críticas e cobertura real, sem depender de memória ou feeling.',
    icon: '/navigation/resume.webp',
    integration: 'O Painel agrega dados da Árvore, Estante e Diário para gerar uma visão acionável.',
    items: ['insights acionáveis', 'atividades recentes', 'visão de progresso'],
  },
] as const;

export function ProductSection() {
  return (
    <section id="produto" className="scroll-mt-24 py-16 md:scroll-mt-32 md:py-24 xl:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 xl:max-w-7xl xl:px-10 2xl:max-w-[1600px] 2xl:px-16">
        <SectionHeading
          eyebrow="Produto"
          title="Quatro espaços. Um território."
          description="Pensar, guardar, escrever e revisar num fluxo único. Cada espaço conversa com os outros em tempo real."
          className="mb-14 md:mb-16"
        />

        <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
          {SPACES.map((space, index) => (
            <article
              key={space.title}
              className={`group relative overflow-hidden rounded-[1.45rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition-all duration-300 hover:border-[var(--border-visible)] reveal-up sm:p-5 md:rounded-[1.75rem] md:p-7 ${index % 2 === 0 ? 'delay-100' : 'delay-200'}`}
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="mb-5 flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-[var(--border-visible)] bg-[var(--bg-elevated)] sm:h-14 sm:w-14 sm:rounded-[1.2rem]">
                    <Image
                      src={space.icon}
                      alt={`${space.title} icon`}
                      fill
                      sizes="(max-width: 639px) 48px, 56px"
                      className="object-contain p-2 sm:p-2.5"
                      style={{ filter: 'var(--bg-image-filter)' }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                      Espaço conectado
                    </p>
                    <h3 className="mt-1.5 text-xl font-black tracking-[-0.03em] text-[var(--text-primary)] sm:text-2xl">
                      {space.title}
                    </h3>
                  </div>
                </div>
                <ArrowUpRight
                  className="mt-1 shrink-0 text-[var(--text-secondary)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  size={17}
                />
              </div>

              <p className="max-w-xl text-[12px] leading-6 text-[var(--text-secondary)] sm:text-[13px] sm:leading-7">
                {space.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {space.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--text-secondary)]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-5 rounded-[1.1rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] p-4 sm:mt-6 sm:rounded-[1.25rem]">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Integração
                </p>
                <p className="text-[11px] leading-[1.7] text-[var(--text-secondary)]">
                  {space.integration}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
