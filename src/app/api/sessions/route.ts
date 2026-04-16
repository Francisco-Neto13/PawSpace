import { NextResponse } from 'next/server';

import { getAuthUser } from '@/shared/server/auth';
import { consumeRateLimit } from '@/shared/server/rateLimit';
import { getUserSessions } from '@/shared/server/userSessions';

export const dynamic = 'force-dynamic';

const PARAM_MAX_LENGTH = 64;
const SESSIONS_RATE_LIMIT_MAX = 10;
const SESSIONS_RATE_LIMIT_WINDOW_MS = 60 * 1000;

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

function parseOptionalIdentifier(name: string, raw: string | null) {
  if (raw === null) {
    return {
      ok: true as const,
      value: null,
    };
  }

  const normalized = raw.trim();
  if (!normalized) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { status: 'error', sessions: [], error: `${name} obrigatório.` },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      ),
    };
  }

  if (normalized.length > PARAM_MAX_LENGTH) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { status: 'error', sessions: [], error: `${name} excede o limite permitido permitido.` },
        { status: 413, headers: { 'Cache-Control': 'no-store' } }
      ),
    };
  }

  if (!/^[A-Za-z0-9_-]+$/.test(normalized)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { status: 'error', sessions: [], error: `${name} inválido.` },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      ),
    };
  }

  return {
    ok: true as const,
    value: normalized,
  };
}

export async function GET(request: Request) {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json(
        { status: 'unauthorized', sessions: [] },
        {
          status: 401,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = parseOptionalIdentifier('userId', searchParams.get('userId'));
    if (!requestedUserId.ok) {
      return requestedUserId.response;
    }

    const requestedSessionId = parseOptionalIdentifier('sessionId', searchParams.get('sessionId'));
    if (!requestedSessionId.ok) {
      return requestedSessionId.response;
    }

    if (requestedUserId.value && requestedUserId.value !== userId) {
      return NextResponse.json(
        { status: 'error', sessions: [], error: 'Acesso proibido a sessões de outro usuário.' },
        {
          status: 403,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    const rateLimit = consumeRateLimit({
      key: `sessions:${userId}:${getClientIdentifier(request)}`,
      limit: SESSIONS_RATE_LIMIT_MAX,
      windowMs: SESSIONS_RATE_LIMIT_WINDOW_MS,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          status: 'error',
          sessions: [],
          error: 'Muitas requisições de sessões. Tente novamente em instantes.',
        },
        {
          status: 429,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    const result = await getUserSessions();

    if (result.status === 'unauthorized') {
      return NextResponse.json(result, {
        status: 401,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    if (requestedSessionId.value && result.status === 'ok') {
      const matchedSession = result.sessions.find((session) => session.id === requestedSessionId.value);
      if (!matchedSession) {
        return NextResponse.json(
          { status: 'error', sessions: [], error: 'Sessao nao encontrada.' },
          {
            status: 404,
            headers: { 'Cache-Control': 'no-store' },
          }
        );
      }

      return NextResponse.json(
        { status: 'ok', sessions: [matchedSession] },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
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
