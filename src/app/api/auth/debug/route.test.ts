import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authState = {
  userId: null as string | null,
};

vi.mock('@/shared/server/auth', () => ({
  getAuthUser: vi.fn(async () => authState.userId),
}));

describe('POST /api/auth/debug', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-01T16:00:00Z'));
    authState.userId = null;
  });

  afterEach(async () => {
    const { resetRateLimitStore } = await import('@/shared/server/rateLimit');
    resetRateLimitStore();
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('returns 200 for the happy path in non-production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { POST } = await import('./route');
    const response = await POST(
      new Request('http://localhost/api/auth/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: 'sign_up_failure',
          details: { reason: 'captcha_failed' },
          reportedAt: '2026-04-01T16:00:00.000Z',
        }),
      }) as never
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(errorSpy).toHaveBeenCalledWith(
      '[Auth Debug]',
      expect.objectContaining({
        stage: 'sign_up_failure',
      })
    );
  });

  it('returns 400 when a required field is missing', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const { POST } = await import('./route');
    const response = await POST(
      new Request('http://localhost/api/auth/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          details: { reason: 'missing-stage' },
        }),
      }) as never
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false });
  });

  it('returns 404 in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const { POST } = await import('./route');
    const response = await POST(
      new Request('http://localhost/api/auth/debug', {
        method: 'POST',
        body: JSON.stringify({
          stage: 'sign_up_failure',
          details: { reason: 'captcha_failed' },
        }),
      }) as never
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false });
  });

  it('returns 400 for injection-like stage values', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const { POST } = await import('./route');
    const response = await POST(
      new Request('http://localhost/api/auth/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: 'sign_up_failure OR 1=1',
          details: { reason: 'bad-stage' },
        }),
      }) as never
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false });
  });

  it('returns 401 for malformed authorization headers', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const { POST } = await import('./route');
    const response = await POST(
      new Request('http://localhost/api/auth/debug', {
        method: 'POST',
        headers: {
          Authorization: 'NotBearer token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: 'sign_up_failure',
          details: { reason: 'bad-header' },
        }),
      }) as never
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false });
  });

  it('returns 401 for JWTs using alg none', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const { POST } = await import('./route');
    const response = await POST(
      new Request('http://localhost/api/auth/debug', {
        method: 'POST',
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyLWEifQ.',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: 'sign_up_failure',
          details: { reason: 'alg-none' },
        }),
      }) as never
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false });
  });

  it('returns 401 for tampered bearer tokens', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const { POST } = await import('./route');
    const response = await POST(
      new Request('http://localhost/api/auth/debug', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer header.payload.invalidsignature',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: 'sign_up_failure',
          details: { reason: 'tampered' },
        }),
      }) as never
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false });
  });

  it('returns 403 when an authenticated user reports another user id in the payload', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    authState.userId = 'user-a';

    const { POST } = await import('./route');
    const response = await POST(
      new Request('http://localhost/api/auth/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: 'sign_up_failure',
          details: { userId: 'user-b', reason: 'cross-user' },
        }),
      }) as never
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false });
  });

  it('returns 413 for oversized payloads', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const { POST } = await import('./route');
    const response = await POST(
      new Request('http://localhost/api/auth/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: 'sign_up_failure',
          details: { blob: 'x'.repeat(5000) },
        }),
      }) as never
    );

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ ok: false });
  });

  it('returns 429 on the 11th request inside the rate-limit window', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { POST } = await import('./route');
    const request = new Request('http://localhost/api/auth/debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '203.0.113.20',
      },
      body: JSON.stringify({
        stage: 'sign_up_failure',
        details: { reason: 'rate-limit' },
      }),
    });

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await POST(request.clone() as never);
      expect(response.status).toBe(200);
    }

    const blocked = await POST(request.clone() as never);
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({ ok: false });
    expect(errorSpy).toHaveBeenCalled();
  });
});
