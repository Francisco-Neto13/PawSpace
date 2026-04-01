import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = {
  user: null as { id: string } | null,
  session: null as { access_token?: string | null } | null,
};

const prismaMock = {
  $queryRaw: vi.fn(),
};

const supabaseClient = {
  auth: {
    getSession: vi.fn(async () => ({
      data: { session: authState.session },
    })),
  },
};

vi.mock('@/shared/lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('@/shared/server/auth', () => ({
  getCurrentUser: vi.fn(async () => authState.user),
}));

vi.mock('@/shared/supabase/server', () => ({
  createClient: vi.fn(async () => supabaseClient),
}));

vi.mock('@/components/settings/features/privacy/sessionUtils', () => ({
  describeDeviceFromUserAgent: vi.fn((userAgent: string | null) => ({
    device: userAgent ? 'Chrome em Windows' : 'Dispositivo conectado',
    type: 'desktop',
  })),
}));

describe('user session helper security', () => {
  beforeEach(async () => {
    authState.user = null;
    authState.session = null;
    prismaMock.$queryRaw.mockReset();

    const { resetSessionColumnCache } = await import('./userSessions');
    resetSessionColumnCache();
  });

  it('returns unauthorized when there is no authenticated user', async () => {
    const { getUserSessions } = await import('./userSessions');

    await expect(getUserSessions()).resolves.toEqual({
      status: 'unauthorized',
      sessions: [],
    });
  });

  it('returns limited when auth.sessions lacks required columns', async () => {
    authState.user = { id: '11111111-1111-1111-1111-111111111111' };
    prismaMock.$queryRaw.mockResolvedValueOnce([{ column_name: 'updated_at' }]);

    const { getUserSessions } = await import('./userSessions');
    const result = await getUserSessions();

    expect(result).toEqual({
      status: 'limited',
      sessions: [],
    });
  });

  it('maps sessions with the current-session marker using the safe query path', async () => {
    authState.user = { id: '11111111-1111-1111-1111-111111111111' };
    authState.session = {
      access_token:
        'eyJhbGciOiJIUzI1NiJ9.eyJzZXNzaW9uX2lkIjoic2Vzc2lvbi0xIn0.signature',
    };
    prismaMock.$queryRaw
      .mockResolvedValueOnce([
        { column_name: 'id' },
        { column_name: 'user_id' },
        { column_name: 'updated_at' },
        { column_name: 'created_at' },
        { column_name: 'not_after' },
        { column_name: 'user_agent' },
      ])
      .mockResolvedValueOnce([
        {
          id: 'session-1',
          user_id: '11111111-1111-1111-1111-111111111111',
          created_at: new Date('2026-04-01T00:00:00Z'),
          updated_at: new Date('2026-04-01T01:00:00Z'),
          not_after: null,
          user_agent: 'Mozilla/5.0 Chrome/120.0 Windows',
        },
      ]);

    const { getUserSessions } = await import('./userSessions');
    const result = await getUserSessions();

    expect(result).toEqual({
      status: 'ok',
      sessions: [
        {
          id: 'session-1',
          device: 'Chrome em Windows',
          location: 'Acesso registrado',
          lastSeen: '2026-04-01T01:00:00.000Z',
          isCurrent: true,
          type: 'desktop',
        },
      ],
    });
    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(2);
  });
});
