export type GdeltEvent = {
  event: string;
  country: string;
  tone: "positivo" | "negativo" | "neutral";
  relevance: string;
};

const ASSET_GEO_KEYWORDS: Record<string, string[]> = {
  Apple: ["technology trade", "China tariffs", "semiconductor"],
  Nvidia: ["AI chips export", "China technology", "semiconductor sanctions"],
  Tesla: ["EV tariffs", "China auto", "electric vehicle trade"],
  Amazon: ["antitrust", "e-commerce regulation", "labor"],
  Microsoft: ["cloud regulation", "AI policy", "antitrust"],
  Google: ["antitrust", "search regulation", "AI policy"],
  Bitcoin: ["cryptocurrency regulation", "crypto ban", "digital asset"],
  Ethereum: ["cryptocurrency regulation", "DeFi regulation", "SEC crypto"],
  Solana: ["cryptocurrency regulation", "blockchain"],
  BNB: ["cryptocurrency regulation", "exchange regulation"],
  XRP: ["SEC lawsuit", "cryptocurrency regulation"],
  Oro: ["gold safe haven", "Middle East conflict", "central bank gold"],
  Plata: ["silver mining", "industrial metals", "precious metals"],
  Platino: ["platinum mining", "automotive metals"],
  "S&P 500 (SPY)": ["US economy", "Federal Reserve", "trade war"],
  "Nasdaq (QQQ)": ["tech regulation", "Federal Reserve", "AI policy"],
  "MSCI World": ["global trade", "geopolitical risk", "Europe economy"],
  "S&P Europe 350": ["Europe economy", "ECB policy", "Ukraine"],
};

function toneFromTitle(title: string): GdeltEvent["tone"] {
  const lower = title.toLowerCase();
  const negative = [
    "war",
    "conflict",
    "sanction",
    "attack",
    "crisis",
    "fall",
    "drop",
    "tension",
    "protest",
    "strike",
    "guerra",
    "conflicto",
    "sanción",
    "crisis",
    "tensión",
  ];
  const positive = [
    "peace",
    "deal",
    "agreement",
    "recovery",
    "growth",
    "cut rates",
    "paz",
    "acuerdo",
    "recuperación",
  ];
  if (negative.some((w) => lower.includes(w))) return "negativo";
  if (positive.some((w) => lower.includes(w))) return "positivo";
  return "neutral";
}

function buildGdeltQuery(assetNames: string[]): string {
  const terms = new Set<string>([
    "geopolitical",
    "sanctions",
    "Federal Reserve",
    "inflation",
    "Middle East",
  ]);
  for (const name of assetNames) {
    const keywords = ASSET_GEO_KEYWORDS[name];
    if (keywords) {
      for (const kw of keywords) terms.add(kw);
    }
  }
  return Array.from(terms)
    .slice(0, 12)
    .map((t) => `"${t}"`)
    .join(" OR ");
}

export async function fetchGdeltEvents(
  assetNames: string[],
): Promise<GdeltEvent[]> {
  const query = buildGdeltQuery(assetNames);
  const url =
    `https://api.gdeltproject.org/api/v2/doc/doc` +
    `?query=${encodeURIComponent(query)}` +
    `&timespan=48h&mode=artlist&maxrecords=20&format=json&sort=datedesc`;

  try {
    let res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (res.status === 429) {
      console.warn("[gdelt] HTTP 429 — retrying after backoff");
      await new Promise((r) => setTimeout(r, 2_000));
      res = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      });
    }
    if (!res.ok) {
      console.error("[gdelt] HTTP", res.status);
      return [];
    }

    const payload = (await res.json()) as {
      articles?: {
        title?: string;
        domain?: string;
        sourcecountry?: string;
        url?: string;
      }[];
    };

    return (payload.articles ?? []).slice(0, 15).map((article) => {
      const title = article.title?.trim() || "Evento sin título";
      const country = article.sourcecountry?.trim() || article.domain || "Global";
      return {
        event: title,
        country,
        tone: toneFromTitle(title),
        relevance: `Cobertura mediática en ${country} (GDELT, últimas 48h)`,
      };
    });
  } catch (err) {
    console.error("[gdelt] fetch error:", err);
    return [];
  }
}

export function formatGdeltEvents(events: GdeltEvent[]): string {
  if (events.length === 0) {
    return "No se obtuvieron eventos GDELT en las últimas 48h (API no disponible o sin resultados).";
  }

  return events
    .map(
      (e, i) =>
        `${i + 1}. [${e.tone.toUpperCase()}] ${e.event}\n   País/fuente: ${e.country}\n   Relevancia: ${e.relevance}`,
    )
    .join("\n\n");
}
