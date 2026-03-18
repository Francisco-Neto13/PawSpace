'use client';

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Check, Loader2, Trash2 } from 'lucide-react';

import { removeProfileAvatar, uploadProfileAvatar } from '@/app/actions/profile';
import { PawIcon } from '@/components/shared/PawIcon';
import AvatarCropModal, {
  type AvatarCropSelection,
} from '@/components/settings/features/account/AvatarCropModal';
import { LIMITS } from '@/lib/limits';
import { createClient } from '@/shared/supabase/client';

const USERNAME_MAX = LIMITS.auth.displayName;
const AVATAR_SOURCE_MAX_BYTES = LIMITS.auth.avatarSourceMaxBytes;
const AVATAR_MAX_BYTES = LIMITS.auth.avatarMaxBytes;
const AVATAR_MAX_DIMENSION = LIMITS.auth.avatarMaxDimension;
const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function isLocalPreview(src: string | null) {
  if (!src) return false;
  return src.startsWith('data:') || src.startsWith('blob:');
}

function formatAvatarSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${Math.floor(bytes / 1024 / 1024)} MB`;
  }

  return `${Math.floor(bytes / 1024)} KB`;
}

function RemainingWarning({ current, max }: { current: number; max: number }) {
  const remaining = max - current;
  if (current === 0 || remaining > 10) return null;

  return <span className="ui-meta font-bold">{remaining}</span>;
}

function getDisplayNameFallback(name: string) {
  const trimmed = name.trim();
  return (trimmed.charAt(0) || 'U').toUpperCase();
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('avatar_preview_failed'));
    reader.readAsDataURL(file);
  });
}

function loadImageDimensions(src: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('avatar_dimensions_failed'));
    image.src = src;
  });
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('avatar_preview_failed'));
    image.src = src;
  });
}

async function createCroppedAvatarPreview(sourceUrl: string, selection: AvatarCropSelection) {
  const image = await loadImageElement(sourceUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('avatar_preview_context_failed');
  }

  const scaleX = image.naturalWidth / selection.renderedWidth;
  const scaleY = image.naturalHeight / selection.renderedHeight;
  const cropLeft = Math.max(0, Math.round(selection.crop.x * scaleX));
  const cropTop = Math.max(0, Math.round(selection.crop.y * scaleY));
  const cropWidth = Math.max(1, Math.round(selection.crop.width * scaleX));
  const cropHeight = Math.max(1, Math.round(selection.crop.height * scaleY));

  canvas.width = AVATAR_MAX_DIMENSION;
  canvas.height = AVATAR_MAX_DIMENSION;

  context.drawImage(
    image,
    cropLeft,
    cropTop,
    cropWidth,
    cropHeight,
    0,
    0,
    AVATAR_MAX_DIMENSION,
    AVATAR_MAX_DIMENSION
  );

  return canvas.toDataURL('image/webp', 0.92);
}

async function validateAvatarSourceFile(file: File) {
  if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type)) {
    return { success: false as const, error: 'Use uma imagem JPG, PNG ou WEBP.' };
  }

  if (file.size > AVATAR_SOURCE_MAX_BYTES) {
    return {
      success: false as const,
      error: `Escolha uma imagem de ate ${formatAvatarSize(AVATAR_SOURCE_MAX_BYTES)} para editar.`,
    };
  }

  const previewUrl = await readFileAsDataUrl(file);
  await loadImageDimensions(previewUrl);

  return { success: true as const, previewUrl };
}

export default function ProfileSection() {
  const [username, setUsername] = useState('');
  const [initialUsername, setInitialUsername] = useState('');
  const [saved, setSaved] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initialAvatarUrl, setInitialAvatarUrl] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarCrop, setPendingAvatarCrop] = useState<AvatarCropSelection | null>(null);
  const [cropSource, setCropSource] = useState<{ file: File; previewUrl: string } | null>(null);
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    const loadingTimeout = window.setTimeout(() => {
      if (!mounted) return;
      setIsLoadingUser(false);
      setError((previous) => previous ?? 'Nao foi possivel carregar o perfil.');
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
        const rawAvatarUrl = user.user_metadata?.avatar_url;
        const resolvedName = typeof rawName === 'string' ? rawName : '';
        const resolvedAvatarUrl =
          typeof rawAvatarUrl === 'string' && rawAvatarUrl.trim().length > 0 ? rawAvatarUrl.trim() : null;

        setUsername(resolvedName);
        setInitialUsername(resolvedName);
        setAvatarUrl(resolvedAvatarUrl);
        setInitialAvatarUrl(resolvedAvatarUrl);
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

  const avatarLetter = useMemo(() => getDisplayNameFallback(username || initialUsername), [username, initialUsername]);
  const showsLocalPreview = isLocalPreview(avatarUrl);

  const resetAvatarPicker = () => {
    if (fileRef.current) {
      fileRef.current.value = '';
    }

    setFileInputKey((current) => current + 1);
  };

  const emitProfileUpdate = (nextDisplayName: string, nextAvatarUrl: string | null) => {
    window.dispatchEvent(
      new CustomEvent('auth-profile-updated', {
        detail: {
          displayName: nextDisplayName,
          avatarUrl: nextAvatarUrl,
        },
      })
    );

    window.dispatchEvent(
      new CustomEvent('auth-display-name-updated', {
        detail: { displayName: nextDisplayName },
      })
    );
  };

  const handleSave = async () => {
    if (isSaving) return;

    setError(null);
    setSaved(false);

    const nextName = username.trim();
    if (!nextName) {
      setError('Informe um nome valido.');
      return;
    }

    if (nextName.length > USERNAME_MAX) {
      setError(`Nome pode ter no maximo ${USERNAME_MAX} caracteres.`);
      return;
    }

    const nameChanged = nextName !== initialUsername;
    const avatarChanged = Boolean(pendingAvatarFile) || (shouldRemoveAvatar && Boolean(initialAvatarUrl));

    if (!nameChanged && !avatarChanged) {
      setSaved(true);
      return;
    }

    setIsSaving(true);
    const supabase = createClient();
    const issues: string[] = [];
    let nextDisplayName = initialUsername;
    let nextAvatarUrl = initialAvatarUrl;
    let hasSuccessfulChange = false;

    try {
      if (nameChanged) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            display_name: nextName,
            name: nextName,
            ...(initialAvatarUrl ? { avatar_url: initialAvatarUrl } : {}),
          },
        });

        if (updateError) {
          issues.push('nao foi possivel salvar o nome agora');
        } else {
          nextDisplayName = nextName;
          setInitialUsername(nextName);
          hasSuccessfulChange = true;
        }
      }

      if (shouldRemoveAvatar && initialAvatarUrl) {
        const result = await removeProfileAvatar();
        if (!result.success) {
          issues.push(result.error ?? 'nao foi possivel remover o avatar');
        } else {
          nextAvatarUrl = null;
          setAvatarUrl(null);
          setInitialAvatarUrl(null);
          setPendingAvatarFile(null);
          setCropSource(null);
          setShouldRemoveAvatar(false);
          resetAvatarPicker();
          hasSuccessfulChange = true;
        }
      } else if (pendingAvatarFile) {
        const formData = new FormData();
        formData.append('file', pendingAvatarFile);
        if (pendingAvatarCrop) {
          formData.append('avatar_crop', JSON.stringify(pendingAvatarCrop));
        }
        const result = await uploadProfileAvatar(formData);

        if (!result.success) {
          issues.push(result.error ?? 'nao foi possivel salvar o avatar');
        } else {
          nextAvatarUrl = result.avatarUrl;
          setAvatarUrl(result.avatarUrl);
          setInitialAvatarUrl(result.avatarUrl);
          setPendingAvatarFile(null);
          setPendingAvatarCrop(null);
          setCropSource(null);
          setShouldRemoveAvatar(false);
          resetAvatarPicker();
          hasSuccessfulChange = true;
        }
      }

      if (hasSuccessfulChange) {
        emitProfileUpdate(nextDisplayName, nextAvatarUrl);
      }

      if (issues.length > 0) {
        if (hasSuccessfulChange) {
          setError(`Algumas mudancas foram salvas, mas ${issues.join(' e ')}.`);
        } else {
          setError(issues[0].charAt(0).toUpperCase() + issues[0].slice(1) + '.');
        }
        return;
      }

      setInitialUsername(nextDisplayName);
      setUsername(nextDisplayName);
      setInitialAvatarUrl(nextAvatarUrl);
      setSaved(true);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Falha ao salvar perfil.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSaved(false);

    try {
      const validation = await validateAvatarSourceFile(file);
      if (!validation.success) {
        setError(validation.error);
        return;
      }

      setCropSource({
        file,
        previewUrl: validation.previewUrl,
      });
      setShouldRemoveAvatar(false);
    } catch {
      setError('Nao foi possivel preparar o avatar para edicao.');
    } finally {
      resetAvatarPicker();
    }
  };

  const handleCropApply = async ({ selection }: { selection: AvatarCropSelection }) => {
    if (!cropSource) return;

    const previewUrl = await createCroppedAvatarPreview(cropSource.previewUrl, selection);

    setPendingAvatarFile(cropSource.file);
    setPendingAvatarCrop(selection);
    setShouldRemoveAvatar(false);
    setAvatarUrl(previewUrl);
    setCropSource(null);
    setError(null);
    setSaved(false);
  };

  const handleRemoveAvatar = () => {
    setError(null);
    setSaved(false);
    setPendingAvatarFile(null);
    setPendingAvatarCrop(null);
    setCropSource(null);

    if (initialAvatarUrl) {
      setShouldRemoveAvatar(true);
    } else {
      setShouldRemoveAvatar(false);
    }

    setAvatarUrl(null);
    resetAvatarPicker();
  };

  return (
    <>
      <section className="library-panel relative overflow-hidden p-6">
        <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

        <p className="library-kicker mb-1 flex items-center gap-2">
          <PawIcon className="h-3 w-3 shrink-0 text-[var(--text-secondary)]" />
          Perfil
        </p>
        <p className="library-subtitle mb-5 ml-3">identidade visual e nome da sua conta</p>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-6">
          <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={isLoadingUser || isSaving}
                  className="group relative h-[72px] w-[72px] overflow-hidden rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-panel)] transition-all duration-200 hover:border-[var(--border-visible)] disabled:opacity-60"
                >
                  {avatarUrl ? (
                    showsLocalPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Avatar do perfil" className="h-full w-full object-cover" draggable={false} />
                    ) : (
                      <Image src={avatarUrl} alt="Avatar do perfil" fill sizes="72px" className="object-cover" unoptimized />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-2xl font-black text-[var(--text-secondary)]">{avatarLetter}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-strong)] opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera size={14} className="text-[var(--text-primary)]" />
                  </div>
                </button>
                <input
                  key={fileInputKey}
                  ref={fileRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    void handleFileChange(event);
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="sidebar-title mb-1">Avatar da conta</p>
                <p className="ui-copy text-sm text-[var(--text-muted)]">
                  A imagem aparece no perfil e ao lado do seu nome na sidebar.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="ui-meta">
                Edite uma imagem de ate {formatAvatarSize(AVATAR_SOURCE_MAX_BYTES)}. O app salva uma versao final em WEBP com
                ate {formatAvatarSize(AVATAR_MAX_BYTES)} e {AVATAR_MAX_DIMENSION}x{AVATAR_MAX_DIMENSION}px.
              </p>
              {pendingAvatarFile ? (
                <p className="feedback-text text-[var(--text-secondary)]">Avatar pronto para salvar depois do recorte.</p>
              ) : null}
              {(avatarUrl || initialAvatarUrl) ? (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isLoadingUser || isSaving}
                  className="inline-flex items-center gap-1.5 button-label text-[var(--text-muted)] transition-colors hover:text-red-400/80 disabled:opacity-50"
                >
                  <Trash2 size={10} />
                  Remover avatar
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 lg:pl-1">
            <div>
              <p className="sidebar-title mb-1">Nome de exibicao</p>
              <p className="ui-copy text-sm text-[var(--text-muted)]">Esse nome aparece nas areas principais do app.</p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="field-label block">Nome no PawSpace</label>
                <RemainingWarning current={username.length} max={USERNAME_MAX} />
              </div>
              <input
                type="text"
                value={username}
                maxLength={USERNAME_MAX}
                onChange={(event) => setUsername(event.target.value.slice(0, USERNAME_MAX))}
                disabled={isLoadingUser || isSaving}
                className="library-input field-input h-10 px-3.5 placeholder:text-[var(--text-faint)] disabled:opacity-60"
                placeholder={isLoadingUser ? 'Carregando...' : 'Como voce quer aparecer'}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-[20px]">
                {error ? <p className="feedback-text text-red-400/80">{error}</p> : null}
                {saved && !error ? (
                  <p className="feedback-text text-[var(--text-secondary)]">Perfil do PawSpace atualizado.</p>
                ) : null}
              </div>
              <button
                onClick={() => void handleSave()}
                disabled={isLoadingUser || isSaving}
                className="button-label flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-4 transition-all duration-200 disabled:opacity-60 sm:w-auto"
                style={{
                  borderColor: saved ? 'var(--border-visible)' : 'var(--border-muted)',
                  color: saved ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: saved ? 'var(--bg-panel)' : 'transparent',
                }}
              >
                {isSaving ? <Loader2 size={10} className="animate-spin" /> : null}
                {!isSaving && saved ? <Check size={10} /> : null}
                {isSaving ? 'Salvando...' : saved ? 'Salvo' : 'Salvar perfil'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <AvatarCropModal
        source={cropSource}
        onCancel={() => setCropSource(null)}
        onApply={handleCropApply}
      />
    </>
  );
}
