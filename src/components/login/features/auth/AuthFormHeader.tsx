'use client';

import { PawIcon } from '@/components/shared/PawIcon';

interface AuthFormHeaderProps {
  isSignup: boolean;
}

export function AuthFormHeader({ isSignup }: AuthFormHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-visible)] bg-[var(--bg-elevated)]">
        <PawIcon className="h-5 w-5 text-[var(--text-primary)]" />
      </div>

      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.34em] text-[var(--text-secondary)]">
        Entrada na toca
      </p>

      <h1 className="overview-title mb-2 text-2xl sm:text-[2rem]">
        {isSignup ? 'Criar conta no PawSpace' : 'Entrar no PawSpace'}
      </h1>

      <p className="max-w-sm text-[11px] leading-6 text-[var(--text-secondary)]">
        {isSignup
          ? 'Crie sua conta com e-mail e senha para montar sua árvore, sua estante e o diário do PawSpace.'
          : 'Entre para continuar cuidando das trilhas, materiais e pegadas do seu PawSpace.'}
      </p>
    </div>
  );
}
