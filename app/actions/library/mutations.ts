'use server';
import prisma from '@/shared/lib/prisma';
import { createClient } from '@/shared/supabase/server';
import { getAuthUser } from './auth-helper';
import { ContentInput } from './types';
import { LIMITS } from '@/shared/lib/limits';

const MAX_CONTENTS = LIMITS.quantity.contentsPerNode;
const TITLE_MAX = LIMITS.library.title;
const URL_MAX = LIMITS.library.url;
const BODY_MAX = LIMITS.library.body;
const PDF_MAX_BYTES = LIMITS.library.pdfMaxBytes;

async function resolveOwnedSkillId(skillIdInput: string, userId: string) {
  const skillId = (skillIdInput || '').trim();
  if (!skillId) return { skillId: null as string | null, error: 'Skill invalida.' };

  const skill = await prisma.skill.findFirst({
    where: { id: skillId, userId },
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

    const title = (data.title || '').trim();
    const url = (data.url || '').trim();
    const body = (data.body || '').trim();

    if (title.length > TITLE_MAX) {
      return { success: false, error: `Titulo pode ter no maximo ${TITLE_MAX} caracteres.` };
    }
    if (url && url.length > URL_MAX) {
      return { success: false, error: `URL pode ter no maximo ${URL_MAX} caracteres.` };
    }
    if (body && body.length > BODY_MAX) {
      return { success: false, error: `Nota pode ter no maximo ${BODY_MAX} caracteres.` };
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
        url: url || undefined,
        fileKey: data.fileKey || undefined,
        body: body || undefined,
      },
    });

    console.log(`✅ [Library Mutation] Content ADD: ${Date.now() - totalStart}ms`);
    return { success: true, content };
  } catch (error) {
    console.error('❌ [Library Mutation] Erro ao adicionar:', error);
    return { success: false };
  }
}

export async function deleteContent(contentId: string) {
  const totalStart = Date.now();
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: false, error: 'Nao autorizado' };

    const content = await prisma.libraryContent.findFirst({
      where: { id: contentId, userId },
    });
    if (!content) throw new Error('Conteudo nao encontrado.');

    if (content.fileKey) {
      const supabase = await createClient();
      await supabase.storage.from('biblioteca-pdfs').remove([content.fileKey]);
    }

    await prisma.libraryContent.deleteMany({ where: { id: contentId, userId } });
    console.log(`✅ [Library Mutation] Content DELETE: ${Date.now() - totalStart}ms`);
    return { success: true };
  } catch (error) {
    console.error('❌ [Library Mutation] Erro ao deletar:', error);
    return { success: false };
  }
}

export async function uploadPdf(formData: FormData) {
  const totalStart = Date.now();
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: false, error: 'Nao autorizado' };

    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'Nenhum arquivo enviado' };
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return { success: false, error: 'Apenas arquivos PDF sao permitidos.' };
    if (file.size > PDF_MAX_BYTES) {
      return {
        success: false,
        error: `Arquivo excede o limite de ${Math.floor(PDF_MAX_BYTES / 1024 / 1024)} MB.`,
      };
    }

    const fileKey = `${userId}/${Date.now()}.pdf`;
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from('biblioteca-pdfs')
      .upload(fileKey, file, { contentType: file.type });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('biblioteca-pdfs')
      .getPublicUrl(fileKey);

    console.log(`✅ [Library Mutation] PDF upload: ${Date.now() - totalStart}ms`);
    return { success: true, fileKey, publicUrl };
  } catch (error) {
    console.error('❌ [Library Mutation] Erro no upload:', error);
    return { success: false, error: 'Falha no upload' };
  }
}
