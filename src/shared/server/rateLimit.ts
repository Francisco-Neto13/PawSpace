type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function consumeRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}) {
  const now = input.now ?? Date.now();
  const bucketKey = input.key;
  const existing = buckets.get(bucketKey);

  if (!existing || existing.resetAt <= now) {
    const fresh: RateLimitBucket = {
      count: 1,
      resetAt: now + input.windowMs,
    };
    buckets.set(bucketKey, fresh);
    return {
      allowed: true,
      remaining: Math.max(input.limit - fresh.count, 0),
      resetAt: fresh.resetAt,
    };
  }

  existing.count += 1;
  buckets.set(bucketKey, existing);

  return {
    allowed: existing.count <= input.limit,
    remaining: Math.max(input.limit - existing.count, 0),
    resetAt: existing.resetAt,
  };
}

export function resetRateLimitStore() {
  buckets.clear();
}
