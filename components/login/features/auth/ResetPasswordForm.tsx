'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/shared/supabase/client';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const mountTimer = setTimeout(() => setMounted(true), 0);
    let revealTimer: ReturnType<typeof setTimeout> | null = null;
    const code = searchParams.get('code');

    async function checkSession() {
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          router.replace('/login');
          return;
        }
      }

      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();

      if (sessionError || !user) {
        router.replace('/login');
        return;
      }

      setVerifying(false);
      revealTimer = setTimeout(() => setAnimate(true), 50);
    }

    void checkSession();

    return () => {
      clearTimeout(mountTimer);
      if (revealTimer) clearTimeout(revealTimer);
    };
  }, [router, searchParams, supabase]);

  function reveal(delay = '') {
    return `transition-all duration-700 ease-out ${delay} ${
      animate ? 'opacity-100 translate-y-0 blur-none' : 'opacity-0 translate-y-6 blur-sm'
    }`;
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError('Link expirado ou invalido. Solicite um novo link.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    await supabase.auth.signOut();
    router.refresh();

    setTimeout(() => {
      router.push('/login');
    }, 3000);
  }

  if (!mounted) return null;

  if (verifying) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-5">
        <div className="h-12 w-12 rounded-full border-4 border-[var(--border-subtle)] border-t-[var(--text-primary)] animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
          Verificando link...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-muted)] bg-[linear-gradient(180deg,rgba(20,20,24,0.96),rgba(10,10,12,0.92))] shadow-[0_28px_90px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.025] ${reveal()}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      {!success ? (
        <>
          <div className="border-b border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-visible)] bg-[var(--bg-elevated)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--text-secondary)]"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.34em] text-[var(--text-secondary)]">
              Redefinição de acesso
            </p>
            <h3 className="overview-title mb-2 text-2xl">
              Definir nova senha
            </h3>
            <p className="text-[11px] leading-6 text-[var(--text-secondary)]">
              Escolha uma nova senha para continuar usando seu workspace com segurança.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5 p-8">
            <div>
              <label className="ml-1 mb-2 block text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Digite a nova senha"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] p-3.5 pr-20 text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-faint)] focus:border-[var(--border-visible)] focus:ring-2 focus:ring-white/10"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
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

            <div>
              <label className="ml-1 mb-2 block text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
                Confirmar Senha
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Confirme a nova senha"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] p-3.5 text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-faint)] focus:border-[var(--border-visible)] focus:ring-2 focus:ring-white/10"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError('');
                }}
              />
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
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </button>
          </form>
        </>
      ) : (
        <div className="p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.34em] text-[var(--text-secondary)]">
            Atualização concluída
          </p>
          <h3 className="overview-title mb-3 text-xl">
            Senha atualizada
          </h3>
          <p className="text-[11px] leading-6 text-[var(--text-secondary)]">
            Redirecionando para o login...
          </p>
        </div>
      )}
    </div>
  );
}
