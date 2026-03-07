'use client';
import { PawIcon } from '@/components/shared/PawIcon';

export default function SettingsPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_50%,transparent_100%)]" />

      <main className="relative z-10 py-8 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
          <span className="text-white text-[9px] font-black uppercase tracking-[0.4em]">
            Pawspace / Configurações
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <PawIcon className="absolute bottom-4 right-4 w-10 h-10 text-white opacity-[0.04] pointer-events-none" />
          <p className="text-zinc-300 text-[11px] font-black uppercase tracking-[0.3em]">
            Módulo em desenvolvimento
          </p>
        </section>
      </main>
    </div>
  );
}
