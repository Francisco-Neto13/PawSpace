'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import { createClient } from '@/shared/supabase/client';

function PasswordInput({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] block mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '********'}
          className="w-full bg-[var(--bg-input)] border border-[var(--border-muted)] rounded-lg px-4 py-2.5 pr-10 text-[var(--text-primary)] text-[11px] font-bold tracking-wide outline-none focus:border-[var(--border-visible)] transition-colors placeholder:text-[var(--text-faint)]"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
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
      setError(prev => prev ?? 'Nao foi possivel carregar o usuario.');
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
          setError('Sessao nao encontrada.');
          return;
        }

        setUserEmail(user.email);
      } catch {
        if (!mounted) return;
        setError('Falha ao carregar dados do usuario.');
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

    if (next !== confirm) {
      setError('As senhas nao coincidem.');
      return;
    }

    if (!userEmail) {
      setError('Nao foi possivel validar o usuario atual.');
      return;
    }

    setIsSaving(true);
    const savingWatchdog = window.setTimeout(() => {
      setIsSaving(false);
      setError(
        'A atualizacao esta demorando. Verifique se a senha mudou e tente novamente.'
      );
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

      setError(null);
      setSaved(true);
      setCurrent('');
      setNext('');
      setConfirm('');
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
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
        Senha
      </p>
      <p className="text-[9px] text-[var(--text-muted)] mb-6 ml-3">alterar senha de acesso</p>

      <div className="space-y-4">
        <PasswordInput label="Senha Atual" value={current} onChange={setCurrent} />
        <PasswordInput label="Nova Senha" value={next} onChange={setNext} />
        <PasswordInput label="Confirmar Nova Senha" value={confirm} onChange={setConfirm} />

        <div className="flex items-center justify-between pt-1">
          <div>
            {error && (
              <p className="text-[8px] text-red-400/80 uppercase tracking-wider font-bold">{error}</p>
            )}
            {saved && !error && (
              <p className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Senha atualizada.</p>
            )}
          </div>
          <button
            onClick={() => {
              void handleSave();
            }}
            disabled={isLoadingUser || isSaving}
            className="flex items-center gap-2 px-4 py-2 border text-[9px] font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-60"
            style={{
              borderColor: saved ? 'var(--border-visible)' : 'var(--border-muted)',
              color: saved ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: saved ? 'var(--bg-elevated)' : 'transparent',
            }}
          >
            {isSaving ? <Loader2 size={10} className="animate-spin" /> : null}
            {!isSaving && saved ? <Check size={10} /> : null}
            {isSaving ? 'Salvando...' : saved ? 'Salvo' : 'Alterar Senha'}
          </button>
        </div>
      </div>
    </div>
  );
}
