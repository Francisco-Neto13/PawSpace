'use server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

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
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const finalUserId = user?.id || data.userId;

    if (!finalUserId) {
      throw new Error("Usuário não identificado.");
    }

    const content = await prisma.libraryContent.create({ 
      data: {
        ...data,
        userId: finalUserId 
      } 
    });
    
    return { success: true, content };
  } catch (error) {
    console.error('❌ [Library] Erro ao adicionar conteúdo:', error);
    return { success: false };
  }
}

export async function deleteContent(contentId: string) {
  try {
    const content = await prisma.libraryContent.findUnique({
      where: { id: contentId },
    });

    if (content?.fileKey) {
      const supabase = await createClient();
      await supabase.storage.from('biblioteca-pdfs').remove([content.fileKey]);
    }

    await prisma.libraryContent.delete({ where: { id: contentId } });
    return { success: true };
  } catch (error) {
    console.error('❌ [Library] Erro ao deletar conteúdo:', error);
    return { success: false };
  }
}

export async function getContentsBySkill(skillId: string) {
  try {
    const contents = await prisma.libraryContent.findMany({
      where: { skillId },
      orderBy: { createdAt: 'asc' },
    });
    return contents;
  } catch (error) {
    console.error('❌ [Library] Erro ao buscar conteúdos:', error);
    return [];
  }
}

export async function uploadPdf(formData: FormData, userId?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const finalUserId = userId || user?.id;

    if (!finalUserId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'Nenhum arquivo enviado' };

    const ext = file.name.split('.').pop();
    const fileKey = `${finalUserId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('biblioteca-pdfs')
      .upload(fileKey, file, { contentType: file.type });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('biblioteca-pdfs')
      .getPublicUrl(fileKey);

    return { success: true, fileKey, publicUrl };
  } catch (error) {
    console.error('❌ [Library] Erro ao fazer upload do PDF:', error);
    return { success: false, error: 'Falha no upload' };
  }
}