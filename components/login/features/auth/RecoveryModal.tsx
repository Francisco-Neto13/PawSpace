'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { LockKeyhole, Mail } from 'lucide-react';
import { createClient } from '@/shared/supabase/client';
import { LIMITS } from '@/lib/limits';

interface RecoveryModalProps {
  onClose: () => void;
}

const EMAIL_MAX_LENGTH = LIMITS.auth.email;

export default function RecoveryModal({ onClose }: RecoveryModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(timer);
  }, []);

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=%2Freset-password`,
    });

    setLoading(false);

    if (resetError) {
      if (resetError.status === 429 || resetError.message.includes('rate limit')) {
        setError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
        setIsBlocked(true);
      } else {
        setError('Não foi possível enviar o link. Verifique o endereço de email.');
      }
      return;
    }

    setSent(true);
  }

  return (
    <div
      className={`fixed inset-0 z-[600] flex items-center justify-center bg-black/82 p-4 backdrop-blur-sm transition-opacity duration-300 ${
        animate ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div
        className={`relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[var(--border-muted)] bg-[linear-gradient(180deg,rgba(18,18,22,0.98),rgba(10,10,12,0.96))] shadow-[0_32px_64px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.025] transition-all duration-500 ease-out ${
          animate ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-[0.98] opacity-0'
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

        {!sent ? (
          <>
            <div className="border-b border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-8 sm:p-9">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-visible)] bg-[var(--bg-elevated)]">
                <LockKeyhole className="h-5 w-5 text-[var(--text-primary)]" />
              </div>

              <p className="mb-2 text-[9px] font-black uppercase tracking-[0.34em] text-[var(--text-secondary)]">
                Recuperação de acesso
              </p>
              <h3 className="overview-title mb-2 text-2xl">Redefinir senha</h3>
              <p className="max-w-sm text-[11px] leading-6 text-[var(--text-secondary)]">
                Digite seu email para receber um link seguro de redefinição.
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-5 p-8 sm:p-9">
              <div>
                <label className="ml-1 mb-2 block text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">
                  Endereço de email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    maxLength={EMAIL_MAX_LENGTH}
                    placeholder="seu@email.com"
                    value={email}
                    disabled={isBlocked}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError('');
                    }}
                    className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3.5 pl-11 pr-4 text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-faint)] focus:border-[var(--border-visible)] focus:bg-[var(--bg-elevated)] focus:ring-2 focus:ring-white/10 disabled:opacity-50"
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
                    className="shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 cursor-pointer rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] transition-all hover:border-[var(--border-visible)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || isBlocked}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--text-primary)] py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bg-base)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-[var(--bg-base)]/20 border-t-[var(--bg-base)] animate-spin" />
                  ) : isBlocked ? (
                    'Bloqueado'
                  ) : (
                    'Enviar link'
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-8 sm:p-9">
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
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </div>

            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.34em] text-[var(--text-secondary)]">
              Link enviado
            </p>
            <h3 className="overview-title mb-3 text-xl">Verifique seu email</h3>
            <p className="mb-8 max-w-sm text-[11px] leading-6 text-[var(--text-secondary)]">
              Se existir uma conta para <span className="text-[var(--text-primary)]">{email.toLowerCase()}</span>, você receberá um link em breve.
            </p>
            <button
              onClick={onClose}
              className="w-full cursor-pointer rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] transition-all hover:border-[var(--border-visible)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
