import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authState = {
  user: null as
    | {
        id: string;
        user_metadata?: Record<string, unknown>;
      }
    | null,
};

const adminStorageRemove = vi.fn();
const userStorageRemove = vi.fn();
const adminDeleteUser = vi.fn();
const signOut = vi.fn();

const prismaMock = {
  libraryContent: {
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  journalEntry: {
    deleteMany: vi.fn(),
  },
  skill: {
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

const userClient = {
  storage: {
    from: vi.fn(() => ({
      remove: userStorageRemove,
    })),
  },
  auth: {
    signOut,
  },
};

const adminClient = {
  storage: {
    from: vi.fn(() => ({
      remove: adminStorageRemove,
    })),
  },
  auth: {
    admin: {
      deleteUser: adminDeleteUser,
    },
  },
};

vi.mock('@/shared/lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('@/shared/server/auth', () => ({
  getCurrentUser: vi.fn(async () => authState.user),
}));

vi.mock('@/shared/supabase/server', () => ({
  createClient: vi.fn(async () => userClient),
}));

vi.mock('@/shared/supabase/admin', () => ({
  createAdminClient: vi.fn(() => adminClient),
}));

describe('account actions security', () => {
  beforeEach(() => {
    authState.user = null;
    adminStorageRemove.mockReset();
    userStorageRemove.mockReset();
    adminDeleteUser.mockReset();
    signOut.mockReset();
    prismaMock.libraryContent.findMany.mockReset();
    prismaMock.libraryContent.deleteMany.mockReset();
    prismaMock.journalEntry.deleteMany.mockReset();
    prismaMock.skill.deleteMany.mockReset();
    prismaMock.$transaction.mockReset();

    adminStorageRemove.mockResolvedValue({ error: null });
    userStorageRemove.mockResolvedValue({ error: null });
    adminDeleteUser.mockResolvedValue({ error: null });
    signOut.mockResolvedValue({ error: null });
    prismaMock.libraryContent.findMany.mockResolvedValue([]);
    prismaMock.libraryContent.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.journalEntry.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.skill.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.$transaction.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    const { resetRateLimitStore } = await import('@/shared/server/rateLimit');
    resetRateLimitStore();
  });

  it('returns a session error when no authenticated user exists', async () => {
    const { deleteCurrentAccount } = await import('./account');

    await expect(deleteCurrentAccount()).resolves.toEqual({
      success: false,
      error: 'Sessao nao encontrada.',
    });
  });

  it('deletes only storage paths scoped to the current user', async () => {
    authState.user = {
      id: 'user-a',
      user_metadata: {
        avatar_path: 'other-user/avatar.webp',
      },
    };
    prismaMock.libraryContent.findMany.mockResolvedValue([
      { fileKey: 'user-a/doc-1.pdf' },
      { fileKey: 'user-b/doc-2.pdf' },
      { fileKey: null },
    ]);

    const { deleteCurrentAccount } = await import('./account');
    const result = await deleteCurrentAccount();

    expect(result).toEqual({ success: true });
    expect(adminStorageRemove).toHaveBeenCalledTimes(1);
    expect(adminStorageRemove).toHaveBeenCalledWith(['user-a/doc-1.pdf']);
    expect(adminDeleteUser).toHaveBeenCalledWith('user-a');
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('rate limits repeated account deletion attempts', async () => {
    authState.user = {
      id: 'user-a',
      user_metadata: {},
    };

    const { deleteCurrentAccount } = await import('./account');

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const result = await deleteCurrentAccount();
      expect(result.success).toBe(true);
    }

    await expect(deleteCurrentAccount()).resolves.toEqual({
      success: false,
      error: 'Muitas tentativas de exclusao de conta. Tente novamente mais tarde.',
    });
  });
});
