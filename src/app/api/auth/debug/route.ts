import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  try {
    const payload = (await request.json()) as {
      stage?: unknown;
      details?: unknown;
      reportedAt?: unknown;
    };

    if (typeof payload.stage !== 'string' || typeof payload.details !== 'object' || !payload.details) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    console.error('[Auth Debug]', {
      stage: payload.stage.slice(0, 100),
      details: sanitizeDebugValue(payload.details),
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
