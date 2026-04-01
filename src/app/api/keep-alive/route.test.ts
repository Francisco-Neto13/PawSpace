import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  $queryRaw: vi.fn(),
};

const originalCronSecret = process.env.CRON_SECRET;

vi.mock('@/shared/lib/prisma', () => ({
  default: prismaMock,
}));

describe('GET /api/keep-alive', () => {
  beforeEach(() => {
    vi.resetModules();
    prismaMock.$queryRaw.mockReset();
    prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    process.env.CRON_SECRET = 'keep-alive-secret';
  });

  afterEach(() => {
    if (originalCronSecret === undefined) {
      delete process.env.CRON_SECRET;
      return;
    }

    process.env.CRON_SECRET = originalCronSecret;
  });

  it('returns 503 when the cron secret is missing', async () => {
    delete process.env.CRON_SECRET;

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/keep-alive'));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Keep-alive nao configurado.',
    });
  });

  it('returns 401 for unauthorized requests', async () => {
    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/keep-alive'));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Nao autorizado.',
    });
  });

  it('returns 200 and performs a minimal database query for authorized requests', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/keep-alive', {
        headers: {
          Authorization: 'Bearer keep-alive-secret',
        },
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('returns 500 when the database check fails', async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error('db down'));

    const { GET } = await import('./route');
    const response = await GET(
      new Request('http://localhost/api/keep-alive', {
        headers: {
          Authorization: 'Bearer keep-alive-secret',
        },
      })
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Falha ao consultar o banco.',
    });
  });
});
