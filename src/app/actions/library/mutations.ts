'use server';

import prisma from '@/shared/lib/prisma';
import { createAdminClient } from '@/shared/supabase/admin';
import {
  enforceUserActionRateLimit,
  isUserScopedStoragePath,
  looksLikePdfBytes,
  normalizeHttpUrl,
  validateIdentifier,
} from '@/shared/server/actionSecurity';
import { getAuthUser } from '@/shared/server/auth';
import { ContentInput } from './types';
import { LIMITS } from '@/shared/lib/limits';

const MAX_CONTENTS = LIMITS.quantity.contentsPerNode;
const TITLE_MAX = LIMITS.library.title;
const URL_MAX = LIMITS.library.url;
const BODY_MAX = LIMITS.library.body;
const PDF_MAX_BYTES = LIMITS.library.pdfMaxBytes;
const PDF_BUCKET = 'biblioteca-pdfs';
const PDF_MIME_TYPES = ['application/pdf'];
const CONTENT_ID_MAX = 128;
const SKILL_ID_MAX = 128;
const ADD_CONTENT_RATE_LIMIT = 30;
const ADD_CONTENT_WINDOW_MS = 5 * 60 * 1000;
const DELETE_CONTENT_RATE_LIMIT = 30;
const DELETE_CONTENT_WINDOW_MS = 5 * 60 * 1000;
const UPLOAD_PDF_RATE_LIMIT = 10;
const UPLOAD_PDF_WINDOW_MS = 10 * 60 * 1000;
const CONTENT_TYPES = new Set(['link', 'video', 'pdf', 'note']);

function getLibraryContentUrl(content: {
  id: string;
  type: string;
  fileKey?: string | null;
  url?: string | null;
}) {
  if (content.type === 'pdf' && content.fileKey) {
    return `/api/library/files/${content.id}`;
  }

  return content.url ?? null;
}

function toClientContent(content: {
  id: string;
  skillId: string;
  type: string;
  title: string;
  url?: string | null;
  fileKey?: string | null;
  body?: string | null;
  createdAt: Date;
}) {
  return {
    id: content.id,
    skillId: content.skillId,
    type: content.type,
    title: content.title,
    url: getLibraryContentUrl(content),
    body: content.body ?? null,
    createdAt: content.createdAt,
  };
}

function isBucketAlreadyPresentError(message: string | undefined) {
  const text = (message ?? '').toLowerCase();
  return text.includes('already exists') || text.includes('duplicate');
}

async function ensurePdfBucketSecurity() {
  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error('pdf_storage_not_configured');
  }

  const { error } = await adminClient.storage.createBucket(PDF_BUCKET, {
    public: false,
    fileSizeLimit: PDF_MAX_BYTES,
    allowedMimeTypes: PDF_MIME_TYPES,
  });

  if (error && !isBucketAlreadyPresentError(error.message)) {
    console.error('[Library Mutation] Falha ao preparar bucket de PDF:', error);
    throw new Error('pdf_bucket_setup_failed');
  }

  if (error && isBucketAlreadyPresentError(error.message)) {
    const { error: updateError } = await adminClient.storage.updateBucket(PDF_BUCKET, {
      public: false,
      fileSizeLimit: PDF_MAX_BYTES,
      allowedMimeTypes: PDF_MIME_TYPES,
    });

    if (updateError) {
      console.error('[Library Mutation] Falha ao ajustar bucket de PDF:', updateError);
      throw new Error('pdf_bucket_update_failed');
    }
  }
}

function getPdfStorageClient() {
  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error('pdf_storage_not_configured');
  }

  return adminClient;
}

async function resolveOwnedSkillId(skillIdInput: string, userId: string) {
  const validated = validateIdentifier(skillIdInput, { maxLength: SKILL_ID_MAX });
  if (!validated.ok || !validated.value) return { skillId: null as string | null, error: 'Skill invalida.' };

  const skill = await prisma.skill.findFirst({
    where: { id: validated.value, userId },
    select: { id: true },
  });

  if (!skill) return { skillId: null as string | null, error: 'Skill nao encontrada para este usuario.' };
  return { skillId: skill.id };
}

