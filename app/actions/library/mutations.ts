'use server';
import prisma from '@/shared/lib/prisma';
import { createClient } from '@/shared/supabase/server';
import { getAuthUser } from './auth-helper';
import { ContentInput } from './types';
import { LIMITS } from '@/shared/lib/limits';

const MAX_CONTENTS = LIMITS.quantity.contentsPerNode;
const TITLE_MAX    = LIMITS.library.title;
const URL_MAX      = LIMITS.library.url;
const BODY_MAX     = LIMITS.library.body;

export async function addContent(data: ContentInput) {
  const totalStart = Date.now();
  try {
    const userId = await getAuthUser();
    const finalUserId = userId || data.userId;
    if (!finalUserId) throw new Error('Usuário não identificado.');

    const title = (data.title || '').trim();
    const url   = (data.url   || '').trim();
    const body  = (data.body  || '').trim();

    if (title.length > TITLE_MAX)
      return { success: false, error: `Título pode ter no máximo ${TITLE_MAX} caracteres.` };
    if (url && url.length > URL_MAX)
      return { success: false, error: `URL pode ter no máximo ${URL_MAX} caracteres.` };
    if (body && body.length > BODY_MAX)
      return { success: false, error: `Nota pode ter no máximo ${BODY_MAX} caracteres.` };

    const count = await prisma.libraryContent.count({ where: { skillId: data.skillId } });
    if (count >= MAX_CONTENTS)
      return { success: false, error: `Limite de ${MAX_CONTENTS} conteúdos por nó atingido.` };

    const content = await prisma.libraryContent.create({
      data: { ...data, title, url: url || undefined, body: body || undefined, userId: finalUserId },
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
    if (!userId) return { success: false, error: 'Não autorizado' };

    const content = await prisma.libraryContent.findUnique({
      where: { id: contentId, userId },
    });
    if (!content) throw new Error('Conteúdo não encontrado.');

    if (content.fileKey) {
      const supabase = await createClient();
      await supabase.storage.from('biblioteca-pdfs').remove([content.fileKey]);
    }

    await prisma.libraryContent.delete({ where: { id: contentId, userId } });
    console.log(`✅ [Library Mutation] Content DELETE: ${Date.now() - totalStart}ms`);
    return { success: true };
  } catch (error) {
    console.error('❌ [Library Mutation] Erro ao deletar:', error);
    return { success: false };
  }
}

export async function uploadPdf(formData: FormData, userId?: string) {
  const totalStart = Date.now();
  try {
    const authId = await getAuthUser();
    const finalUserId = userId || authId;
    if (!finalUserId) return { success: false, error: 'Não autorizado' };

    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'Nenhum arquivo enviado' };

    const ext      = file.name.split('.').pop();
    const fileKey  = `${finalUserId}/${Date.now()}.${ext}`;
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
