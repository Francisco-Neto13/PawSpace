'use client';

import Image from 'next/image';

const STATS = [
  { label: 'Território visual', value: '1 mapa' },
  { label: 'Espaços conectados', value: '4 vistas' },
  { label: 'Ritmo de estudo', value: '100% seu' },
];

export function HeroSection() {
  return (
    <section className="relative pb-16 pt-8 sm:pb-20 sm:pt-10 md:pb-24 md:pt-16 xl:pb-28 xl:pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 xl:max-w-7xl xl:px-10 2xl:max-w-[1600px] 2xl:px-16">
        <div className="flex flex-col items-center text-center reveal-up delay-0">
          <h1 className="max-w-4xl text-[clamp(2.2rem,11vw,3.6rem)] font-black leading-[1.02] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[4rem] xl:text-[5.1rem] 2xl:text-[5.85rem] [font-family:Georgia,serif]">
            Seus estudos como um território que você controla.
          </h1>

          <p className="mt-5 max-w-2xl text-[14px] leading-7 text-[var(--text-secondary)] sm:mt-6 sm:text-[15px] sm:leading-8 md:text-[16px] md:leading-9">
            PawSpace reúne trilhas, materiais, anotações e progresso em um único espaço, para você estudar com clareza, não com sobrecarga.
          </p>

          <div className="mt-8 grid w-full max-w-2xl gap-3 sm:mt-10 sm:grid-cols-3">
            {STATS.map((stat, index) => (
              <div
                key={stat.label}
                className={`library-panel relative overflow-hidden p-4 text-left reveal-up sm:p-5 ${
                  index === 0 ? 'delay-100' : index === 1 ? 'delay-200' : 'delay-300'
                }`}
              >
                <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                  {stat.label}
                </p>
                <p className="mt-2 text-lg font-black tracking-[-0.03em] text-[var(--text-primary)] sm:text-xl">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-12 reveal-up delay-300 sm:mt-16 xl:mt-20">
          <div className="relative overflow-hidden rounded-[1.6rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:rounded-[2rem] sm:p-6 md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_42%)]" />

            <div className="relative z-10">
              <div className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-wrap sm:items-end sm:justify-between md:flex-row md:gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.32em] text-[var(--text-secondary)]">
                    PawSpace
                  </p>
                  <p className="mt-1.5 text-base font-black tracking-[-0.03em] text-[var(--text-primary)] sm:text-lg [font-family:Georgia,serif]">
                    Seu território de estudo em uma única interface.
                  </p>
                </div>
                <p className="max-w-[24rem] text-[11px] leading-5 text-[var(--text-secondary)] sm:leading-6 md:ml-auto md:text-right">
                  Árvore, biblioteca, diário e painel no mesmo ecossistema.
                  <span className="block">Menos atrito para estudar, mais contexto para continuar.</span>
                </p>
              </div>

              <div className="overflow-hidden rounded-[1.2rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)] sm:rounded-[1.6rem]">
                <div className="relative aspect-[1.04] sm:aspect-[1.28] lg:aspect-[1.85]">
                  <Image
                    src="/landing/modelos.webp"
                    alt="Screenshot real do PawSpace"
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 639px) 100vw, (max-width: 1024px) 92vw, 80vw"
                    priority
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ['Árvore visual', 'Dependências e progresso em um mapa vivo.'],
                  ['Biblioteca ligada ao contexto', 'Materiais entram no lugar certo sem virar bagunça.'],
                  ['Diário com memória real', 'Notas e sessões ficam conectadas ao que você estudou.'],
                ].map(([title, detail], index) => (
                  <div
                    key={title}
                    className={`rounded-[1.2rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 px-4 py-4 reveal-up sm:rounded-[1.4rem] ${
                      index === 0 ? 'delay-200' : index === 1 ? 'delay-300' : 'delay-400'
                    } ${index === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
