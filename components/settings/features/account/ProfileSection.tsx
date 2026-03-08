'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Check, Loader2 } from 'lucide-react';
import { PawIcon } from '@/components/shared/PawIcon';
import { createClient } from '@/shared/supabase/client';

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
      setError(prev => prev ?? 'Nao foi possivel carregar o perfil.');
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

    if (nextName === initialUsername) {
      setSaved(true);
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    try {
      const { error: updateError } = await supabase.auth.updateUser(
        {
          data: { display_name: nextName, name: nextName },
        }
      );

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
      const message =
        saveError instanceof Error ? saveError.message : 'Falha ao salvar perfil.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white mb-1 flex items-center gap-2">
        <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
        Perfil
      </p>
      <p className="text-[9px] text-zinc-500 mb-6 ml-3">nome de usuario e foto</p>

      <div className="flex items-start gap-6">
        <div className="shrink-0">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative w-16 h-16 rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden group transition-all duration-200 hover:border-white/20"
          >
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl">U</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={14} className="text-white" />
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-[7px] text-zinc-700 uppercase tracking-wider font-bold text-center mt-1.5">
            Foto
          </p>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block mb-2">
              Nome de Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={isLoadingUser || isSaving}
              className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-[11px] font-bold tracking-wide outline-none focus:border-white/20 transition-colors placeholder:text-zinc-700 disabled:opacity-60"
              placeholder={isLoadingUser ? 'Carregando...' : 'Seu nome'}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              {error && (
                <p className="text-[8px] text-red-400/80 uppercase tracking-wider font-bold">
                  {error}
                </p>
              )}
              {saved && !error && (
                <p className="text-[8px] text-white/50 uppercase tracking-wider font-bold">
                  Perfil atualizado.
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
              {isSaving ? 'Salvando...' : saved ? 'Salvo' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
