'use server';

import sharp from 'sharp';

import { LIMITS } from '@/shared/lib/limits';
import { enforceUserActionRateLimit, isUserScopedStoragePath } from '@/shared/server/actionSecurity';
import { getCurrentUser } from '@/shared/server/auth';
import { createAdminClient } from '@/shared/supabase/admin';
import { createClient } from '@/shared/supabase/server';

const AVATAR_BUCKET = 'profile-avatars';
const AVATAR_SOURCE_MAX_BYTES = LIMITS.auth.avatarSourceMaxBytes;
const AVATAR_MAX_BYTES = LIMITS.auth.avatarMaxBytes;
const AVATAR_CROP_MAX_CHARS = 2000;
const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_UPLOAD_RATE_LIMIT = 10;
const AVATAR_UPLOAD_WINDOW_MS = 10 * 60 * 1000;
const AVATAR_REMOVE_RATE_LIMIT = 10;
const AVATAR_REMOVE_WINDOW_MS = 10 * 60 * 1000;

let hasEnsuredAvatarBucket = false;

function isBucketAlreadyPresentError(message: string | undefined) {
  const text = (message ?? '').toLowerCase();
  return text.includes('already exists') || text.includes('duplicate');
}

async function ensureAvatarBucket() {
  if (hasEnsuredAvatarBucket) return { success: true as const };

  const adminClient = createAdminClient();
  if (!adminClient) {
    return {
      success: false as const,
      error: 'Upload de avatar nao configurado. Adicione SUPABASE_SERVICE_ROLE_KEY no ambiente.',
    };
  }

  const { error } = await adminClient.storage.createBucket(AVATAR_BUCKET, {
    public: true,
    fileSizeLimit: AVATAR_MAX_BYTES,
    allowedMimeTypes: ALLOWED_AVATAR_MIME_TYPES,
  });

  if (error && !isBucketAlreadyPresentError(error.message)) {
    console.error('[Profile Avatar] Falha ao preparar bucket:', error);
    return { success: false as const, error: 'Nao foi possivel preparar o espaco do avatar.' };
  }

  if (error && isBucketAlreadyPresentError(error.message)) {
    const { error: updateError } = await adminClient.storage.updateBucket(AVATAR_BUCKET, {
      public: true,
      fileSizeLimit: AVATAR_MAX_BYTES,
      allowedMimeTypes: ALLOWED_AVATAR_MIME_TYPES,
    });

    if (updateError) {
      console.error('[Profile Avatar] Falha ao atualizar bucket:', updateError);
      return { success: false as const, error: 'Nao foi possivel ajustar os limites do avatar.' };
    }
  }

  hasEnsuredAvatarBucket = true;
  return { success: true as const };
}

function resolveAvatarMetadata(user: { user_metadata?: Record<string, unknown> } | null) {
  const avatarPath = typeof user?.user_metadata?.avatar_path === 'string' ? user.user_metadata.avatar_path : null;
  const avatarUrl = typeof user?.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null;

  return {
    avatarPath: avatarPath && avatarPath.trim().length > 0 ? avatarPath.trim() : null,
    avatarUrl: avatarUrl && avatarUrl.trim().length > 0 ? avatarUrl.trim() : null,
  };
}

function getAvatarFilePath(userId: string) {
  return `${userId}/avatar.webp`;
}

function getAvatarPublicUrl(filePath: string, adminClient: NonNullable<ReturnType<typeof createAdminClient>>) {
  const {
    data: { publicUrl },
  } = adminClient.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

  return `${publicUrl}?v=${Date.now()}`;
}

async function removeAvatarFile(filePath: string | null, userId?: string) {
  if (!filePath) return;
  if (userId && !isUserScopedStoragePath(filePath, userId)) return;

  const adminClient = createAdminClient();
  if (!adminClient) return;

  const { error } = await adminClient.storage.from(AVATAR_BUCKET).remove([filePath]);
  if (error) {
    console.warn('[Profile Avatar] Falha ao remover avatar antigo:', error.message);
  }
}

