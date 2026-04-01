import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authState = {
  userId: null as string | null,
};

const prismaMock = {
  skill: {
    findFirst: vi.fn(),
  },
  journalEntry: {
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
};

vi.mock('@/shared/lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('@/shared/server/auth', () => ({
  getAuthUser: vi.fn(async () => authState.userId),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('journal mutation security', () => {
  beforeEach(() => {
    authState.userId = null;
    prismaMock.skill.findFirst.mockReset();
    prismaMock.journalEntry.count.mockReset();
    prismaMock.journalEntry.create.mockReset();
    prismaMock.journalEntry.update.mockReset();
    prismaMock.journalEntry.deleteMany.mockReset();

    prismaMock.skill.findFirst.mockResolvedValue({ id: 'skill-1' });
    prismaMock.journalEntry.count.mockResolvedValue(0);
    prismaMock.journalEntry.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: 'entry-1',
      title: data.title,
      body: data.body,
      skillId: data.skillId ?? null,
      createdAt: new Date('2026-04-01T00:00:00Z'),
      updatedAt: new Date('2026-04-01T00:00:00Z'),
    }));
    prismaMock.journalEntry.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: 'entry-1',
      title: data.title,
      body: data.body,
      skillId: data.skillId ?? null,
      createdAt: new Date('2026-04-01T00:00:00Z'),
      updatedAt: new Date('2026-04-02T00:00:00Z'),
    }));
    prismaMock.journalEntry.deleteMany.mockResolvedValue({ count: 1 });
  });

  afterEach(async () => {
    const { resetRateLimitStore } = await import('@/shared/server/rateLimit');
    resetRateLimitStore();
  });

  it('sanitizes dangerous HTML before saving journal entries', async () => {
    authState.userId = 'user-a';
    const { saveJournalEntry } = await import('./mutations');

    const result = await saveJournalEntry({
      title: 'Nota',
      body: '<script>alert(1)</script><p onclick="evil()">safe</p><img src=x onerror=evil()>',
      skillId: 'skill-1',
    });

    expect(result.success).toBe(true);
    expect(prismaMock.journalEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          body: '<p>safe</p>',
        }),
      })
    );
  });

  it('rejects malformed journal identifiers on update', async () => {
    authState.userId = 'user-a';
    const { saveJournalEntry } = await import('./mutations');

    await expect(
      saveJournalEntry({
        id: 'bad id',
        title: 'Nota',
        body: '<p>body</p>',
      })
    ).resolves.toEqual({
      success: false,
      error: 'Entrada invalida.',
    });
  });

  it('rejects malformed journal identifiers on delete', async () => {
    authState.userId = 'user-a';
    const { deleteJournalEntry } = await import('./mutations');

    await expect(deleteJournalEntry('bad id')).resolves.toEqual({
      success: false,
      error: 'Entrada invalida.',
    });
  });
});
