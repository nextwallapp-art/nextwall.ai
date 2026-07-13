type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  userId: string,
  limit = 10,
  windowMs = 60 * 60 * 1000,
): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const entry = store.get(userId);

  if (!entry || now >= entry.resetAt) {
    store.set(userId, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (entry.count >= limit) {
    return {
      ok: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { ok: true };
}
