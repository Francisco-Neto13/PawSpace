import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = {
  userId: null as string | null,
};

const prismaMock = {
  journalEntry: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
};

vi.mock('@/shared/lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('@/shared/server/auth', () => ({
  getAuthUser: vi.fn(async () => authState.userId),
}));

describe('journal query security', () => {
  beforeEach(() => {
    authState.userId = null;
    prismaMock.journalEntry.findMany.mockReset();
    prismaMock.journalEntry.findUnique.mockReset();
  });

  it('sanitizes legacy journal HTML when loading entries', async () => {
    authState.userId = 'user-a';
    prismaMock.journalEntry.findMany.mockResolvedValue([
      {
        id: 'entry-1',
        title: 'Nota',
        body: '<p>safe</p><script>alert(1)</script><span onclick="evil()">x</span>',
        skillId: null,
        createdAt: new Date('2026-04-01T00:00:00Z'),
        updatedAt: new Date('2026-04-01T00:00:00Z'),
      },
    ]);

    const { getJournalEntries } = await import('./queries');
    const result = await getJournalEntries();

    expect(result).toEqual({
      status: 'ok',
      entries: [
        expect.objectContaining({
          body: '<p>safe</p><span>x</span>',
        }),
      ],
    });
  });

  it('returns null for malformed journal ids when fetching a single entry', async () => {
    authState.userId = 'user-a';
    const { getJournalEntryById } = await import('./queries');

    await expect(getJournalEntryById('bad id')).resolves.toBeNull();
  });
});
