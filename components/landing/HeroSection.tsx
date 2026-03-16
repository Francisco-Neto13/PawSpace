'use client';

import Image from 'next/image';

const STATS = [
  { label: 'Território visual', value: '1 mapa' },
  { label: 'Espaços conectados', value: '4 vistas' },
  { label: 'Ritmo de estudo', value: '100% seu' },
];

export function HeroSection() {
  return (
    <section className="relative pb-24 pt-[4.5rem] md:pb-24 md:pt-24 xl:pb-28 xl:pt-28">
      <div className="mx-auto max-w-6xl px-6 xl:max-w-7xl xl:px-10 2xl:max-w-[1600px] 2xl:px-16">
        <div className="flex flex-col items-center text-center reveal-up delay-0">
          <h1 className="max-w-4xl text-[3.6rem] font-black leading-[1.01] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[4.35rem] xl:text-[5.35rem] 2xl:text-[5.85rem] [font-family:Georgia,serif]">
            Seus estudos como um território que você controla.
          </h1>

          <p className="mt-7 max-w-2xl text-[15px] leading-8 text-[var(--text-secondary)] md:text-[16px] md:leading-9">
            PawSpace reúne trilhas, materiais, anotações e progresso em um único espaço, para você estudar com clareza, não com sobrecarga.
          </p>

          <div className="mt-11 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
            {STATS.map((stat, index) => (
              <div
                key={stat.label}
                className={`library-panel relative overflow-hidden p-5 text-left reveal-up ${
                  index === 0 ? 'delay-100' : index === 1 ? 'delay-200' : 'delay-300'
                }`}
              >
                <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                  {stat.label}
                </p>
                <p className="mt-2 text-xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-24 reveal-up delay-300">
          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_42%)]" />

            <div className="relative z-10">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.32em] text-[var(--text-secondary)]">
                    PawSpace
                  </p>
                  <p className="mt-1.5 text-lg font-black tracking-[-0.03em] text-[var(--text-primary)] [font-family:Georgia,serif]">
                    Seu território de estudo em uma única interface.
                  </p>
                </div>
                <p className="max-w-[24rem] text-[11px] leading-6 text-[var(--text-secondary)] md:ml-auto md:text-right">
                  Árvore, biblioteca, diário e painel no mesmo ecossistema.
                  <span className="block">Menos atrito para estudar, mais contexto para continuar.</span>
                </p>
              </div>

              <div className="overflow-hidden rounded-[1.6rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <Image
                  src="/teste.png"
                  alt="Screenshot real do PawSpace"
                  width={1568}
                  height={768}
                  className="h-auto w-full object-cover object-top"
                  priority
                />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {[
                  ['Árvore visual', 'Dependências e progresso em um mapa vivo.'],
                  ['Biblioteca ligada ao contexto', 'Materiais entram no lugar certo sem virar bagunça.'],
                  ['Diário com memória real', 'Notas e sessões ficam conectadas ao que você estudou.'],
                ].map(([title, detail], index) => (
                  <div
                    key={title}
                    className={`rounded-[1.4rem] border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 px-4 py-4 reveal-up ${
                      index === 0 ? 'delay-200' : index === 1 ? 'delay-300' : 'delay-400'
                    }`}
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