export async function addContent(data: ContentInput) {
  const totalStart = Date.now();
  try {
    const userId = await getAuthUser();
    if (!userId) throw new Error('Usuario nao identificado.');

    const rateLimit = enforceUserActionRateLimit({
      scope: 'library-add-content',
      userId,
      limit: ADD_CONTENT_RATE_LIMIT,
      windowMs: ADD_CONTENT_WINDOW_MS,
    });
    if (!rateLimit.allowed) {
      return { success: false, error: 'Muitas tentativas de salvar conteudo. Tente novamente em instantes.' };
    }

    const title = (data.title || '').trim();
    const body = (data.body || '').trim();

    if (!CONTENT_TYPES.has(data.type)) {
      return { success: false, error: 'Tipo de conteudo invalido.' };
    }
    if (!title) {
      return { success: false, error: 'Titulo obrigatorio.' };
    }

    if (title.length > TITLE_MAX) {
      return { success: false, error: `Titulo pode ter no maximo ${TITLE_MAX} caracteres.` };
    }
    if (body && body.length > BODY_MAX) {
      return { success: false, error: `Nota pode ter no maximo ${BODY_MAX} caracteres.` };
    }
    if (data.fileKey) {
      return { success: false, error: 'File keys diretas nao sao permitidas nesta acao.' };
    }
    if (data.type === 'note' && !body) {
      return { success: false, error: 'Nota obrigatoria.' };
    }

    let normalizedUrl: ReturnType<typeof normalizeHttpUrl> | null = null;
    if (data.type !== 'note') {
      normalizedUrl = normalizeHttpUrl(data.url, URL_MAX);
      if (!normalizedUrl.ok && normalizedUrl.reason === 'missing') {
        return { success: false, error: 'URL obrigatoria.' };
      }
      if (!normalizedUrl.ok && normalizedUrl.reason === 'too_long') {
        return { success: false, error: `URL pode ter no maximo ${URL_MAX} caracteres.` };
      }
      if (!normalizedUrl.ok) {
        return { success: false, error: 'URL invalida. Use apenas http ou https.' };
      }
    }

    const skillResolution = await resolveOwnedSkillId(data.skillId, userId);
    if (skillResolution.error || !skillResolution.skillId) {
      return { success: false, error: skillResolution.error || 'Skill invalida.' };
    }

    const count = await prisma.libraryContent.count({
      where: { skillId: skillResolution.skillId, userId },
    });
    if (count >= MAX_CONTENTS) {
      return { success: false, error: `Limite de ${MAX_CONTENTS} conteudos por no atingido.` };
    }

    const content = await prisma.libraryContent.create({
      data: {
        skillId: skillResolution.skillId,
        userId,
        type: data.type,
        title,
        url: normalizedUrl?.ok ? normalizedUrl.value || undefined : undefined,
        body: data.type === 'note' ? body || undefined : undefined,
      },
    });

    console.log(`[Library Mutation] Content ADD: ${Date.now() - totalStart}ms`);
    return { success: true, content: toClientContent(content) };
  } catch (error) {
    console.error('[Library Mutation] Erro ao adicionar:', error);
    return { success: false };
  }
}

