'use server';

import prisma from '@/shared/lib/prisma';
import { getCurrentUser, type ServerSupabaseClient } from '@/shared/server/auth';
import { createAdminClient } from '@/shared/supabase/admin';
import { createClient } from '@/shared/supabase/server';

const PDF_BUCKET = 'biblioteca-pdfs';
const AVATAR_BUCKET = 'profile-avatars';
const STORAGE_DELETE_BATCH_SIZE = 100;

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

async function removeStoredFiles(fileKeys: string[], userClient: ServerSupabaseClient) {
  if (fileKeys.length === 0) return;

  for (const batch of chunkArray(fileKeys, STORAGE_DELETE_BATCH_SIZE)) {
    const { error } = await userClient.storage.from(PDF_BUCKET).remove(batch);
    if (error) {
      console.warn('[Account Delete] Nao foi possivel remover alguns PDFs da estante:', error.message);
    }
  }
}

async function removeAvatarFile(avatarPath: string | null, userClient: ServerSupabaseClient) {
  if (!avatarPath) return;

  const adminClient = createAdminClient();
  if (adminClient) {
    const { error } = await adminClient.storage.from(AVATAR_BUCKET).remove([avatarPath]);
    if (error) {
      console.warn('[Account Delete] Nao foi possivel remover o avatar do perfil:', error.message);
    }
    return;
  }

  const { error } = await userClient.storage.from(AVATAR_BUCKET).remove([avatarPath]);
  if (error) {
    console.warn('[Account Delete] Nao foi possivel remover o avatar do perfil:', error.message);
  }
}

async function deleteAuthUser(userId: string, adminClient: NonNullable<ReturnType<typeof createAdminClient>>) {
  try {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) {
      console.error('[Account Delete] Falha ao remover usuario via admin:', error);
      return {
        success: false as const,
        error: 'Nao foi possivel remover a conta de acesso no Supabase.',
      };
    }

    return { success: true as const };
  } catch (error) {
    console.error('[Account Delete] Falha inesperada ao remover usuario via admin:', error);
    return {
      success: false as const,
      error: 'Nao foi possivel remover a autenticacao da conta.',
    };
  }
}

export async function deleteCurrentAccount() {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser(supabase);

    if (!user) {
      return { success: false, error: 'Sessao nao encontrada.' };
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return {
        success: false,
        error: 'Exclusao de conta nao configurada. Adicione SUPABASE_SERVICE_ROLE_KEY no ambiente para habilitar essa acao.',
      };
    }

    const storedFiles = await prisma.libraryContent.findMany({
      where: {
        userId: user.id,
        fileKey: {
          not: null,
        },
      },
      select: {
        fileKey: true,
      },
    });

    const fileKeys = [...new Set(storedFiles.map((item) => item.fileKey).filter(Boolean) as string[])];
    await removeStoredFiles(fileKeys, supabase);

    const avatarPath =
      typeof user.user_metadata?.avatar_path === 'string' && user.user_metadata.avatar_path.trim().length > 0
        ? user.user_metadata.avatar_path.trim()
        : null;
    await removeAvatarFile(avatarPath, supabase);

    await prisma.$transaction([
      prisma.journalEntry.deleteMany({ where: { userId: user.id } }),
      prisma.libraryContent.deleteMany({ where: { userId: user.id } }),
      prisma.skill.deleteMany({ where: { userId: user.id } }),
    ]);

    const authDeletion = await deleteAuthUser(user.id, adminClient);
    if (!authDeletion.success) {
      return { success: false, error: authDeletion.error };
    }

    await supabase.auth.signOut();

    return { success: true };
  } catch (error) {
    console.error('[Account Delete] Falha inesperada:', error);
    return { success: false, error: 'Nao foi possivel deletar sua conta agora.' };
  }
}
