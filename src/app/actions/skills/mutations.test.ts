import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authState = {
  userId: null as string | null,
};

const prismaMock = {
  skill: {
    count: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $executeRaw: vi.fn(),
};

vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('@/shared/server/auth', () => ({
  getAuthUser: vi.fn(async () => authState.userId),
}));

describe('skill mutation security', () => {
  beforeEach(() => {
    authState.userId = null;
    prismaMock.skill.count.mockReset();
    prismaMock.skill.findFirst.mockReset();
    prismaMock.skill.create.mockReset();
    prismaMock.skill.update.mockReset();
    prismaMock.skill.delete.mockReset();
    prismaMock.$executeRaw.mockReset();

    prismaMock.skill.count.mockResolvedValue(0);
    prismaMock.skill.findFirst.mockResolvedValue({ id: 'skill-parent' });
    prismaMock.skill.create.mockResolvedValue({
      id: 'skill-1',
      name: 'Node',
      description: null,
      icon: null,
      color: null,
      category: 'keystone',
      shape: 'circle',
      parentId: null,
      positionX: 0,
      positionY: 0,
    });
    prismaMock.skill.update.mockResolvedValue({
      id: 'skill-1',
      name: 'Node',
      description: null,
      icon: null,
      color: null,
      category: 'keystone',
      shape: 'circle',
      parentId: null,
      positionX: 0,
      positionY: 0,
    });
    prismaMock.skill.delete.mockResolvedValue({ id: 'skill-1' });
    prismaMock.$executeRaw.mockResolvedValue(1);
  });

  afterEach(async () => {
    const { resetRateLimitStore } = await import('@/shared/server/rateLimit');
    resetRateLimitStore();
  });

  it('rejects empty skill names', async () => {
    authState.userId = 'user-a';
    const { addSkill } = await import('./mutations');

    await expect(addSkill({ name: '   ' })).resolves.toEqual({
      success: false,
      error: 'Nome obrigatorio.',
    });
  });

  it('rejects self-parent updates', async () => {
    authState.userId = 'user-a';
    const { updateSkill } = await import('./mutations');

    const result = await updateSkill('skill-1', { parentId: 'skill-1' });

    expect(result).toEqual({
      success: false,
      error: 'Um modulo nao pode ser pai de si mesmo.',
    });
  });

  it('rejects oversized bulk tree sync payloads', async () => {
    authState.userId = 'user-a';
    const { savePawSpaceChanges } = await import('./mutations');
    const nodes = Array.from({ length: 51 }, (_, index) => ({
      id: `skill-${index}`,
      position: { x: index, y: index },
      data: {
        name: `Node ${index}`,
        shape: 'circle',
      },
    }));

    const result = await savePawSpaceChanges(nodes as never[]);

    expect(result).toEqual({
      success: false,
      error: 'Limite de 50 nos por sincronizacao excedido.',
    });
  });

  it('rejects oversized position batches', async () => {
    authState.userId = 'user-a';
    const { updateManySkillPositions } = await import('./mutations');
    const positions = Array.from({ length: 51 }, (_, index) => ({
      skillId: `skill-${index}`,
      x: index,
      y: index,
    }));

    const result = await updateManySkillPositions(positions);

    expect(result).toEqual({
      success: false,
      error: 'Limite de 50 nos por lote excedido.',
    });
  });
});
