'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ChartNoAxesCombined,
  Layers3,
  Search,
  Shuffle,
  SunMoon,
  Trophy,
  X,
} from 'lucide-react';

import { SectionHeading } from './SectionHeading';

const FEATURES = [
  {
    title: 'Contexto em cada clique',
    description:
      'Todo material nasce vinculado a uma trilha. Você sempre sabe por que aquilo está ali.',
    icon: Layers3,
  },
  {
    title: 'Busca sem fricção',
    description:
      'Links, notas e trilhas num lugar só. Sem lembrar em qual aba você guardou aquilo.',
    icon: Search,
  },
  {
    title: 'Radar de progresso',
    description:
      'Lacunas, cobertura e pontos críticos visíveis, sem depender de memória ou planilha.',
    icon: ChartNoAxesCombined,
  },
  {
    title: 'Claro ou escuro, do seu jeito',
    description:
      'PawSpace funciona bem nos dois modos para combinar com seu ambiente, horário e preferência visual.',
    icon: SunMoon,
  },
  {
    title: 'Conquistas que marcam avanços',
    description:
      'O sistema de conquistas registra marcos reais do seu estudo e transforma progresso em algo visível.',
    icon: Trophy,
  },
  {
    title: 'Adapta ao seu ritmo',
    description:
      'Nenhuma metodologia obrigatória. PawSpace se encaixa no jeito que você já aprende.',
    icon: Shuffle,
  },
] as const;

const THEME_PREVIEWS = [
  {
    label: 'Modo escuro',
    detail: 'Ideal para sessões longas e ambientes com menos luz.',
    imageSrc: '/landing/escuro.webp',
  },
  {
    label: 'Modo claro',
    detail: 'Bom para leitura diurna, contraste leve e visual limpo.',
    imageSrc: '/landing/claro.webp',
  },
] as const;

