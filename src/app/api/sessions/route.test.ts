import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authState = {
  userId: null as string | null,
};

const getUserSessionsMock = vi.fn();

vi.mock('@/shared/server/auth', () => ({
  getAuthUser: vi.fn(async () => authState.userId),
}));

vi.mock('@/shared/server/userSessions', () => ({
  getUserSessions: (...args: unknown[]) => getUserSessionsMock(...args),
}));

describe('GET /api/sessions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-01T16:30:00Z'));
    authState.userId = null;
    getUserSessionsMock.mockReset();
  });

  afterEach(async () => {
    const { resetRateLimitStore } = await import('@/shared/server/rateLimit');
    resetRateLimitStore();
    vi.useRealTimers();
  });

  it('returns the expected session on the happy path', async () => {
    authState.userId = 'user-a';
    getUserSessionsMock.mockResolvedValue({
      status: 'ok',
      sessions: [
        { id: 'session-1', device: 'Chrome', location: 'BR', lastSeen: 'Agora', isCurrent: true, type: 'desktop' },
        { id: 'session-2', device: 'Safari', location: 'BR', lastSeen: 'Ontem', isCurrent: false, type: 'mobile' },
      ],
    });

    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/sessions?sessionId=session-1')
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: 'ok',
      sessions: [
        {
          id: 'session-1',
          device: 'Chrome',
          location: 'BR',
          lastSeen: 'Agora',
          isCurrent: true,
          type: 'desktop',
        },
      ],
    });
  });

  it('returns 400 when sessionId is provided but empty', async () => {
    authState.userId = 'user-a';

    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/sessions?sessionId=')
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      status: 'error',
      sessions: [],
      error: 'sessionId obrigatorio.',
    });
  });

  it('returns 404 when the requested session is not found', async () => {
    authState.userId = 'user-a';
    getUserSessionsMock.mockResolvedValue({
      status: 'ok',
      sessions: [
        { id: 'session-1', device: 'Chrome', location: 'BR', lastSeen: 'Agora', isCurrent: true, type: 'desktop' },
      ],
    });

    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/sessions?sessionId=missing')
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      status: 'error',
      sessions: [],
      error: 'Sessao nao encontrada.',
    });
  });

  it('returns 400 for malformed identifier values that look like injection payloads', async () => {
    authState.userId = 'user-a';

    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/sessions?sessionId=session-1%20OR%201%3D1')
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      status: 'error',
      sessions: [],
      error: 'sessionId invalido.',
    });
  });

  it('returns 401 for malformed authorization headers when there is no authenticated session', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/sessions', {
        headers: {
          Authorization: 'Bearer invalid',
        },
      })
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ status: 'unauthorized', sessions: [] });
  });

  it('returns 401 for a JWT using alg none when there is no authenticated session', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/sessions', {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyLWEifQ.',
        },
      })
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ status: 'unauthorized', sessions: [] });
  });

  it('returns 401 for a tampered token when there is no authenticated session', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/sessions', {
        headers: {
          Authorization: 'Bearer header.payload.invalidsignature',
        },
      })
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ status: 'unauthorized', sessions: [] });
  });

  it('returns 403 when user A tries to query another user id', async () => {
    authState.userId = 'user-a';

    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/sessions?userId=user-b')
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      status: 'error',
      sessions: [],
      error: 'Acesso proibido a sessoes de outro usuario.',
    });
  });

  it('returns 413 when sessionId exceeds the supported limit', async () => {
    authState.userId = 'user-a';

    const { GET } = await import('./route');
    const response = await GET(
      new Request(`http://localhost/api/sessions?sessionId=${'a'.repeat(200)}`)
    );

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({
      status: 'error',
      sessions: [],
      error: 'sessionId excede o limite permitido.',
    });
  });

  it('returns 429 on the 11th request inside the rate-limit window', async () => {
    authState.userId = 'user-a';
    getUserSessionsMock.mockResolvedValue({
      status: 'ok',
      sessions: [
        { id: 'session-1', device: 'Chrome', location: 'BR', lastSeen: 'Agora', isCurrent: true, type: 'desktop' },
      ],
    });

    const { GET } = await import('./route');
    const request = new Request('http://localhost/api/sessions', {
      headers: {
        'x-forwarded-for': '203.0.113.30',
      },
    });

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await GET(request);
      expect(response.status).toBe(200);
    }

    const blocked = await GET(request);
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({
      status: 'error',
      sessions: [],
      error: 'Muitas requisicoes de sessoes. Tente novamente em instantes.',
    });
  });
});
