import { NextResponse } from 'next/server';

import prisma from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/server/auth';
import { consumeRateLimit } from '@/shared/server/rateLimit';
import { createAdminClient } from '@/shared/supabase/admin';
import { createClient } from '@/shared/supabase/server';

const PDF_BUCKET = 'biblioteca-pdfs';
const SIGNED_URL_TTL_SECONDS = 60;
const CONTENT_ID_MAX_LENGTH = 64;
const FILE_RATE_LIMIT_MAX = 10;
const FILE_RATE_LIMIT_WINDOW_MS = 60 * 1000;

export const dynamic = 'force-dynamic';

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'anonymous';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'anonymous';
}

function parseContentId(contentId: string | null | undefined) {
  const normalized = (contentId ?? '').trim();

  if (!normalized) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'contentId obrigatorio.' }, { status: 400 }),
    };
  }

  if (normalized.length > CONTENT_ID_MAX_LENGTH) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'contentId excede o limite permitido.' }, { status: 413 }),
    };
  }

  if (!/^[A-Za-z0-9_-]+$/.test(normalized)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'contentId invalido.' }, { status: 400 }),
    };
  }

  return {
    ok: true as const,
    contentId: normalized,
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ contentId: string }> }
) {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
    }

    const { contentId } = await context.params;
    const parsedContentId = parseContentId(contentId);
    if (!parsedContentId.ok) {
      return parsedContentId.response;
    }

    const rateLimit = consumeRateLimit({
      key: `library-file:${userId}:${getClientIdentifier(request)}`,
      limit: FILE_RATE_LIMIT_MAX,
      windowMs: FILE_RATE_LIMIT_WINDOW_MS,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas requisicoes para abrir arquivos. Tente novamente em instantes.' },
        {
          status: 429,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    const content = await prisma.libraryContent.findFirst({
      where: {
        id: parsedContentId.contentId,
        type: 'pdf',
        fileKey: { not: null },
      },
      select: {
        userId: true,
        fileKey: true,
      },
    });

    if (!content?.fileKey) {
      return NextResponse.json({ error: 'Arquivo nao encontrado.' }, { status: 404 });
    }

    if (content.userId !== userId) {
      return NextResponse.json({ error: 'Acesso proibido a arquivo de outro usuario.' }, { status: 403 });
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
