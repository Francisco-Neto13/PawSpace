'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Check, Loader2 } from 'lucide-react';

import TurnstileWidget from '@/components/login/features/auth/TurnstileWidget';
import { PawIcon } from '@/components/shared/PawIcon';
import { LIMITS } from '@/lib/limits';
import { createClient } from '@/shared/supabase/client';

const PASSWORD_MAX = LIMITS.auth.password;

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="field-label mb-2 block">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          maxLength={maxLength}
          onChange={(event) =>
            onChange(maxLength ? event.target.value.slice(0, maxLength) : event.target.value)
          }
          placeholder={placeholder ?? '********'}
          className="library-input field-input h-10 px-3.5 pr-10 placeholder:text-[var(--text-faint)]"
        />
        <button
          type="button"
          onClick={() => setShow((currentValue) => !currentValue)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] transition-colors hover:text-[var(--text-secondary)]"
        >
          {show ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      </div>
    </div>
  );
}

export default function PasswordSection() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const shouldShowTurnstile = Boolean(turnstileSiteKey);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saved, setSaved] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  function resetCaptchaChallenge() {
    setTurnstileToken(null);
    setTurnstileResetKey((currentKey) => currentKey + 1);
  }

  useEffect(() => {
    let mounted = true;
    const loadingTimeout = window.setTimeout(() => {
      if (!mounted) return;
      setIsLoadingUser(false);
      setError((previousError) => previousError ?? 'Não foi possível carregar o usuário.');
    }, 8000);

    const loadEmail = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!mounted) return;
        if (userError || !user?.email) {
          setError('Sessão não encontrada.');
          return;
        }

        setUserEmail(user.email);
      } catch {
        if (!mounted) return;
        setError('Falha ao carregar dados do usuário.');
      } finally {
        if (!mounted) return;
        window.clearTimeout(loadingTimeout);
        setIsLoadingUser(false);
      }
    };

    void loadEmail();

    return () => {
      mounted = false;
      window.clearTimeout(loadingTimeout);
    };
  }, []);

  const handleSave = async () => {
    if (isSaving) return;

    setError(null);
    setSaved(false);

    if (!current) {
      setError('Digite a senha atual.');
      return;
    }
    if (next.length < 8) {
      setError('A nova senha deve ter ao menos 8 caracteres.');
      return;
    }
    if (next.length > PASSWORD_MAX) {
      setError(`A nova senha pode ter no máximo ${PASSWORD_MAX} caracteres.`);
      return;
    }
    if (next !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!userEmail) {
      setError('Não foi possível validar o usuário atual.');
      return;
    }
    if (shouldShowTurnstile && !turnstileToken) {
      setError('Confirme que você não é um robô para continuar.');
      return;
    }

    setIsSaving(true);
    const savingWatchdog = window.setTimeout(() => {
      setIsSaving(false);
      setError('A atualização está demorando. Verifique se a senha mudou e tente novamente.');
    }, 20000);

    const supabase = createClient();

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: current,
        options: turnstileToken ? { captchaToken: turnstileToken } : undefined,
      });

      if (signInError) {
        if (shouldShowTurnstile) {
          resetCaptchaChallenge();
        }

        if (signInError.message.toLowerCase().includes('captcha')) {
          setError('Confirme a verificação de segurança e tente novamente.');
          return;
        }

        setError('Senha atual incorreta.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: next,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSaved(true);
      setCurrent('');
      setNext('');
      setConfirm('');
      if (shouldShowTurnstile) {
        resetCaptchaChallenge();
      }
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : 'Falha ao atualizar senha.';
      setError(message);
    } finally {
      window.clearTimeout(savingWatchdog);
      setIsSaving(false);
    }
  };

  return (
    <section className="library-panel relative overflow-hidden p-6">
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <p className="library-kicker mb-1 flex items-center gap-2">
        <PawIcon className="h-3 w-3 shrink-0 text-[var(--text-secondary)]" />
        Senha
      </p>
      <p className="library-subtitle mb-5 ml-3">segurança da sua toca no PawSpace</p>

      <div className="space-y-4">
        <PasswordInput label="Senha Atual" value={current} onChange={setCurrent} maxLength={PASSWORD_MAX} />
        <PasswordInput label="Nova Senha" value={next} onChange={setNext} maxLength={PASSWORD_MAX} />
        <PasswordInput
          label="Confirmar Nova Senha"
          value={confirm}
          onChange={setConfirm}
          maxLength={PASSWORD_MAX}
        />

        {shouldShowTurnstile && turnstileSiteKey ? (
          <div>
            <label className="field-label mb-2 block">Verificação de segurança</label>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-4">
              <TurnstileWidget
                siteKey={turnstileSiteKey}
                resetKey={turnstileResetKey}
                onVerify={(token) => {
                  setTurnstileToken(token);
                  setError(null);
                }}
                onExpire={() => {
                  setTurnstileToken(null);
                }}
                onError={(errorCode) => {
                  console.error('[Auth][turnstile] Widget error during password update', {
                    errorCode,
                  });
                  setTurnstileToken(null);
                  setError('A verificação de segurança falhou. Tente novamente.');
                }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {error ? <p className="feedback-text text-red-400/80">{error}</p> : null}
            {saved && !error ? (
              <p className="feedback-text text-[var(--text-secondary)]">Senha atualizada.</p>
            ) : null}
          </div>
          <button
            onClick={() => void handleSave()}
            disabled={isLoadingUser || isSaving || (shouldShowTurnstile && !turnstileToken)}
            className="button-label flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-4 transition-all duration-200 disabled:opacity-60 sm:w-auto"
            style={{
              borderColor: saved ? 'var(--border-visible)' : 'var(--border-muted)',
              color: saved ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: saved ? 'var(--bg-elevated)' : 'transparent',
            }}
          >
            {isSaving ? <Loader2 size={10} className="animate-spin" /> : null}
            {!isSaving && saved ? <Check size={10} /> : null}
            {isSaving ? 'Salvando...' : saved ? 'Salvo' : 'Atualizar senha'}
          </button>
        </div>
      </div>
    </section>
  );
}
