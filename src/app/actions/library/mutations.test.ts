import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authState = {
  userId: null as string | null,
};

const upload = vi.fn();
const remove = vi.fn();
const createBucket = vi.fn();
const updateBucket = vi.fn();

const prismaMock = {
  skill: {
    findFirst: vi.fn(),
  },
  libraryContent: {
    count: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    deleteMany: vi.fn(),
  },
};

const adminClient = {
  storage: {
    createBucket,
    updateBucket,
    from: vi.fn(() => ({
      upload,
      remove,
    })),
  },
};

vi.mock('@/shared/lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('@/shared/server/auth', () => ({
  getAuthUser: vi.fn(async () => authState.userId),
}));

vi.mock('@/shared/supabase/admin', () => ({
  createAdminClient: vi.fn(() => adminClient),
}));

describe('library mutation security', () => {
  beforeEach(() => {
    authState.userId = null;
    upload.mockReset();
    remove.mockReset();
    createBucket.mockReset();
    updateBucket.mockReset();
    prismaMock.skill.findFirst.mockReset();
    prismaMock.libraryContent.count.mockReset();
    prismaMock.libraryContent.create.mockReset();
    prismaMock.libraryContent.findFirst.mockReset();
    prismaMock.libraryContent.deleteMany.mockReset();

    createBucket.mockResolvedValue({ error: null });
    updateBucket.mockResolvedValue({ error: null });
    upload.mockResolvedValue({ error: null });
    remove.mockResolvedValue({ error: null });
    prismaMock.skill.findFirst.mockResolvedValue({ id: 'skill-1' });
    prismaMock.libraryContent.count.mockResolvedValue(0);
    prismaMock.libraryContent.create.mockResolvedValue({
      id: 'content-1',
      skillId: 'skill-1',
      type: 'link',
      title: 'Doc',
      url: 'https://example.com/doc',
      body: null,
      fileKey: null,
      createdAt: new Date('2026-04-01T00:00:00Z'),
    });
    prismaMock.libraryContent.findFirst.mockResolvedValue(null);
    prismaMock.libraryContent.deleteMany.mockResolvedValue({ count: 1 });
  });

  afterEach(async () => {
    const { resetRateLimitStore } = await import('@/shared/server/rateLimit');
    resetRateLimitStore();
  });

  it('rejects unsafe URL schemes for non-note content', async () => {
    authState.userId = 'user-a';
    const { addContent } = await import('./mutations');

    await expect(
      addContent({
        skillId: 'skill-1',
        type: 'link',
        title: 'Bad',
        url: 'javascript:alert(1)',
      })
    ).resolves.toEqual({
      success: false,
      error: 'URL invalida. Use apenas http ou https.',
    });
  });

  it('rejects direct file key injection in addContent', async () => {
    authState.userId = 'user-a';
    const { addContent } = await import('./mutations');

    await expect(
      addContent({
        skillId: 'skill-1',
        type: 'pdf',
        title: 'Secret',
        url: 'https://example.com/file.pdf',
        fileKey: 'user-b/secret.pdf',
      })
    ).resolves.toEqual({
      success: false,
      error: 'File keys diretas nao sao permitidas nesta acao.',
    });
  });

  it('rejects forged PDF uploads that lack a valid PDF signature', async () => {
    authState.userId = 'user-a';
    const { addPdfContent } = await import('./mutations');
    const formData = new FormData();
    formData.append('skillId', 'skill-1');
    formData.append('title', 'PDF falso');
    formData.append('file', new File([Uint8Array.from([1, 2, 3, 4, 5])], 'fake.pdf', { type: 'application/pdf' }));

    await expect(addPdfContent(formData)).resolves.toEqual({
      success: false,
      error: 'O arquivo enviado nao possui assinatura PDF valida.',
    });
  });

  it('removes uploaded PDFs when database persistence fails after upload', async () => {
    authState.userId = 'user-a';
    prismaMock.libraryContent.create.mockRejectedValue(new Error('db failure'));

    const { addPdfContent } = await import('./mutations');
    const formData = new FormData();
    formData.append('skillId', 'skill-1');
    formData.append('title', 'Real PDF');
    formData.append(
      'file',
      new File([Buffer.from('%PDF-1.7\nbody')], 'real.pdf', { type: 'application/pdf' })
    );

    const result = await addPdfContent(formData);

    expect(result).toEqual({
      success: false,
      error: 'Falha no upload',
    });
    expect(upload).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove.mock.calls[0]?.[0]?.[0]).toMatch(/^user-a\/\d+\.pdf$/);
  });

  it('rejects malformed content identifiers on delete', async () => {
    authState.userId = 'user-a';
    const { deleteContent } = await import('./mutations');

    await expect(deleteContent('bad id')).resolves.toEqual({
      success: false,
      error: 'Conteudo invalido.',
    });
  });
});
