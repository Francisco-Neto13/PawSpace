import { NextResponse } from 'next/server';

import prisma from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/server/auth';
import { consumeRateLimit } from '@/shared/server/rateLimit';

type ExportScope = 'journal' | 'tree' | 'library' | 'all';

const VALID_SCOPES: ExportScope[] = ['journal', 'tree', 'library', 'all'];
const SCOPE_MAX_LENGTH = 16;
const EXPORT_RATE_LIMIT_MAX = 10;
const EXPORT_RATE_LIMIT_WINDOW_MS = 60 * 1000;

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

function parseScope(raw: string | null) {
  if (raw === null) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Scope obrigatorio.' }, { status: 400 }),
    };
  }

  const normalized = raw.trim().toLowerCase();

  if (!normalized) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Scope obrigatorio.' }, { status: 400 }),
    };
  }

  if (normalized.length > SCOPE_MAX_LENGTH) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Scope excede o limite permitido.' }, { status: 413 }),
    };
  }

  if (!/^[a-z]+$/.test(normalized)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Scope invalido.' }, { status: 400 }),
    };
  }

  if (!VALID_SCOPES.includes(normalized as ExportScope)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Recurso de exportacao nao encontrado.' }, { status: 404 }),
    };
  }

  return {
    ok: true as const,
    scope: normalized as ExportScope,
  };
}

async function getTreeExport(userId: string) {
  const skills = await prisma.skill.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      description: true,
      icon: true,
      category: true,
      shape: true,
      color: true,
      parentId: true,
      positionX: true,
      positionY: true,
      level: true,
      xp: true,
      xpToNextLevel: true,
      requiredParentLevel: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const edges = skills
    .filter((s) => s.parentId)
    .map((s) => ({
      id: `e-${s.parentId}-${s.id}`,
      source: s.parentId as string,
      target: s.id,
      type: 'skill',
      data: { category: s.category },
    }));

  return { skills, edges };
}

async function getJournalExport(userId: string) {
  const journalEntries = await prisma.journalEntry.findMany({
    where: { userId },
    select: {
      id: true,
      skillId: true,
      title: true,
      body: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return { journalEntries };
}

async function getLibraryExport(userId: string) {
  const libraryContents = await prisma.libraryContent.findMany({
    where: { userId },
    select: {
      id: true,
      skillId: true,
      type: true,
      title: true,
      url: true,
      body: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return { libraryContents };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scopeResult = parseScope(searchParams.get('scope'));
    if (!scopeResult.ok) {
      return scopeResult.response;
    }

    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
    }

    const requestedUserId = searchParams.get('userId');
    if (requestedUserId && requestedUserId.trim() !== userId) {
      return NextResponse.json({ error: 'Acesso proibido a dados de outro usuario.' }, { status: 403 });
    }

    const rateLimit = consumeRateLimit({
      key: `export:${userId}:${getClientIdentifier(request)}`,
      limit: EXPORT_RATE_LIMIT_MAX,
      windowMs: EXPORT_RATE_LIMIT_WINDOW_MS,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas requisicoes de exportacao. Tente novamente em instantes.' },
        {
          status: 429,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    const scope = scopeResult.scope;

    const includeTree = scope === 'tree' || scope === 'all';
    const includeJournal = scope === 'journal' || scope === 'all';
    const includeLibrary = scope === 'library' || scope === 'all';

    const [treeData, journalData, libraryData] = await Promise.all([
      includeTree ? getTreeExport(userId) : Promise.resolve(null),
      includeJournal ? getJournalExport(userId) : Promise.resolve(null),
      includeLibrary ? getLibraryExport(userId) : Promise.resolve(null),
    ]);

    const data = {
      ...(treeData ? { tree: treeData } : {}),
      ...(journalData ? { journal: journalData } : {}),
      ...(libraryData ? { library: libraryData } : {}),
    };

    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      scope,
      data,
    };

    const fileDate = new Date().toISOString().slice(0, 10);
    const fileName = `pawspace-${scope}-${fileDate}.json`;

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Export API] Falha ao exportar dados:', error);
    return NextResponse.json({ error: 'Falha ao exportar dados.' }, { status: 500 });
  }
}
