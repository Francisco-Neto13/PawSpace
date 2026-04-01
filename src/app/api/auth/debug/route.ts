import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/shared/server/auth';
import { consumeRateLimit } from '@/shared/server/rateLimit';

export const dynamic = 'force-dynamic';
const DEBUG_BODY_MAX_BYTES = 4 * 1024;
const DEBUG_STAGE_MAX_LENGTH = 100;
const DEBUG_RATE_LIMIT_MAX = 10;
const DEBUG_RATE_LIMIT_WINDOW_MS = 60 * 1000;

function sanitizeDebugValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.slice(0, 500);
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null ||
    value === undefined
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeDebugValue(item));
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).slice(0, 20);

    return Object.fromEntries(
      entries.map(([key, entryValue]) => [key, sanitizeDebugValue(entryValue)])
    );
  }

  return String(value).slice(0, 500);
}

function getClientIdentifier(request: NextRequest) {
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

function validateAuthorizationHeader(header: string | null) {
  if (!header) {
    return { ok: true as const, hasHeader: false as const };
  }

  if (!header.startsWith('Bearer ')) {
    return { ok: false as const, response: NextResponse.json({ ok: false }, { status: 401 }) };
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return { ok: false as const, response: NextResponse.json({ ok: false }, { status: 401 }) };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false as const, response: NextResponse.json({ ok: false }, { status: 401 }) };
  }

  try {
    const decodedHeader = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as {
      alg?: string;
    };

    if (decodedHeader.alg?.toLowerCase() === 'none') {
      return { ok: false as const, response: NextResponse.json({ ok: false }, { status: 401 }) };
    }
  } catch {
    return { ok: false as const, response: NextResponse.json({ ok: false }, { status: 401 }) };
  }

  return { ok: true as const, hasHeader: true as const };
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  try {
    const authHeaderResult = validateAuthorizationHeader(request.headers.get('authorization'));
    if (!authHeaderResult.ok) {
      return authHeaderResult.response;
    }

    const authUserId = await getAuthUser();
    if (authHeaderResult.hasHeader && !authUserId) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const rateLimit = consumeRateLimit({
      key: `auth-debug:${authUserId ?? getClientIdentifier(request)}`,
      limit: DEBUG_RATE_LIMIT_MAX,
      windowMs: DEBUG_RATE_LIMIT_WINDOW_MS,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false },
        {
          status: 429,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > DEBUG_BODY_MAX_BYTES) {
      return NextResponse.json(
        { ok: false },
        {
          status: 413,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    const payload = JSON.parse(rawBody) as {
      stage?: unknown;
      details?: unknown;
      reportedAt?: unknown;
    };

    if (typeof payload.stage !== 'string' || typeof payload.details !== 'object' || !payload.details) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const normalizedStage = payload.stage.trim();
    if (
      !normalizedStage ||
      normalizedStage.length > DEBUG_STAGE_MAX_LENGTH ||
      !/^[a-z0-9_-]+$/i.test(normalizedStage)
    ) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const payloadDetails = payload.details as Record<string, unknown>;
    if (
      authUserId &&
      typeof payloadDetails.userId === 'string' &&
      payloadDetails.userId.trim() &&
      payloadDetails.userId.trim() !== authUserId
    ) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    console.error('[Auth Debug]', {
      stage: normalizedStage.slice(0, DEBUG_STAGE_MAX_LENGTH),
      details: sanitizeDebugValue(payloadDetails),
      reportedAt:
        typeof payload.reportedAt === 'string' ? payload.reportedAt.slice(0, 100) : undefined,
    });

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[Auth Debug] Failed to read debug payload', error);
    return NextResponse.json(
      { ok: false },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
