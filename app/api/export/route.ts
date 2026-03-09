import { NextResponse } from 'next/server';
import prisma from '@/shared/lib/prisma';
import { createClient } from '@/shared/supabase/server';

type ExportScope = 'journal' | 'tree' | 'library' | 'all';

const VALID_SCOPES: ExportScope[] = ['journal', 'tree', 'library', 'all'];

function getScope(raw: string | null): ExportScope {
  if (raw && VALID_SCOPES.includes(raw as ExportScope)) {
    return raw as ExportScope;
  }
  return 'journal';
}

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}

async function getTreeExport(userId: string) {
  const skills = await prisma.skill.findMany({
    where: { userId },
    select: {
      id: true,
      userId: true,
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
      userId: true,
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
      userId: true,
      skillId: true,
      type: true,
      title: true,
      url: true,
      fileKey: true,
      body: true,
      metadata: true,
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
    const scope = getScope(searchParams.get('scope'));

    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 });
    }

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
      user: { id: userId },
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