export function FeatureSection() {
  const [activePreview, setActivePreview] = useState<(typeof THEME_PREVIEWS)[number] | null>(null);

  useEffect(() => {
    if (!activePreview) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePreview(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePreview]);

  return (
    <>
      <section id="vantagens" className="scroll-mt-24 py-16 md:scroll-mt-32 md:py-24 xl:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 xl:max-w-7xl xl:px-10 2xl:max-w-[1600px] 2xl:px-16">
          <SectionHeading
            eyebrow="Vantagens"
            title="Tudo que você precisa para estudar com clareza."
            description="Foco, contexto e continuidade: os três princípios que guiam cada decisão do produto."
            className="mb-14 md:mb-16"
          />

          <div className="mb-8 grid gap-4 md:mb-10 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="relative overflow-hidden rounded-[1.45rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-4 sm:p-5 md:rounded-[1.75rem] md:p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_34%)]" />

              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                  Claro e escuro
                </p>
                <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[var(--text-primary)] [font-family:Georgia,serif]">
                  Um único lugar que realmente merece comparação visual.
                </h3>
                <p className="mt-2 text-[12px] leading-6 text-[var(--text-secondary)]">
                  Os dois temas mantêm a mesma hierarquia visual para você estudar com conforto em contextos diferentes.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {THEME_PREVIEWS.map((preview) => (
                    <button
                      type="button"
                      key={preview.label}
                      onClick={() => setActivePreview(preview)}
                      className="group overflow-hidden rounded-[1.35rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-left transition-all duration-300 hover:border-[var(--border-visible)]"
                    >
                      <div className="relative overflow-hidden">
                        <Image
                          src={preview.imageSrc}
                          alt={preview.label}
                          width={1568}
                          height={768}
                          className="h-44 w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02] sm:h-40"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/90">
                            Clique para ampliar
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-[var(--border-subtle)] px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-primary)]">
                          {preview.label}
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-[var(--text-secondary)]">
                          {preview.detail}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 rounded-[1.2rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-4 sm:rounded-[1.35rem] md:grid-cols-3">
                  {[
                    ['Mesma navegação', 'Os dois temas preservam a leitura e a localização dos elementos.'],
                    ['Mesmo ritmo visual', 'Cards, hierarquia e contraste seguem coerentes nas duas variações.'],
                    ['Troca natural', 'Agora você pode clicar nas imagens para abrir a comparação maior.'],
                  ].map(([title, detail]) => (
                    <div key={title}>
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-primary)]">
                        {title}
                      </p>
                      <p className="mt-1.5 text-[11px] leading-5 text-[var(--text-secondary)]">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="rounded-[1.45rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 md:rounded-[1.75rem] md:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                Conquistas
              </p>
              <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[var(--text-primary)] [font-family:Georgia,serif]">
                Progresso que ganha forma dentro do produto.
              </h3>
              <p className="mt-2 text-[12px] leading-6 text-[var(--text-secondary)]">
                Em vez de outro print genérico, este bloco explica um diferencial real: marcos, troféus e pequenos sinais de avanços ao longo da jornada.
              </p>

              <div className="mt-5 grid gap-3">
                {[
                  ['Marcos desbloqueados', 'Conquistas aparecem conforme você abastece trilhas, escreve notas e estrutura seu território.'],
                  ['Motivação visível', 'O sistema ajuda a transformar progresso abstrato em sinais concretos de continuidade.'],
                  ['Espaço para detalhe futuro', 'Quando você tiver a tela pronta, aqui pode entrar um print fechado de badge ou troféu sem competir com o hero.'],
                ].map(([title, detail], index) => (
                  <div
                    key={title}
                    className={`rounded-[1.15rem] border ${
                      index === 2
                        ? 'border-dashed border-[var(--border-visible)] bg-[var(--bg-surface)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'
                    } p-4`}
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
            </article>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <article
                key={feature.title}
                className={`group relative overflow-hidden rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all duration-300 hover:border-[var(--border-visible)] hover:bg-[var(--bg-elevated)] reveal-up ${
                  index < 3 ? 'delay-100' : index < 5 ? 'delay-200' : 'delay-300'
                }`}
              >
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="p-6 md:p-7">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--bg-input)]">
                    <feature.icon size={17} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-[17px] font-black leading-snug tracking-[-0.025em] text-[var(--text-primary)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-[12.5px] leading-[1.75] text-[var(--text-secondary)]">
                    {feature.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {activePreview ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Comparação de temas do PawSpace"
        >
          <button
            type="button"
            aria-label="Fechar comparação"
            onClick={() => setActivePreview(null)}
            className="absolute inset-0 bg-[rgba(3,3,4,0.82)] backdrop-blur-md"
          />

          <div className="relative z-[1] w-full max-w-6xl overflow-hidden rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-[0_32px_120px_rgba(0,0,0,0.48)] sm:rounded-[2rem]">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-4 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                  Claro e escuro
                </p>
                <p className="mt-1 text-base font-black tracking-[-0.03em] text-[var(--text-primary)] [font-family:Georgia,serif]">
                  Compare os dois modos com mais detalhe.
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar comparação"
                onClick={() => setActivePreview(null)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="border-b border-[var(--border-subtle)] px-4 py-4 sm:px-6">
              <div className="flex flex-wrap gap-2">
                {THEME_PREVIEWS.map((preview) => {
                  const isActive = preview.label === activePreview.label;

                  return (
                    <button
                      key={preview.label}
                      type="button"
                      onClick={() => setActivePreview(preview)}
                      className="rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-200"
                      style={{
                        borderColor: isActive ? 'var(--border-visible)' : 'var(--border-subtle)',
                        backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {preview.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-h-[78dvh] overflow-auto p-3 sm:p-4 md:p-5">
              <div className="overflow-hidden rounded-[1.1rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] sm:rounded-[1.5rem]">
                <Image
                  src={activePreview.imageSrc}
                  alt={activePreview.label}
                  width={1568}
                  height={1024}
                  className="h-auto w-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
