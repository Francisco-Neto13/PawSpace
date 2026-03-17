import Image from 'next/image';

import LoginForm from '../features/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-base)]">
      <main className="relative z-10 min-h-screen lg:grid lg:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.48fr)] xl:grid-cols-[minmax(0,1.8fr)_minmax(380px,0.42fr)]">
        <section className="relative min-h-[42vh] overflow-hidden border-b border-[var(--border-subtle)] bg-[#050505] lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />

          <div className="relative flex h-full flex-col justify-end p-3 sm:p-5 lg:p-6 xl:p-8">
            <div className="relative h-[36vh] min-h-[300px] overflow-hidden rounded-[1.9rem] border border-white/[0.06] bg-black/[0.35] shadow-[0_40px_120px_rgba(0,0,0,0.45)] sm:h-[46vh] lg:h-full lg:min-h-0">
              <Image
                src="/teste.png"
                alt="Preview do PawSpace"
                fill
                priority
                className="object-cover object-left-top"
                sizes="(max-width: 1024px) 100vw, 68vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/[0.04]" />
            </div>

            <div className="pointer-events-none absolute left-4 right-4 top-4 sm:left-6 sm:right-6 sm:top-6 lg:left-7 lg:right-auto lg:top-7 xl:left-9 xl:top-9">
              <div className="inline-flex items-center rounded-full border border-white/[0.08] bg-black/35 px-4 py-2 text-[9px] font-black uppercase tracking-[0.28em] text-white/70 backdrop-blur-sm">
                Preview do produto
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-[58vh] items-center justify-center px-6 py-10 sm:px-8 lg:min-h-screen lg:items-start lg:px-8 lg:pt-[7vh] xl:px-10 xl:pt-[8vh]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
          <div className="relative w-full max-w-[380px] xl:max-w-[392px]">
            <LoginForm />
          </div>
        </section>
      </main>
    </div>
  );
}
