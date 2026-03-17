import { NextResponse } from 'next/server';

import { getUserSessions } from '@/shared/server/userSessions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getUserSessions();

    if (result.status === 'unauthorized') {
      return NextResponse.json(result, {
        status: 401,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    return NextResponse.json(result, {
      status: result.status === 'error' ? 500 : 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[Sessions API] Falha ao buscar sessões:', error);
    return NextResponse.json(
      { status: 'error', sessions: [] },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
}
