'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const SPACES = [
  {
    title: 'Árvore',
    description: 'Monte o mapa visual das suas trilhas e enxergue o que depende do quê antes de mergulhar.',
    icon: '/tree.png',
    integration: 'Dependências da Árvore alimentam a ordem de estudo no Painel automaticamente.',
    items: ['dependências claras', 'prioridade por impacto', 'visão geral do território'],
  },
  {
    title: 'Estante',
    description: 'Guarde links, vídeos, PDFs e notas por trilha, sem transformar a pesquisa em pilha de abas.',
    icon: '/library.png',
    integration: 'Materiais da Estante aparecem vinculados nas notas do Diário e no contexto do Painel.',
    items: ['materiais por contexto', 'busca rápida', 'organização por tipo'],
  },
  {
    title: 'Diário',
    description: 'Registre sessões, ideias e revisões com contexto, para que o aprendizado deixe rastros reais.',
    icon: '/journal.png',
    integration: 'Entradas do Diário atualizam o progresso da trilha na Árvore e o histórico no Painel.',
    items: ['notas vinculadas', 'edição leve', 'histórico do processo'],
  },
  {
    title: 'Painel',
    description: 'Veja lacunas, trilhas críticas e cobertura real, sem depender de memória ou feeling.',
    icon: '/resume.png',
    integration: 'O Painel agrega dados da Árvore, Estante e Diário para gerar uma visão acionável.',
    items: ['insights acionáveis', 'atividades recentes', 'visão de progresso'],
  },
];

export function ProductSection() {
  return (
    <section id="produto" className="scroll-mt-28 py-24 md:scroll-mt-32 md:py-28 xl:py-32">
      <div className="mx-auto max-w-6xl px-6 xl:max-w-7xl xl:px-10 2xl:max-w-[1600px] 2xl:px-16">
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
              className={`group relative overflow-hidden rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 transition-all duration-300 hover:border-[var(--border-visible)] reveal-up md:p-7 ${index % 2 === 0 ? 'delay-100' : 'delay-200'}`}
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] border border-[var(--border-visible)] bg-[var(--bg-elevated)]">
                    <Image
                      src={space.icon}
                      alt={`${space.title} icon`}
                      fill
                      sizes="56px"
                      className="object-contain p-2.5"
                      style={{ filter: 'var(--bg-image-filter)' }}
                    />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                      Espaço conectado
                    </p>
                    <h3 className="mt-1.5 text-2xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
                      {space.title}
                    </h3>
                  </div>
                </div>
                <ArrowUpRight
                  className="mt-1 shrink-0 text-[var(--text-secondary)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  size={17}
                />
              </div>

              <p className="max-w-xl text-[13px] leading-7 text-[var(--text-secondary)]">
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

              <div className="mt-6 rounded-[1.25rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] p-4">
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
