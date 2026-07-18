import type { StructuredAnalysis } from "@/lib/marketAnalysis";

type CacheEntry = {
  analysis: StructuredAnalysis;
  expiresAt: number;
};

const store = new Map<string, CacheEntry>();
const TTL_MS = 24 * 60 * 60 * 1000;

export function buildDailyAnalysisCacheKey(
  userId: string,
  profile: { selected_assets?: unknown } | null,
): string {
  const assets = profile?.selected_assets
    ? JSON.stringify(profile.selected_assets)
    : "default";
  return `daily-analysis:${userId}:${assets}`;
}

export function getDailyAnalysisCache(
  key: string,
): StructuredAnalysis | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.analysis;
}

export function setDailyAnalysisCache(
  key: string,
  analysis: StructuredAnalysis,
): void {
  store.set(key, { analysis, expiresAt: Date.now() + TTL_MS });
}
