'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Check, Loader2 } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import { createClient } from '@/shared/supabase/client';
import { LIMITS } from '@/lib/limits';

const USERNAME_MAX = LIMITS.auth.displayName;

function RemainingWarning({ current, max }: { current: number; max: number }) {
  const remaining = max - current;
  if (current === 0 || remaining > 10) return null;

  return (
    <span className="text-[9px] font-bold text-[var(--text-muted)]">
      {remaining}
    </span>
  );
}

export default function ProfileSection() {
  const [username, setUsername] = useState('');
  const [initialUsername, setInitialUsername] = useState('');
  const [saved, setSaved] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    const loadingTimeout = window.setTimeout(() => {
      if (!mounted) return;
      setIsLoadingUser(false);
      setError((prev) => prev ?? 'Nao foi possivel carregar o perfil.');
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

        const rawName = user.user_metadata?.display_name ?? user.user_metadata?.name ?? '';
        const resolvedName = typeof rawName === 'string' ? rawName : '';
        setUsername(resolvedName);
        setInitialUsername(resolvedName);
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
    setSaved(false);

    const nextName = username.trim();
    if (!nextName) {
      setError('Informe um nome de usuario valido.');
      return;
    }
    if (nextName.length > USERNAME_MAX) {
      setError(`Nome de usuario pode ter no maximo ${USERNAME_MAX} caracteres.`);
      return;
    }

    if (nextName === initialUsername) {
      setSaved(true);
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { display_name: nextName, name: nextName },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setInitialUsername(nextName);
      window.dispatchEvent(
        new CustomEvent('auth-display-name-updated', {
          detail: { displayName: nextName },
        })
      );
      setSaved(true);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Falha ao salvar perfil.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <section className="library-panel p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      <p className="library-kicker mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
        Perfil
      </p>
      <p className="library-subtitle mb-5 ml-3">nome de usuario e foto</p>

      <div className="flex items-start gap-5">
        <div className="shrink-0">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative w-16 h-16 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-elevated)] overflow-hidden group transition-all duration-200 hover:border-[var(--border-visible)]"
          >
            {avatar ? (
              <Image src={avatar} alt="avatar" fill sizes="64px" className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl text-[var(--text-secondary)]">U</span>
              </div>
            )}
            <div className="absolute inset-0 bg-[var(--bg-strong)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={14} className="text-[var(--text-primary)]" />
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <p className="text-[7px] text-[var(--text-faint)] uppercase tracking-wider font-bold text-center mt-1.5">Foto</p>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] block">
                Nome de Usuario
              </label>
              <RemainingWarning current={username.length} max={USERNAME_MAX} />
            </div>
            <input
              type="text"
              value={username}
              maxLength={USERNAME_MAX}
              onChange={(event) => setUsername(event.target.value.slice(0, USERNAME_MAX))}
              disabled={isLoadingUser || isSaving}
              className="library-input h-10 px-3.5 text-[11px] font-bold tracking-wide placeholder:text-[var(--text-faint)] disabled:opacity-60"
              placeholder={isLoadingUser ? 'Carregando...' : 'Seu nome'}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              {error && <p className="text-[8px] text-red-400/80 uppercase tracking-wider font-bold">{error}</p>}
              {saved && !error && <p className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Perfil atualizado.</p>}
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
              {isSaving ? 'Salvando...' : saved ? 'Salvo' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
