import { NextResponse } from 'next/server';

import prisma from '@/shared/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthorized(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return false;

  const authorization = request.headers.get('authorization');
  return authorization === `Bearer ${expectedSecret}`;
}

export async function GET(request: Request) {
  const userAgent = request.headers.get('user-agent') ?? 'unknown';

  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'Keep-alive nao configurado.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: 'Nao autorizado.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.info('[Keep Alive] Ping executado com sucesso.', {
      source: userAgent,
      checkedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[Keep Alive] Falha ao consultar o banco:', error);

    return NextResponse.json(
      { ok: false, error: 'Falha ao consultar o banco.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
