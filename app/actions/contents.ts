'use server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

const getAuthUser = cache(async () => {
  const start = Date.now();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  console.log(`⏱️  [Library Auth] Verificação: ${Date.now() - start}ms`);
  return user?.id;
});

export type ContentInput = {
  skillId: string;
  userId?: string; 
  type: 'link' | 'video' | 'pdf' | 'note';
  title: string;
  url?: string;
  fileKey?: string;
  body?: string;
};

export async function addContent(data: ContentInput) {
  const totalStart = Date.now();
  try {
    const userId = await getAuthUser();
    const finalUserId = userId || data.userId;

    if (!finalUserId) {
      throw new Error("Usuário não identificado.");
    }

    const dbStart = Date.now();
    const content = await prisma.libraryContent.create({ 
      data: {
        ...data,
        userId: finalUserId 
      } 
    });
    console.log(`⏱️  [Library DB] Create Content: ${Date.now() - dbStart}ms`);
    
    console.log(`✅ [Library] Content ADD Total: ${Date.now() - totalStart}ms`);
    return { success: true, content };
  } catch (error) {
    console.error('❌ [Library] Erro ao adicionar conteúdo:', error);
    return { success: false };
  }
}

export async function deleteContent(contentId: string) {
  const totalStart = Date.now();
  try {
    const userId = await getAuthUser();
    if (!userId) return { success: false, error: 'Não autorizado' };

    const dbStart = Date.now();
    const content = await prisma.libraryContent.findUnique({
      where: { id: contentId, userId: userId },
    });
    console.log(`⏱️  [Library DB] Find Unique: ${Date.now() - dbStart}ms`);

    if (!content) throw new Error("Conteúdo não encontrado ou acesso negado.");

    if (content.fileKey) {
      const storageStart = Date.now();
      const supabase = await createClient();
      await supabase.storage.from('biblioteca-pdfs').remove([content.fileKey]);
      console.log(`⏱️  [Library Storage] Delete File: ${Date.now() - storageStart}ms`);
    }

    const deleteStart = Date.now();
    await prisma.libraryContent.delete({ 
      where: { id: contentId, userId: userId } 
    });
    console.log(`⏱️  [Library DB] Final Delete: ${Date.now() - deleteStart}ms`);

    console.log(`✅ [Library] Content DELETE Total: ${Date.now() - totalStart}ms`);
    return { success: true };
  } catch (error) {
    console.error('❌ [Library] Erro ao deletar conteúdo:', error);
    return { success: false };
  }
}

export async function getContentsBySkill(skillId: string) {
  const totalStart = Date.now();
  try {
    const userId = await getAuthUser();
    if (!userId) return [];

    const dbStart = Date.now();
    const contents = await prisma.libraryContent.findMany({
      where: { 
        skillId: skillId,
        userId: userId 
      },
      orderBy: { createdAt: 'asc' },
    });
    
    console.log(`⏱️  [Library DB] Fetch Seguro por Skill: ${Date.now() - dbStart}ms`);
    console.log(`✅ [Library] Fetch Total: ${Date.now() - totalStart}ms`);
    return contents;
  } catch (error) {
    console.error('❌ [Library] Erro ao buscar conteúdos:', error);
    return [];
  }
}

export async function uploadPdf(formData: FormData, userId?: string) {
  const totalStart = Date.now();
  console.log('🚀 [Library] Iniciando Upload de PDF...');

  try {
    const authId = await getAuthUser();
    const finalUserId = userId || authId;

    if (!finalUserId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'Nenhum arquivo enviado' };

    const ext = file.name.split('.').pop();
    const fileKey = `${finalUserId}/${Date.now()}.${ext}`;

    const storageStart = Date.now();
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from('biblioteca-pdfs')
      .upload(fileKey, file, { contentType: file.type });

    if (error) throw error;
    console.log(`⏱️  [Library Storage] Upload concluído em: ${Date.now() - storageStart}ms`);

    const { data: { publicUrl } } = supabase.storage
      .from('biblioteca-pdfs')
      .getPublicUrl(fileKey);

    console.log(`✅ [Library] Upload TOTAL: ${Date.now() - totalStart}ms`);
    return { success: true, fileKey, publicUrl };
  } catch (error) {
    console.error('❌ [Library] Erro ao fazer upload do PDF:', error);
    return { success: false, error: 'Falha no upload' };
  }
}