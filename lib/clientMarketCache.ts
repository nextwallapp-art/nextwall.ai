import type { GeoHotspot } from "@/lib/geoHotspots";
import type { StructuredAnalysis } from "@/lib/marketAnalysis";

const STORAGE_PREFIX = "nextwall-market";
const TTL_MS = 90 * 60 * 1000;

export type CachedMarketResponse = {
  stocks: unknown[];
  crypto: unknown[];
  macro: unknown[];
  marketOpen: boolean;
  lastUpdated: string;
  analysis: StructuredAnalysis | null;
  geoHotspots?: GeoHotspot[];
  sourceErrors?: string[];
  refreshQuota?: {
    used: number;
    limit: number;
    remaining: number;
    retryAfter: number;
  };
};

type CacheEntry = {
  data: CachedMarketResponse;
  cachedAt: number;
};

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function getClientMarketCache(
  userId: string,
): CachedMarketResponse | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(storageKey(userId));
    if (!raw) return null;

    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.cachedAt > TTL_MS) {
      sessionStorage.removeItem(storageKey(userId));
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function setClientMarketCache(
  userId: string,
  data: CachedMarketResponse,
): void {
  if (typeof window === "undefined") return;

  try {
    const entry: CacheEntry = { data, cachedAt: Date.now() };
    sessionStorage.setItem(storageKey(userId), JSON.stringify(entry));
  } catch {
    // sessionStorage unavailable
  }
}

export function isClientCacheFresh(userId: string): boolean {
  return getClientMarketCache(userId) !== null;
}
