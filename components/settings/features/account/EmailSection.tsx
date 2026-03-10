'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import { createClient } from '@/shared/supabase/client';

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
      setError((prev) => prev ?? 'Nao foi possivel carregar o email.');
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
          setError('Sessao nao encontrada.');
          return;
        }

        const currentEmail = user.email ?? '';
        setEmail(currentEmail);
        setInitialEmail(currentEmail);
      } catch {
        if (!mounted) return;
        setError('Falha ao carregar dados do usuario.');
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
      setError('Informe um email valido.');
      return;
    }

    if (nextEmail === initialEmail.toLowerCase()) {
      setSaved(true);
      setMessage('Nenhuma alteracao detectada.');
      return;
    }

    setIsSaving(true);
    const supabase = createClient();
    let timedOut = false;
    const savingWatchdog = window.setTimeout(() => {
      timedOut = true;
      setIsSaving(false);
      setError('A atualizacao esta demorando. Verifique seu email e tente novamente.');
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
          ? 'Atualizacao concluida. Confira seu email para confirmar.'
          : 'Verifique seu email para confirmar a alteracao.'
      );
    } catch (saveError) {
      const text = saveError instanceof Error ? saveError.message : 'Falha ao atualizar email.';
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
      <p className="library-subtitle mb-5 ml-3">endereco de email da conta</p>

      <div className="space-y-4">
        <div>
          <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-2">
            Email Atual
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoadingUser || isSaving}
            className="library-input h-10 px-3.5 text-[11px] font-bold tracking-wide placeholder:text-[var(--text-faint)] disabled:opacity-60"
            placeholder={isLoadingUser ? 'Carregando...' : 'seu@email.com'}
          />
        </div>

        <div className="flex items-center justify-between pt-1 gap-4">
          <div>
            <p className="text-[8px] text-[var(--text-faint)] uppercase tracking-wider font-bold">
              Um link de confirmacao sera enviado para o novo email.
            </p>
            {error && <p className="text-[8px] text-red-400/80 uppercase tracking-wider font-bold mt-1">{error}</p>}
            {message && !error && (
              <p className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider font-bold mt-1">{message}</p>
            )}
          </div>

          <button
            onClick={() => void handleSave()}
            disabled={isLoadingUser || isSaving}
            className="h-10 px-4 rounded-xl border flex items-center gap-2 text-[9px] font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-60"
            style={{
              borderColor: saved ? 'var(--border-visible)' : 'var(--border-muted)',
              color: saved ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: saved ? 'var(--bg-elevated)' : 'transparent',
            }}
          >
            {isSaving ? <Loader2 size={10} className="animate-spin" /> : null}
            {!isSaving && saved ? <Check size={10} /> : null}
            {isSaving ? 'Salvando...' : saved ? 'Enviado' : 'Atualizar'}
          </button>
        </div>
      </div>
    </section>
  );
}