export async function deleteContent(contentId: string) {
  const totalStart = Date.now();
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: false, error: 'Nao autorizado' };

    const rateLimit = enforceUserActionRateLimit({
      scope: 'library-delete-content',
      userId,
      limit: DELETE_CONTENT_RATE_LIMIT,
      windowMs: DELETE_CONTENT_WINDOW_MS,
    });
    if (!rateLimit.allowed) {
      return { success: false, error: 'Muitas tentativas de exclusao. Tente novamente em instantes.' };
    }

    const validatedContentId = validateIdentifier(contentId, { maxLength: CONTENT_ID_MAX });
    if (!validatedContentId.ok || !validatedContentId.value) {
      return { success: false, error: 'Conteudo invalido.' };
    }

    const content = await prisma.libraryContent.findFirst({
      where: { id: validatedContentId.value, userId },
    });
    if (!content) return { success: false, error: 'Conteudo nao encontrado.' };

    if (content.fileKey && isUserScopedStoragePath(content.fileKey, userId)) {
      const storageClient = getPdfStorageClient();
      await storageClient.storage.from(PDF_BUCKET).remove([content.fileKey]);
    }

    await prisma.libraryContent.deleteMany({ where: { id: validatedContentId.value, userId } });
    console.log(`[Library Mutation] Content DELETE: ${Date.now() - totalStart}ms`);
    return { success: true };
  } catch (error) {
    console.error('[Library Mutation] Erro ao deletar:', error);
    return { success: false };
  }
}

export async function addPdfContent(formData: FormData) {
  const totalStart = Date.now();
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: false, error: 'Nao autorizado' };

    const rateLimit = enforceUserActionRateLimit({
      scope: 'library-upload-pdf',
      userId,
      limit: UPLOAD_PDF_RATE_LIMIT,
      windowMs: UPLOAD_PDF_WINDOW_MS,
    });
    if (!rateLimit.allowed) {
      return { success: false, error: 'Muitos uploads de PDF. Tente novamente em instantes.' };
    }

    const skillId = String(formData.get('skillId') ?? '');
    const title = String(formData.get('title') ?? '').trim();
    const file = formData.get('file');

    if (!(file instanceof File)) return { success: false, error: 'Nenhum arquivo enviado' };
    if (!title) {
      return { success: false, error: 'Titulo obrigatorio.' };
    }
    if (title.length > TITLE_MAX) {
      return { success: false, error: `Titulo pode ter no maximo ${TITLE_MAX} caracteres.` };
    }

    const skillResolution = await resolveOwnedSkillId(skillId, userId);
    if (skillResolution.error || !skillResolution.skillId) {
      return { success: false, error: skillResolution.error || 'Skill invalida.' };
    }

    const count = await prisma.libraryContent.count({
      where: { skillId: skillResolution.skillId, userId },
    });
    if (count >= MAX_CONTENTS) {
      return { success: false, error: `Limite de ${MAX_CONTENTS} conteudos por no atingido.` };
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return { success: false, error: 'Apenas arquivos PDF sao permitidos.' };
    if (file.size === 0) {
      return { success: false, error: 'O arquivo PDF enviado esta vazio.' };
    }
    if (file.size > PDF_MAX_BYTES) {
      return {
        success: false,
        error: `Arquivo excede o limite de ${Math.floor(PDF_MAX_BYTES / 1024 / 1024)} MB.`,
      };
    }

    const fileBytes = new Uint8Array(await file.arrayBuffer());
    if (!looksLikePdfBytes(fileBytes)) {
      return { success: false, error: 'O arquivo enviado nao possui assinatura PDF valida.' };
    }

    await ensurePdfBucketSecurity();

    const fileKey = `${userId}/${Date.now()}.pdf`;
    const storageClient = getPdfStorageClient();

    const { error } = await storageClient.storage
      .from(PDF_BUCKET)
      .upload(fileKey, fileBytes, { contentType: 'application/pdf' });
    if (error) throw error;

    let content;
    try {
      content = await prisma.libraryContent.create({
        data: {
          skillId: skillResolution.skillId,
          userId,
          type: 'pdf',
          title,
          fileKey,
        },
      });
    } catch (error) {
      await storageClient.storage.from(PDF_BUCKET).remove([fileKey]);
      throw error;
    }

    console.log(`[Library Mutation] PDF upload: ${Date.now() - totalStart}ms`);
    return { success: true, content: toClientContent(content) };
  } catch (error) {
    console.error('[Library Mutation] Erro no upload:', error);
    if (error instanceof Error && error.message === 'pdf_storage_not_configured') {
      return { success: false, error: 'Upload de PDF nao configurado no servidor.' };
    }
    return { success: false, error: 'Falha no upload' };
  }
}
