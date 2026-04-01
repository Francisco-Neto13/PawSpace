import { consumeRateLimit } from '@/shared/server/rateLimit';

const DEFAULT_ID_MAX_LENGTH = 128;
const SAFE_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/;

export type IdentifierValidationResult =
  | { ok: true; value: string | null }
  | { ok: false; reason: 'missing' | 'invalid' | 'too_long' };

export function validateIdentifier(
  rawValue: string | null | undefined,
  options?: {
    allowEmpty?: boolean;
    maxLength?: number;
    pattern?: RegExp;
  }
): IdentifierValidationResult {
  const allowEmpty = options?.allowEmpty ?? false;
  const maxLength = options?.maxLength ?? DEFAULT_ID_MAX_LENGTH;
  const pattern = options?.pattern ?? SAFE_IDENTIFIER_PATTERN;
  const value = (rawValue ?? '').trim();

  if (!value) {
    return allowEmpty ? { ok: true, value: null } : { ok: false, reason: 'missing' };
  }

  if (value.length > maxLength) {
    return { ok: false, reason: 'too_long' };
  }

  if (!pattern.test(value)) {
    return { ok: false, reason: 'invalid' };
  }

  return { ok: true, value };
}

export function normalizeHttpUrl(
  rawValue: string | null | undefined,
  maxLength: number
): { ok: true; value: string | null } | { ok: false; reason: 'missing' | 'invalid' | 'too_long' } {
  const value = (rawValue ?? '').trim();

  if (!value) {
    return { ok: false, reason: 'missing' };
  }

  if (value.length > maxLength) {
    return { ok: false, reason: 'too_long' };
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false, reason: 'invalid' };
    }

    return { ok: true, value: parsed.toString() };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}

export function isUserScopedStoragePath(path: string | null | undefined, userId: string) {
  const value = (path ?? '').trim();
  return value.length > 0 && value.startsWith(`${userId}/`) && !value.includes('..');
}

export function looksLikePdfBytes(bytes: Uint8Array) {
  if (bytes.byteLength < 5) return false;
  return Buffer.from(bytes.slice(0, 5)).toString('ascii') === '%PDF-';
}

export function enforceUserActionRateLimit(input: {
  scope: string;
  userId: string;
  limit: number;
  windowMs: number;
}) {
  return consumeRateLimit({
    key: `action:${input.scope}:${input.userId}`,
    limit: input.limit,
    windowMs: input.windowMs,
  });
}
