'use server';

import sharp from 'sharp';

import { LIMITS } from '@/shared/lib/limits';
import { getCurrentUser } from '@/shared/server/auth';
import { createAdminClient } from '@/shared/supabase/admin';
import { createClient } from '@/shared/supabase/server';

const AVATAR_BUCKET = 'profile-avatars';
const AVATAR_SOURCE_MAX_BYTES = LIMITS.auth.avatarSourceMaxBytes;
const AVATAR_MAX_BYTES = LIMITS.auth.avatarMaxBytes;
const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

async function removeAvatarFile(filePath: string | null) {
  if (!filePath) return;

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
  if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AvatarCropPayload;
  } catch {
    return null;
  }
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
    extension: 'webp',
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
    const cropPayload = parseAvatarCrop(formData.get('avatar_crop'));
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
    const filePath = `${user.id}/avatar-${Date.now()}.${processedAvatar.extension}`;

    const { error: uploadError } = await adminClient.storage.from(AVATAR_BUCKET).upload(filePath, processedAvatar.bytes, {
      contentType: processedAvatar.contentType,
      upsert: false,
    });

    if (uploadError) {
      console.error('[Profile Avatar] Falha no upload:', uploadError);
      return { success: false as const, error: 'Nao foi possivel enviar o avatar agora.' };
    }

    const verification = await verifyUploadedAvatar(filePath);
    if (!verification.success) {
      await removeAvatarFile(filePath);
      return verification;
    }

    const {
      data: { publicUrl },
    } = adminClient.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

    const { error: updateError } = await userClient.auth.updateUser({
      data: {
        ...user.user_metadata,
        avatar_path: filePath,
        avatar_url: publicUrl,
      },
    });

    if (updateError) {
      await removeAvatarFile(filePath);
      console.error('[Profile Avatar] Falha ao salvar metadata do avatar:', updateError);
      return { success: false as const, error: 'Nao foi possivel vincular o avatar ao perfil.' };
    }

    if (currentAvatar.avatarPath && currentAvatar.avatarPath !== filePath) {
      await removeAvatarFile(currentAvatar.avatarPath);
    }

    return {
      success: true as const,
      avatarUrl: publicUrl,
      avatarPath: filePath,
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

    const currentAvatar = resolveAvatarMetadata(user);
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

    await removeAvatarFile(currentAvatar.avatarPath);
    return { success: true as const };
  } catch (error) {
    console.error('[Profile Avatar] Falha inesperada na remocao:', error);
    return { success: false as const, error: 'Falha inesperada ao remover o avatar.' };
  }
}
