type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 90 * 60 * 1000;

export function getMarketResponseCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setMarketResponseCache<T>(
  key: string,
  value: T,
  ttlMs = DEFAULT_TTL_MS,
): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function buildMarketCacheKey(
  userId: string,
  profile: { selected_assets?: unknown } | null,
): string {
  const assets = profile?.selected_assets
    ? JSON.stringify(profile.selected_assets)
    : "default";
  return `market:${userId}:${assets}`;
}
