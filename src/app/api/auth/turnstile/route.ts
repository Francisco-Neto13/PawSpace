import { NextRequest, NextResponse } from 'next/server';

type TurnstileResult = {
  success: boolean;
  'error-codes'?: string[];
};

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!secret || !siteKey) {
    return NextResponse.json(
      { success: false, reason: 'turnstile_not_configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let token = '';

  try {
    const body = (await request.json()) as { token?: unknown };
    token = typeof body.token === 'string' ? body.token : '';
  } catch {
    return NextResponse.json(
      { success: false, reason: 'invalid_request' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!token) {
    return NextResponse.json(
      { success: false, reason: 'missing_token' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const payload = new URLSearchParams({
    secret,
    response: token,
  });

  if (ipAddress) {
    payload.set('remoteip', ipAddress);
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, reason: 'verification_unavailable' },
        { status: 502, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const result = (await response.json()) as TurnstileResult;

    return NextResponse.json(
      {
        success: result.success,
        errors: result['error-codes'] ?? [],
      },
      {
        status: result.success ? 200 : 400,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch (error) {
    console.error('[Turnstile API] Falha ao validar desafio:', error);
    return NextResponse.json(
      { success: false, reason: 'verification_failed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
