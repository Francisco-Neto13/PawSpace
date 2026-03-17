'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import { LIMITS } from '@/lib/limits';
import { createClient } from '@/shared/supabase/client';

const PASSWORD_MAX_LENGTH = LIMITS.auth.password;

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
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError('Link expirado ou inválido. Solicite um novo link.');
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
      <div className="flex w-full flex-col items-center gap-5">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-visible)] border-t-[var(--text-primary)]" />
        <p className="animate-pulse text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)]">
          Sincronizando PawSpace...
        </p>
      </div>
    );
  }

  return (
    <div className={`relative z-10 w-full ${reveal()}`}>
      {!success ? (
        <>
          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-visible)] bg-[var(--bg-elevated)]">
              <PawIcon className="h-5 w-5 text-[var(--text-primary)]" />
            </div>
            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.34em] text-[var(--text-secondary)]">
              Entrada segura
            </p>
            <h3 className="overview-title mb-2 text-2xl sm:text-[2rem]">Definir nova senha</h3>
            <p className="max-w-sm text-[11px] leading-6 text-[var(--text-secondary)]">
              Escolha uma nova senha para continuar protegendo sua toca no PawSpace.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="mb-2 ml-1 block text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
                Nova senha
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={PASSWORD_MAX_LENGTH}
                  placeholder="Digite a nova senha"
                  className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3.5 pl-11 pr-28 text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-faint)] focus:border-[var(--border-visible)] focus:bg-[var(--bg-elevated)] focus:ring-2 focus:ring-white/10"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showPassword ? 'Ocultar' : 'Exibir'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 ml-1 block text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
                Confirmar senha
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={PASSWORD_MAX_LENGTH}
                  placeholder="Confirme a nova senha"
                  className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3.5 pl-11 pr-4 text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-faint)] focus:border-[var(--border-visible)] focus:bg-[var(--bg-elevated)] focus:ring-2 focus:ring-white/10"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError('');
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-[#4e2331] bg-[#1b1017] px-4 py-3 text-[10px] font-bold text-[#ffb4c4]">
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
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-[var(--text-primary)] py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--bg-base)] shadow-[0_10px_30px_rgba(255,255,255,0.08)] transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Atualizando...' : 'Atualizar senha'}
            </button>
          </form>
        </>
      ) : (
        <div className="w-full">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)]">
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
            Alteração concluída
          </p>
          <h3 className="overview-title mb-3 text-xl">Senha alterada com sucesso</h3>
          <p className="text-[11px] leading-6 text-[var(--text-secondary)]">
            Sua nova senha já foi salva. Você será redirecionado para a tela de login em instantes.
          </p>
        </div>
      )}
    </div>
  );
}
