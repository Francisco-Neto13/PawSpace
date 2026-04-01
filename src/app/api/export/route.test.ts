import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authState = {
  userId: null as string | null,
};

const prismaMock = {
  skill: {
    findMany: vi.fn(),
  },
  journalEntry: {
    findMany: vi.fn(),
  },
  libraryContent: {
    findMany: vi.fn(),
  },
};

vi.mock('@/shared/lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('@/shared/server/auth', () => ({
  getAuthUser: vi.fn(async () => authState.userId),
}));

describe('GET /api/export', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-01T15:00:00Z'));
    authState.userId = null;
    prismaMock.skill.findMany.mockReset();
    prismaMock.journalEntry.findMany.mockReset();
    prismaMock.libraryContent.findMany.mockReset();
  });

  afterEach(async () => {
    const { resetRateLimitStore } = await import('@/shared/server/rateLimit');
    resetRateLimitStore();
    vi.useRealTimers();
  });

  it('returns the expected export payload on the happy path', async () => {
    authState.userId = 'user-a';

    prismaMock.skill.findMany.mockResolvedValue([
      {
        id: 'skill-1',
        name: 'Tree item',
        description: null,
        icon: 'T',
        category: 'keystone',
        shape: 'circle',
        color: '#fff',
        parentId: null,
        positionX: 10,
        positionY: 20,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        requiredParentLevel: 0,
        createdAt: new Date('2026-03-01T00:00:00Z'),
        updatedAt: new Date('2026-03-02T00:00:00Z'),
      },
    ]);
    prismaMock.journalEntry.findMany.mockResolvedValue([
      {
        id: 'entry-1',
        skillId: 'skill-1',
        title: 'Daily note',
        body: '<p>hello</p>',
        createdAt: new Date('2026-03-03T00:00:00Z'),
        updatedAt: new Date('2026-03-04T00:00:00Z'),
      },
    ]);
    prismaMock.libraryContent.findMany.mockResolvedValue([
      {
        id: 'content-1',
        skillId: 'skill-1',
        type: 'pdf',
        title: 'Guide',
        url: null,
        body: null,
        createdAt: new Date('2026-03-05T00:00:00Z'),
        updatedAt: new Date('2026-03-06T00:00:00Z'),
      },
    ]);

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/export?scope=all'));
    const payload = JSON.parse(await response.text()) as {
      scope: string;
      data: Record<string, unknown>;
    };

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Disposition')).toContain('pawspace-all-2026-04-01.json');
    expect(payload.scope).toBe('all');
    expect(payload.data).toHaveProperty('tree');
    expect(payload.data).toHaveProperty('journal');
    expect(payload.data).toHaveProperty('library');
    expect(prismaMock.skill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-a' } })
    );
    expect(prismaMock.journalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-a' } })
    );
    expect(prismaMock.libraryContent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-a' } })
    );
  });

  it('returns 400 when scope is missing', async () => {
    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/export'));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: 'Scope obrigatorio.' });
  });

  it('returns 404 when the requested export resource does not exist', async () => {
    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/export?scope=payments'));
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: 'Recurso de exportacao nao encontrado.' });
  });

  it('returns 400 for malformed scope values that look like injection payloads', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/export?scope=journal%20OR%201%3D1')
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: 'Scope invalido.' });
  });

  it('returns 401 for malformed authorization headers when there is no authenticated session', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/export?scope=all', {
        headers: {
          Authorization: 'Bearer not-a-real-token',
        },
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ error: 'Nao autorizado.' });
  });

  it('returns 401 for a JWT using alg none when there is no authenticated session', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/export?scope=all', {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyLWEifQ.',
        },
      })
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Nao autorizado.' });
  });

  it('returns 401 for a tampered token when there is no authenticated session', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/export?scope=all', {
        headers: {
          Authorization: 'Bearer header.payload.invalidsignature',
        },
      })
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Nao autorizado.' });
  });

  it('returns 403 when a user tries to force export of another user id', async () => {
    authState.userId = 'user-a';

    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/export?scope=all&userId=user-b')
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload).toEqual({ error: 'Acesso proibido a dados de outro usuario.' });
  });

  it('returns 413 when the scope query exceeds the supported limit', async () => {
    const longScope = 'a'.repeat(200);
    const { GET } = await import('./route');
    const response = await GET(
      new Request(`http://localhost/api/export?scope=${longScope}`)
    );
    const payload = await response.json();

    expect(response.status).toBe(413);
    expect(payload).toEqual({ error: 'Scope excede o limite permitido.' });
  });

  it('returns 429 on the 11th request inside the rate-limit window', async () => {
    authState.userId = 'user-a';
    prismaMock.journalEntry.findMany.mockResolvedValue([]);

    const { GET } = await import('./route');
    const request = new Request('http://localhost/api/export?scope=journal', {
      headers: {
        'x-forwarded-for': '203.0.113.10',
      },
    });

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await GET(request);
      expect(response.status).toBe(200);
    }

    const blocked = await GET(request);
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({
      error: 'Muitas requisicoes de exportacao. Tente novamente em instantes.',
    });
  });
});
