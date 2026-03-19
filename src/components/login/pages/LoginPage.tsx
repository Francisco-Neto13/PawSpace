import Image from 'next/image';

import LoginForm from '../features/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[var(--bg-base)]">
      <main className="relative z-10 flex min-h-svh flex-col lg:grid lg:h-screen lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] xl:grid-cols-[minmax(0,1.8fr)_minmax(380px,0.42fr)]">
        <section className="order-1 relative min-h-[18rem] overflow-hidden border-b border-[var(--border-subtle)] bg-[#050505] sm:min-h-[22rem] lg:order-1 lg:h-screen lg:border-b-0 lg:border-r">
          <Image
            src="/auth/login.webp"
            alt="Preview do PawSpace"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 68vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />
        </section>

        <section className="order-2 relative flex flex-1 items-start justify-center px-4 py-8 sm:px-8 sm:py-10 lg:order-2 lg:h-screen lg:overflow-y-auto lg:px-8 lg:py-0 lg:pt-[7vh] xl:px-10 xl:pt-[8vh]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
          <div className="relative w-full max-w-[420px] pt-2 sm:pt-4 lg:max-w-[420px] lg:pt-0 xl:max-w-[392px]">
            <LoginForm />
          </div>
        </section>
      </main>
    </div>
  );
}
