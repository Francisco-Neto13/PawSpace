'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import { createClient } from '@/shared/supabase/client';
import { LIMITS } from '@/lib/limits';

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
      <label className="field-label block mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(maxLength ? event.target.value.slice(0, maxLength) : event.target.value)}
          placeholder={placeholder ?? '********'}
          className="library-input field-input h-10 px-3.5 pr-10 placeholder:text-[var(--text-faint)]"
        />
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-secondary)] transition-colors"
        >
          {show ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      </div>
    </div>
  );
}

export default function PasswordSection() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saved, setSaved] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadingTimeout = window.setTimeout(() => {
      if (!mounted) return;
      setIsLoadingUser(false);
      setError((prev) => prev ?? 'Não foi possível carregar o usuário.');
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
      });

      if (signInError) {
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
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Falha ao atualizar senha.';
      setError(message);
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
        Senha
      </p>
      <p className="library-subtitle mb-5 ml-3">segurança da sua toca no PawSpace</p>

      <div className="space-y-4">
        <PasswordInput label="Senha Atual" value={current} onChange={setCurrent} maxLength={PASSWORD_MAX} />
        <PasswordInput label="Nova Senha" value={next} onChange={setNext} maxLength={PASSWORD_MAX} />
        <PasswordInput label="Confirmar Nova Senha" value={confirm} onChange={setConfirm} maxLength={PASSWORD_MAX} />

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {error && <p className="feedback-text text-red-400/80">{error}</p>}
            {saved && !error && <p className="feedback-text text-[var(--text-secondary)]">Senha atualizada.</p>}
          </div>
          <button
            onClick={() => void handleSave()}
            disabled={isLoadingUser || isSaving}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-4 button-label transition-all duration-200 disabled:opacity-60 sm:w-auto"
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
