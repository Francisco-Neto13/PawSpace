import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authState = {
  user: null as
    | {
        id: string;
        user_metadata?: Record<string, unknown>;
      }
    | null,
};

const createBucket = vi.fn();
const updateBucket = vi.fn();
const upload = vi.fn();
const list = vi.fn();
const remove = vi.fn();
const getPublicUrl = vi.fn();
const updateUser = vi.fn();

const userClient = {
  auth: {
    updateUser,
  },
};

const adminClient = {
  storage: {
    createBucket,
    updateBucket,
    from: vi.fn(() => ({
      upload,
      list,
      remove,
      getPublicUrl,
    })),
  },
};

vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    rotate: vi.fn().mockReturnThis(),
    metadata: vi.fn().mockResolvedValue({ width: 100, height: 100 }),
    extract: vi.fn().mockReturnThis(),
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('avatar')),
  })),
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

describe('profile actions security', () => {
  beforeEach(() => {
    authState.user = null;
    createBucket.mockReset();
    updateBucket.mockReset();
    upload.mockReset();
    list.mockReset();
    remove.mockReset();
    getPublicUrl.mockReset();
    updateUser.mockReset();

    createBucket.mockResolvedValue({ error: null });
    updateBucket.mockResolvedValue({ error: null });
    upload.mockResolvedValue({ error: null });
    list.mockResolvedValue({ data: [{ name: 'avatar.webp', metadata: { size: 100 } }], error: null });
    remove.mockResolvedValue({ error: null });
    getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example/avatar.webp' } });
    updateUser.mockResolvedValue({ error: null });
  });

  afterEach(async () => {
    const { resetRateLimitStore } = await import('@/shared/server/rateLimit');
    const { resetAvatarBucketStateForTests } = await import('./profile');
    resetRateLimitStore();
    await resetAvatarBucketStateForTests();
  });

  it('rejects avatar uploads without an authenticated session', async () => {
    const { uploadProfileAvatar } = await import('./profile');
    const formData = new FormData();

    await expect(uploadProfileAvatar(formData)).resolves.toEqual({
      success: false,
      error: 'Sessao nao encontrada.',
    });
  });

  it('rejects malformed avatar crop payloads', async () => {
    authState.user = { id: 'user-a', user_metadata: {} };
    const { uploadProfileAvatar } = await import('./profile');
    const formData = new FormData();
    formData.append('file', new File([Uint8Array.from([1, 2, 3])], 'avatar.png', { type: 'image/png' }));
    formData.append('avatar_crop', '{"crop":{"x":"bad"}}');

    await expect(uploadProfileAvatar(formData)).resolves.toEqual({
      success: false,
      error: 'Recorte de avatar invalido.',
    });
  });

  it('rejects unsupported avatar mime types', async () => {
    authState.user = { id: 'user-a', user_metadata: {} };
    const { uploadProfileAvatar } = await import('./profile');
    const formData = new FormData();
    formData.append('file', new File([Uint8Array.from([1, 2, 3])], 'avatar.gif', { type: 'image/gif' }));

    await expect(uploadProfileAvatar(formData)).resolves.toEqual({
      success: false,
      error: 'Use uma imagem JPG, PNG ou WEBP.',
    });
  });

  it('removes only avatar paths that belong to the authenticated user', async () => {
    authState.user = {
      id: 'user-a',
      user_metadata: {
        avatar_path: 'other-user/avatar.webp',
        avatar_url: 'https://cdn.example/avatar.webp',
      },
    };

    const { removeProfileAvatar } = await import('./profile');
    const result = await removeProfileAvatar();

    expect(result).toEqual({ success: true });
    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith(['user-a/avatar.webp']);
  });
});
