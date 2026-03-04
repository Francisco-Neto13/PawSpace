'use server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { getAuthUser } from './auth-helper';
import { ContentInput } from './types';
import { LIMITS } from '@/lib/limits';

export async function addContent(data: ContentInput) {
  const totalStart = Date.now();
  try {
    const userId = await getAuthUser();
    const finalUserId = userId || data.userId;
    if (!finalUserId) throw new Error('Usuário não identificado.');

    const title = (data.title || '').trim();
    const url   = (data.url   || '').trim();
    const body  = (data.body  || '').trim();

    if (title.length > LIMITS.library.title)
      return { success: false, error: `Título pode ter no máximo ${LIMITS.library.title} caracteres.` };
    if (url && url.length > LIMITS.library.url)
      return { success: false, error: `URL pode ter no máximo ${LIMITS.library.url} caracteres.` };
    if (body && body.length > LIMITS.library.body)
      return { success: false, error: `Nota pode ter no máximo ${LIMITS.library.body} caracteres.` };

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

    const ext     = file.name.split('.').pop();
    const fileKey = `${finalUserId}/${Date.now()}.${ext}`;
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