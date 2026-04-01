import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authState = {
  userId: null as string | null,
};

const prismaMock = {
  libraryContent: {
    findFirst: vi.fn(),
  },
};

const signedUrlMock = vi.fn();

vi.mock('@/shared/lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('@/shared/server/auth', () => ({
  getAuthUser: vi.fn(async () => authState.userId),
}));

vi.mock('@/shared/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        createSignedUrl: signedUrlMock,
      })),
    },
  })),
}));

vi.mock('@/shared/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    storage: {
      from: vi.fn(() => ({
        createSignedUrl: signedUrlMock,
      })),
    },
  })),
}));

describe('GET /api/library/files/[contentId]', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-01T15:30:00Z'));
    authState.userId = null;
    prismaMock.libraryContent.findFirst.mockReset();
    signedUrlMock.mockReset();
  });

  afterEach(async () => {
    const { resetRateLimitStore } = await import('@/shared/server/rateLimit');
    resetRateLimitStore();
    vi.useRealTimers();
  });

  it('redirects to the signed URL on the happy path', async () => {
    authState.userId = 'user-a';
    prismaMock.libraryContent.findFirst.mockResolvedValue({
      userId: 'user-a',
      fileKey: 'user-a/file.pdf',
    });
    signedUrlMock.mockResolvedValue({
      data: { signedUrl: 'https://files.example/signed.pdf' },
      error: null,
    });

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/library/files/content-1'), {
      params: Promise.resolve({ contentId: 'content-1' }),
    });

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://files.example/signed.pdf');
  });

  it('returns 400 when contentId is missing', async () => {
    authState.userId = 'user-a';

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/library/files/'), {
      params: Promise.resolve({ contentId: '' }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'contentId obrigatorio.' });
  });

  it('returns 404 when the PDF resource does not exist', async () => {
    authState.userId = 'user-a';
    prismaMock.libraryContent.findFirst.mockResolvedValue(null);

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/library/files/missing'), {
      params: Promise.resolve({ contentId: 'missing' }),
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Arquivo nao encontrado.' });
  });

  it('returns 400 for malformed contentId values that look like injection payloads', async () => {
    authState.userId = 'user-a';

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/library/files/bad'), {
      params: Promise.resolve({ contentId: 'abc OR 1=1' }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'contentId invalido.' });
  });

  it('returns 401 for malformed authorization headers when there is no authenticated session', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/library/files/content-1', {
        headers: {
          Authorization: 'Bearer invalid',
        },
      }),
      {
        params: Promise.resolve({ contentId: 'content-1' }),
      }
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Nao autorizado.' });
  });

  it('returns 401 for a JWT using alg none when there is no authenticated session', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/library/files/content-1', {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyLWEifQ.',
        },
      }),
      {
        params: Promise.resolve({ contentId: 'content-1' }),
      }
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Nao autorizado.' });
  });

  it('returns 401 for a tampered token when there is no authenticated session', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/library/files/content-1', {
        headers: {
          Authorization: 'Bearer header.payload.invalidsignature',
        },
      }),
      {
        params: Promise.resolve({ contentId: 'content-1' }),
      }
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Nao autorizado.' });
  });

  it('returns 403 when user A requests a file owned by user B', async () => {
    authState.userId = 'user-a';
    prismaMock.libraryContent.findFirst.mockResolvedValue({
      userId: 'user-b',
      fileKey: 'user-b/file.pdf',
    });

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/library/files/content-2'), {
      params: Promise.resolve({ contentId: 'content-2' }),
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Acesso proibido a arquivo de outro usuario.' });
  });

  it('returns 413 when contentId exceeds the supported limit', async () => {
    authState.userId = 'user-a';
    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/library/files/oversize'), {
      params: Promise.resolve({ contentId: 'a'.repeat(200) }),
    });

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: 'contentId excede o limite permitido.' });
  });

  it('returns 429 on the 11th request inside the rate-limit window', async () => {
    authState.userId = 'user-a';
    prismaMock.libraryContent.findFirst.mockResolvedValue({
      userId: 'user-a',
      fileKey: 'user-a/file.pdf',
    });
    signedUrlMock.mockResolvedValue({
      data: { signedUrl: 'https://files.example/signed.pdf' },
      error: null,
    });

    const { GET } = await import('./route');
    const request = new Request('http://localhost/api/library/files/content-1', {
      headers: {
        'x-forwarded-for': '203.0.113.10',
      },
    });

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await GET(request, {
        params: Promise.resolve({ contentId: 'content-1' }),
      });
      expect(response.status).toBe(307);
    }

    const blocked = await GET(request, {
      params: Promise.resolve({ contentId: 'content-1' }),
    });

    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({
      error: 'Muitas requisicoes para abrir arquivos. Tente novamente em instantes.',
    });
  });
});
