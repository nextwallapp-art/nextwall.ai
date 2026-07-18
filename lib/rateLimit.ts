type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type DailyRefreshQuota = {
  used: number;
  limit: number;
  remaining: number;
  retryAfter: number;
};

const store = new Map<string, RateLimitEntry>();

const DAY_MS = 24 * 60 * 60 * 1000;

function dailyRefreshLimit(): number {
  return Number(process.env.DAILY_REFRESH_LIMIT ?? "5");
}

function dailyRefreshKey(userId: string): string {
  return `refresh:${userId}`;
}

/** Read-only status for manual dashboard refreshes (force=1). */
export function getDailyRefreshStatus(userId: string): DailyRefreshQuota {
  const limit = dailyRefreshLimit();
  const now = Date.now();
  const entry = store.get(dailyRefreshKey(userId));

  if (!entry || now >= entry.resetAt) {
    return { used: 0, limit, remaining: limit, retryAfter: 0 };
  }

  const used = entry.count;
  const remaining = Math.max(0, limit - used);
  return {
    used,
    limit,
    remaining,
    retryAfter: remaining > 0 ? 0 : Math.ceil((entry.resetAt - now) / 1000),
  };
}

/** Consume one daily refresh slot. Call only for force=1 requests. */
export function tryConsumeDailyRefresh(userId: string):
  | ({ ok: true } & DailyRefreshQuota)
  | ({ ok: false } & DailyRefreshQuota) {
  const limit = dailyRefreshLimit();
  const key = dailyRefreshKey(userId);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + DAY_MS });
    return { ok: true, used: 1, limit, remaining: limit - 1, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return {
      ok: false,
      used: entry.count,
      limit,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    ok: true,
    used: entry.count,
    limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfter: 0,
  };
}

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

/** Hard cap on paid Claude analysis generations per user per day. */
export function getClaudeAnalysisStatus(userId: string): {
  ok: boolean;
  retryAfter: number;
  limit: number;
  used: number;
  remaining: number;
} {
  const limit = Number(process.env.ANTHROPIC_DAILY_ANALYSIS_LIMIT ?? "1");
  const key = `claude:${userId}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    return { ok: true, retryAfter: 0, limit, used: 0, remaining: limit };
  }

  const used = entry.count;
  const remaining = Math.max(0, limit - used);
  return {
    ok: remaining > 0,
    retryAfter:
      remaining > 0 ? 0 : Math.ceil((entry.resetAt - now) / 1000),
    limit,
    used,
    remaining,
  };
}

/** Consume one Claude slot — call only when starting a real Claude request. */
export function tryConsumeClaudeAnalysis(userId: string): {
  ok: boolean;
  retryAfter: number;
  limit: number;
} {
  const status = getClaudeAnalysisStatus(userId);
  if (!status.ok) {
    return { ok: false, retryAfter: status.retryAfter, limit: status.limit };
  }

  const limit = status.limit;
  const key = `claude:${userId}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + DAY_MS });
    return { ok: true, retryAfter: 0, limit };
  }

  entry.count += 1;
  return { ok: true, retryAfter: 0, limit };
}

/** @deprecated Use getClaudeAnalysisStatus + tryConsumeClaudeAnalysis */
export function checkClaudeAnalysisLimit(userId: string): {
  ok: boolean;
  retryAfter: number;
  limit: number;
} {
  return tryConsumeClaudeAnalysis(userId);
}