async function readFileBytes(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

type AvatarCropPayload = {
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  naturalWidth: number;
  naturalHeight: number;
  renderedWidth: number;
  renderedHeight: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseAvatarCrop(rawValue: FormDataEntryValue | null) {
  if (rawValue === null) {
    return { crop: null as AvatarCropPayload | null, invalid: false };
  }

  if (typeof rawValue !== 'string') {
    return { crop: null as AvatarCropPayload | null, invalid: true };
  }

  const value = rawValue.trim();
  if (!value) {
    return { crop: null as AvatarCropPayload | null, invalid: false };
  }

  if (value.length > AVATAR_CROP_MAX_CHARS) {
    return { crop: null as AvatarCropPayload | null, invalid: true };
  }

  try {
    const parsed = JSON.parse(value) as AvatarCropPayload;
    return isValidAvatarCropPayload(parsed)
      ? { crop: parsed, invalid: false }
      : { crop: null as AvatarCropPayload | null, invalid: true };
  } catch {
    return { crop: null as AvatarCropPayload | null, invalid: true };
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidAvatarCropPayload(value: AvatarCropPayload | null) {
  if (!value || typeof value !== 'object' || typeof value.crop !== 'object' || !value.crop) {
    return false;
  }

  const crop = value.crop;
  return (
    isFiniteNumber(crop.x) &&
    isFiniteNumber(crop.y) &&
    isFiniteNumber(crop.width) &&
    isFiniteNumber(crop.height) &&
    isFiniteNumber(value.naturalWidth) &&
    isFiniteNumber(value.naturalHeight) &&
    isFiniteNumber(value.renderedWidth) &&
    isFiniteNumber(value.renderedHeight) &&
    crop.x >= 0 &&
    crop.y >= 0 &&
    crop.width > 0 &&
    crop.height > 0 &&
    value.naturalWidth > 0 &&
    value.naturalHeight > 0 &&
    value.renderedWidth > 0 &&
    value.renderedHeight > 0
  );
}

async function buildAvatarUploadPayload(params: {
  fileBytes: Uint8Array;
  cropPayload: AvatarCropPayload | null;
}) {
  const { fileBytes, cropPayload } = params;

  const baseImage = sharp(fileBytes, { failOn: 'none' }).rotate();
  const metadata = await baseImage.metadata();
  const sourceWidth = metadata.width ?? cropPayload?.naturalWidth ?? null;
  const sourceHeight = metadata.height ?? cropPayload?.naturalHeight ?? null;

  if (!sourceWidth || !sourceHeight) {
    throw new Error('avatar_source_metadata_failed');
  }

  let pipeline = baseImage;

  if (cropPayload) {
    const scaleX = sourceWidth / cropPayload.renderedWidth;
    const scaleY = sourceHeight / cropPayload.renderedHeight;
    const left = clamp(Math.round(cropPayload.crop.x * scaleX), 0, Math.max(0, sourceWidth - 1));
    const top = clamp(Math.round(cropPayload.crop.y * scaleY), 0, Math.max(0, sourceHeight - 1));
    const width = clamp(Math.round(cropPayload.crop.width * scaleX), 1, sourceWidth - left);
    const height = clamp(Math.round(cropPayload.crop.height * scaleY), 1, sourceHeight - top);

    pipeline = pipeline.extract({ left, top, width, height });

  }

  const buffer = await pipeline
    .resize(LIMITS.auth.avatarMaxDimension, LIMITS.auth.avatarMaxDimension, {
      fit: 'cover',
      position: 'centre',
    })
    .webp({ quality: 86 })
    .toBuffer();

  return {
    bytes: new Uint8Array(buffer),
    contentType: 'image/webp',
  };
}

async function verifyUploadedAvatar(filePath: string) {
  const adminClient = createAdminClient();
  if (!adminClient) {
    return { success: false as const, error: 'Upload de avatar nao configurado.' };
  }

  const pathSegments = filePath.split('/');
  const fileName = pathSegments.pop() ?? filePath;
  const folder = pathSegments.join('/');

  const { data: objects, error: listError } = await adminClient.storage.from(AVATAR_BUCKET).list(folder, {
    limit: 20,
    search: fileName,
  });

  if (listError) {
    console.error('[Profile Avatar] Falha ao verificar avatar no Storage:', listError);
    return { success: false as const, error: 'Nao foi possivel confirmar o avatar no Storage.' };
  }

  const matched = objects.find((object) => object.name === fileName);
  if (!matched) {
    return { success: false as const, error: 'O avatar nao apareceu no Storage apos o upload.' };
  }

  if (typeof matched.metadata?.size === 'number' && matched.metadata.size <= 0) {
    return { success: false as const, error: 'O avatar foi salvo sem conteudo no Storage.' };
  }

  return { success: true as const };
}

export async function uploadProfileAvatar(formData: FormData) {
  try {
    const userClient = await createClient();
    const user = await getCurrentUser(userClient);

    if (!user) {
      return { success: false as const, error: 'Sessao nao encontrada.' };
    }

    const file = formData.get('file');
    const cropResult = parseAvatarCrop(formData.get('avatar_crop'));
    if (cropResult.invalid) {
      return { success: false as const, error: 'Recorte de avatar invalido.' };
    }

    const rateLimit = enforceUserActionRateLimit({
      scope: 'upload-avatar',
      userId: user.id,
      limit: AVATAR_UPLOAD_RATE_LIMIT,
      windowMs: AVATAR_UPLOAD_WINDOW_MS,
    });
    if (!rateLimit.allowed) {
      return { success: false as const, error: 'Muitos envios de avatar. Tente novamente em instantes.' };
    }

    const cropPayload = cropResult.crop;
    if (!(file instanceof File)) {
      return { success: false as const, error: 'Nenhum arquivo de avatar foi enviado.' };
    }

    if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type)) {
      return { success: false as const, error: 'Use uma imagem JPG, PNG ou WEBP.' };
    }

    if (file.size > AVATAR_SOURCE_MAX_BYTES) {
      return {
        success: false as const,
        error: `A imagem original excede o limite de ${Math.floor(AVATAR_SOURCE_MAX_BYTES / (1024 * 1024))} MB.`,
      };
    }

    const fileBytes = await readFileBytes(file);
    if (fileBytes.byteLength === 0) {
      return { success: false as const, error: 'O avatar gerado ficou vazio. Tente refazer o recorte.' };
    }

    const processedAvatar = await buildAvatarUploadPayload({
      fileBytes,
      cropPayload,
    });

    if (processedAvatar.bytes.byteLength > AVATAR_MAX_BYTES) {
      return {
        success: false as const,
        error: `O avatar final excede o limite de ${Math.floor(AVATAR_MAX_BYTES / 1024)} KB. Tente um recorte mais fechado ou uma imagem menor.`,
      };
    }

    const bucketResult = await ensureAvatarBucket();
    if (!bucketResult.success) {
      return bucketResult;
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return { success: false as const, error: 'Upload de avatar nao configurado.' };
    }

    const currentAvatar = resolveAvatarMetadata(user);
    const filePath = getAvatarFilePath(user.id);

    const { error: uploadError } = await adminClient.storage.from(AVATAR_BUCKET).upload(filePath, processedAvatar.bytes, {
      contentType: processedAvatar.contentType,
      upsert: true,
    });

    if (uploadError) {
      console.error('[Profile Avatar] Falha no upload:', uploadError);
      return { success: false as const, error: 'Nao foi possivel enviar o avatar agora.' };
    }

    const verification = await verifyUploadedAvatar(filePath);
    if (!verification.success) {
      await removeAvatarFile(filePath, user.id);
      return verification;
    }

    const publicUrl = getAvatarPublicUrl(filePath, adminClient);

    const { error: updateError } = await userClient.auth.updateUser({
      data: {
        ...user.user_metadata,
        avatar_path: null,
        avatar_url: publicUrl,
      },
    });

    if (updateError) {
      await removeAvatarFile(filePath, user.id);
      console.error('[Profile Avatar] Falha ao salvar metadata do avatar:', updateError);
      return { success: false as const, error: 'Nao foi possivel vincular o avatar ao perfil.' };
    }

    if (currentAvatar.avatarPath && currentAvatar.avatarPath !== filePath) {
      await removeAvatarFile(currentAvatar.avatarPath, user.id);
    }

    return {
      success: true as const,
      avatarUrl: publicUrl,
    };
  } catch (error) {
    console.error('[Profile Avatar] Falha inesperada no upload:', error);
    return { success: false as const, error: 'Falha inesperada ao salvar o avatar.' };
  }
}

export async function removeProfileAvatar() {
  try {
    const userClient = await createClient();
    const user = await getCurrentUser(userClient);

    if (!user) {
      return { success: false as const, error: 'Sessao nao encontrada.' };
    }

    const rateLimit = enforceUserActionRateLimit({
      scope: 'remove-avatar',
      userId: user.id,
      limit: AVATAR_REMOVE_RATE_LIMIT,
      windowMs: AVATAR_REMOVE_WINDOW_MS,
    });
    if (!rateLimit.allowed) {
      return { success: false as const, error: 'Muitas tentativas de remocao de avatar. Tente novamente em instantes.' };
    }

    const currentAvatar = resolveAvatarMetadata(user);
    const filePath = getAvatarFilePath(user.id);

    if (!currentAvatar.avatarPath && !currentAvatar.avatarUrl) {
      return { success: true as const };
    }

    const { error: updateError } = await userClient.auth.updateUser({
      data: {
        ...user.user_metadata,
        avatar_path: null,
        avatar_url: null,
      },
    });

    if (updateError) {
      console.error('[Profile Avatar] Falha ao limpar metadata do avatar:', updateError);
      return { success: false as const, error: 'Nao foi possivel remover o avatar agora.' };
    }

    await removeAvatarFile(filePath, user.id);
    if (currentAvatar.avatarPath && currentAvatar.avatarPath !== filePath && isUserScopedStoragePath(currentAvatar.avatarPath, user.id)) {
      await removeAvatarFile(currentAvatar.avatarPath, user.id);
    }
    return { success: true as const };
  } catch (error) {
    console.error('[Profile Avatar] Falha inesperada na remocao:', error);
    return { success: false as const, error: 'Falha inesperada ao remover o avatar.' };
  }
}

export async function resetAvatarBucketStateForTests() {
  hasEnsuredAvatarBucket = false;
}
