import { NextResponse } from 'next/server';

import prisma from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/server/auth';
import { createAdminClient } from '@/shared/supabase/admin';
import { createClient } from '@/shared/supabase/server';

const PDF_BUCKET = 'biblioteca-pdfs';
const SIGNED_URL_TTL_SECONDS = 60;

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ contentId: string }> }
) {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
    }

    const { contentId } = await context.params;
    const content = await prisma.libraryContent.findFirst({
      where: {
        id: contentId,
        userId,
        type: 'pdf',
        fileKey: { not: null },
      },
      select: {
        fileKey: true,
      },
    });

    if (!content?.fileKey) {
      return NextResponse.json({ error: 'Arquivo nao encontrado.' }, { status: 404 });
    }

    const storageClient = createAdminClient() ?? (await createClient());
    const { data, error } = await storageClient.storage
      .from(PDF_BUCKET)
      .createSignedUrl(content.fileKey, SIGNED_URL_TTL_SECONDS);

    if (error || !data?.signedUrl) {
      console.error('[Library File API] Falha ao gerar signed URL:', error);
      return NextResponse.json({ error: 'Falha ao abrir arquivo.' }, { status: 500 });
    }

    return NextResponse.redirect(data.signedUrl, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Library File API] Falha inesperada:', error);
    return NextResponse.json({ error: 'Falha ao abrir arquivo.' }, { status: 500 });
  }
}
