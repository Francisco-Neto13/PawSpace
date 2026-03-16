'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import prisma from '@/shared/lib/prisma';
import { createClient } from '@/shared/supabase/server';

const PDF_BUCKET = 'biblioteca-pdfs';
const STORAGE_DELETE_BATCH_SIZE = 100;
const DELETE_TEST_ROLLBACK = '__ACCOUNT_DELETE_ROLLBACK__';

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

async function canDeleteAuthUserViaDatabase(userId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe('DELETE FROM auth.users WHERE id = $1::uuid', userId);
      throw new Error(DELETE_TEST_ROLLBACK);
    });
    return false;
  } catch (error) {
    if (error instanceof Error && error.message === DELETE_TEST_ROLLBACK) {
      return true;
    }

    console.error('[Account Delete] Falha no teste de exclusao via banco:', error);
    return false;
  }
}

async function removeStoredFiles(fileKeys: string[], userClient: Awaited<ReturnType<typeof createClient>>) {
  if (fileKeys.length === 0) return;

  for (const batch of chunkArray(fileKeys, STORAGE_DELETE_BATCH_SIZE)) {
    const { error } = await userClient.storage.from(PDF_BUCKET).remove(batch);
    if (error) {
      console.warn('[Account Delete] Nao foi possivel remover alguns PDFs da estante:', error.message);
    }
  }
}

async function deleteAuthUser(userId: string) {
  const adminClient = createAdminClient();

  if (adminClient) {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) {
      console.error('[Account Delete] Falha ao remover usuario via admin:', error);
      return {
        success: false as const,
        error: 'Nao foi possivel remover a conta de acesso no Supabase.',
      };
    }

    return { success: true as const };
  }

  try {
    await prisma.$executeRawUnsafe('DELETE FROM auth.users WHERE id = $1::uuid', userId);
    return { success: true as const };
  } catch (error) {
    console.error('[Account Delete] Falha ao remover usuario via banco:', error);
    return {
      success: false as const,
      error: 'Nao foi possivel remover a autenticacao da conta. Configure SUPABASE_SERVICE_ROLE_KEY para habilitar a exclusao completa.',
    };
  }
}

export async function deleteCurrentAccount() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Sessao nao encontrada.' };
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      const canDeleteViaDatabase = await canDeleteAuthUserViaDatabase(user.id);
      if (!canDeleteViaDatabase) {
        return {
          success: false,
          error: 'Exclusao de conta nao configurada. Adicione SUPABASE_SERVICE_ROLE_KEY no ambiente para habilitar essa acao.',
        };
      }
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

    await prisma.$transaction([
      prisma.journalEntry.deleteMany({ where: { userId: user.id } }),
      prisma.libraryContent.deleteMany({ where: { userId: user.id } }),
      prisma.skill.deleteMany({ where: { userId: user.id } }),
    ]);

    const authDeletion = await deleteAuthUser(user.id);
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
