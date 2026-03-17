'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import { createClient } from '@/shared/supabase/client';
import { LIMITS } from '@/lib/limits';

const EMAIL_MAX = LIMITS.auth.email;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RemainingWarning({ current, max }: { current: number; max: number }) {
  const remaining = max - current;
  if (current === 0 || remaining > 10) return null;

  return (
    <span className="ui-meta font-bold">
      {remaining}
    </span>
  );
}

export default function EmailSection() {
  const [email, setEmail] = useState('');
  const [initialEmail, setInitialEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadingTimeout = window.setTimeout(() => {
      if (!mounted) return;
      setIsLoadingUser(false);
      setError((prev) => prev ?? 'Não foi possível carregar o e-mail.');
    }, 8000);

    const loadUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!mounted) return;
        if (userError || !user) {
          setError('Sessão não encontrada.');
          return;
        }

        const currentEmail = user.email ?? '';
        setEmail(currentEmail);
        setInitialEmail(currentEmail);
      } catch {
        if (!mounted) return;
        setError('Falha ao carregar dados do usuário.');
      } finally {
        if (!mounted) return;
        window.clearTimeout(loadingTimeout);
        setIsLoadingUser(false);
      }
    };

    void loadUser();

    return () => {
      mounted = false;
      window.clearTimeout(loadingTimeout);
    };
  }, []);

  const handleSave = async () => {
    if (isSaving) return;

    setError(null);
    setMessage(null);
    setSaved(false);

    const nextEmail = email.trim().toLowerCase();
    if (!nextEmail) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (nextEmail.length > EMAIL_MAX) {
      setError(`E-mail pode ter no máximo ${EMAIL_MAX} caracteres.`);
      return;
    }
    if (!EMAIL_PATTERN.test(nextEmail)) {
      setError('Informe um e-mail válido.');
      return;
    }

    if (nextEmail === initialEmail.toLowerCase()) {
      setSaved(true);
      setMessage('Nenhuma alteração detectada.');
      return;
    }

    setIsSaving(true);
    const supabase = createClient();
    let timedOut = false;
    const savingWatchdog = window.setTimeout(() => {
      timedOut = true;
      setIsSaving(false);
      setError('A atualização está demorando. Verifique seu e-mail e tente novamente.');
    }, 20000);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: nextEmail,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSaved(true);
      setMessage(
        timedOut
          ? 'Atualização concluída. Confira seu e-mail para confirmar.'
          : 'Verifique seu e-mail para confirmar a alteração.'
      );
    } catch (saveError) {
      const text = saveError instanceof Error ? saveError.message : 'Falha ao atualizar e-mail.';
      setError(text);
    } finally {
      window.clearTimeout(savingWatchdog);
      setIsSaving(false);
    }
  };

  return (
    <section className="library-panel p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <p className="library-kicker mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
        Email
      </p>
      <p className="library-subtitle mb-5 ml-3">e-mail que protege o acesso à sua toca</p>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="field-label block">
              E-mail atual
            </label>
            <RemainingWarning current={email.length} max={EMAIL_MAX} />
          </div>
          <input
            type="email"
            value={email}
            maxLength={EMAIL_MAX}
            onChange={(event) => setEmail(event.target.value.slice(0, EMAIL_MAX))}
            disabled={isLoadingUser || isSaving}
            className="library-input field-input h-10 px-3.5 placeholder:text-[var(--text-faint)] disabled:opacity-60"
            placeholder={isLoadingUser ? 'Carregando...' : 'seu@email.com'}
          />
        </div>

        <div className="flex items-center justify-between pt-1 gap-4">
          <div>
            <p className="helper-text">
              Enviaremos um link de confirmação para a nova caixa de entrada.
            </p>
            {error && <p className="feedback-text text-red-400/80 mt-1">{error}</p>}
            {message && !error && (
              <p className="feedback-text text-[var(--text-secondary)] mt-1">{message}</p>
            )}
          </div>

          <button
            onClick={() => void handleSave()}
            disabled={isLoadingUser || isSaving}
            className="h-10 px-4 rounded-xl border flex items-center gap-2 button-label transition-all duration-200 disabled:opacity-60"
            style={{
              borderColor: saved ? 'var(--border-visible)' : 'var(--border-muted)',
              color: saved ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: saved ? 'var(--bg-elevated)' : 'transparent',
            }}
          >
            {isSaving ? <Loader2 size={10} className="animate-spin" /> : null}
            {!isSaving && saved ? <Check size={10} /> : null}
            {isSaving ? 'Salvando...' : saved ? 'Enviado' : 'Atualizar e-mail'}
          </button>
        </div>
      </div>
    </section>
  );
}
