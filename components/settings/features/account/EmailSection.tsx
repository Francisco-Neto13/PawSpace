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
      setError(prev => prev ?? 'Nao foi possivel carregar o email.');
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
      setError(
        'A atualizacao esta demorando. Verifique seu email e, se necessario, tente novamente.'
      );
    }, 20000);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: nextEmail,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setError(null);
      setSaved(true);
      setMessage(
        timedOut
          ? 'Atualizacao concluida. Confira seu email para confirmar a alteracao.'
          : 'Verifique seu email para confirmar a alteracao.'
      );
    } catch (saveError) {
      const messageText =
        saveError instanceof Error ? saveError.message : 'Falha ao atualizar email.';
      setError(messageText);
    } finally {
      window.clearTimeout(savingWatchdog);
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
        Email
      </p>
      <p className="text-[9px] text-zinc-500 mb-6 ml-3">endereco de email da conta</p>

      <div className="space-y-4">
        <div>
          <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block mb-2">
            Email Atual
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoadingUser || isSaving}
            className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-[11px] font-bold tracking-wide outline-none focus:border-white/20 transition-colors placeholder:text-zinc-700 disabled:opacity-60"
            placeholder={isLoadingUser ? 'Carregando...' : 'seu@email.com'}
          />
        </div>

        <div className="flex items-center justify-between pt-1 gap-4">
          <div>
            <p className="text-[8px] text-zinc-700 uppercase tracking-wider font-bold">
              Um link de confirmacao sera enviado para o novo email.
            </p>
            {error && (
              <p className="text-[8px] text-red-400/80 uppercase tracking-wider font-bold mt-1">
                {error}
              </p>
            )}
            {message && !error && (
              <p className="text-[8px] text-white/50 uppercase tracking-wider font-bold mt-1">
                {message}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              void handleSave();
            }}
            disabled={isLoadingUser || isSaving}
            className="flex items-center gap-2 px-4 py-2 border text-[9px] font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-60"
            style={{
              borderColor: saved ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              color: saved ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
              backgroundColor: saved ? 'rgba(255,255,255,0.06)' : 'transparent',
            }}
          >
            {isSaving ? <Loader2 size={10} className="animate-spin" /> : null}
            {!isSaving && saved ? <Check size={10} /> : null}
            {isSaving ? 'Salvando...' : saved ? 'Enviado' : 'Atualizar'}
          </button>
        </div>
      </div>
    </div>
  );
}
