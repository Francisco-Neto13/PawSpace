'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PawIcon } from '@/components/shared/PawIcon';
import { createClient } from '@/shared/supabase/client';
import RecoveryModal from '@/components/login/features/auth/RecoveryModal';

function mapAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('email not confirmed')) {
    return 'Esse usuario ainda nao teve o email confirmado no Supabase.';
  }

  if (normalized.includes('invalid login credentials')) {
    return 'Email ou senha invalidos.';
  }

  if (normalized.includes('invalid email or password')) {
    return 'Email ou senha invalidos.';
  }

  if (normalized.includes('signup is disabled')) {
    return 'O cadastro por email esta desativado neste projeto.';
  }

  return `Falha no login: ${message}`;
}

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(mapAuthError(signInError.message));
      setLoading(false);
      return;
    }

    router.replace('/overview');
    router.refresh();
  }

  return (
    <>
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-muted)] bg-[linear-gradient(180deg,rgba(20,20,24,0.96),rgba(10,10,12,0.92))] shadow-[0_28px_90px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.025]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

        <div className="border-b border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-visible)] bg-[var(--bg-elevated)]">
            <PawIcon className="h-5 w-5 text-[var(--text-secondary)]" />
          </div>
          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.34em] text-[var(--text-secondary)]">
            Acesso ao workspace
          </p>
          <h1 className="overview-title mb-2 text-2xl">
            Entrar no PawSpace
          </h1>
          <p className="text-[11px] leading-6 text-[var(--text-secondary)]">
            Acesse sua arvore, biblioteca e progresso em um so lugar.
          </p>
        </div>

        <form className="space-y-5 p-8" onSubmit={handleLogin}>
          <div>
            <label className="ml-1 mb-2 block text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
              Endereco de Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Digite seu email"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] p-3.5 text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-faint)] focus:border-[var(--border-visible)] focus:ring-2 focus:ring-white/10"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="ml-1 block text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
                Senha
              </label>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Esqueci a senha
              </button>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="Digite sua senha"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] p-3.5 pr-20 text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-faint)] focus:border-[var(--border-visible)] focus:ring-2 focus:ring-white/10"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(null);
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                {showPassword ? 'Ocultar' : 'Exibir'}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-[#4e2331] bg-[#1b1017] px-4 py-3 text-[10px] font-bold text-[#ffb4c4]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-[var(--text-primary)] py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--bg-base)] shadow-[0_10px_30px_rgba(255,255,255,0.08)] transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-base)]/30 px-8 py-5">
          <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-[0.22em] text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-primary)] opacity-80 animate-pulse" />
              Sessao Segura
            </div>
            <span className="text-[var(--text-faint)]">|</span>
            <span>Protegido por SSL</span>
          </div>
        </div>
      </div>

      {isModalOpen && <RecoveryModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
