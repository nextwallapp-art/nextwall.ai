import type { GdeltEvent } from "@/lib/marketData/gdelt";
import { fetchGdeltEvents } from "@/lib/marketData/gdelt";

const TTL_MS = 4 * 60 * 60 * 1000;
const cache = new Map<string, { events: GdeltEvent[]; expiresAt: number }>();

function cacheKey(assetNames: string[]): string {
  return assetNames.slice().sort().join("|") || "default";
}

/** GDELT free tier — cache 4h to avoid 429 and repeated calls. */
export async function fetchGdeltEventsCached(
  assetNames: string[],
): Promise<GdeltEvent[]> {
  const key = cacheKey(assetNames);
  const hit = cache.get(key);
  if (hit && Date.now() < hit.expiresAt) {
    return hit.events;
  }

  const events = await fetchGdeltEvents(assetNames);
  if (events.length === 0 && hit) {
    // GDELT often 429/timeouts — keep stale events instead of caching empty.
    return hit.events;
  }
  if (events.length > 0) {
    cache.set(key, { events, expiresAt: Date.now() + TTL_MS });
  }
  return events;
}
