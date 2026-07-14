type RecommendationTrend = {
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
};

async function fetchRecommendations(
  token: string,
  symbol: string,
): Promise<RecommendationTrend | null> {
  const url = `https://finnhub.io/api/v1/stock/recommendation?symbol=${encodeURIComponent(symbol)}&token=${token}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as RecommendationTrend[];
    return data[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchRecentNews(
  token: string,
  symbol: string,
): Promise<string[]> {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 3);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const url =
    `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}` +
    `&from=${fmt(from)}&to=${fmt(to)}&token=${token}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { headline?: string; source?: string }[];
    return data.slice(0, 5).map((n) => `${n.headline ?? ""} (${n.source ?? "news"})`);
  } catch {
    return [];
  }
}

export async function fetchAnalystConsensus(
  finnhubKey: string | undefined,
  stockSymbols: string[],
): Promise<string> {
  if (!finnhubKey || stockSymbols.length === 0) {
    return "Consenso de analistas no disponible (Finnhub requerido). Claude puede inferir desde noticias macro.";
  }

  const lines: string[] = ["Resumen analista (Finnhub recommendation + noticias):"];
  const symbols = stockSymbols.filter((s) => !["GLD", "SLV", "PPLT", "SPY", "QQQ", "URTH", "IEV"].includes(s)).slice(0, 5);

  if (symbols.length === 0) {
    symbols.push(...stockSymbols.slice(0, 3));
  }

  for (const symbol of symbols) {
    const [rec, news] = await Promise.all([
      fetchRecommendations(finnhubKey, symbol),
      fetchRecentNews(finnhubKey, symbol),
    ]);

    lines.push(`\n${symbol}:`);
    if (rec) {
      const total =
        rec.strongBuy + rec.buy + rec.hold + rec.sell + rec.strongSell;
      const bullish = rec.strongBuy + rec.buy;
      const bearish = rec.sell + rec.strongSell;
      lines.push(
        `  Recomendaciones (${rec.period}): ${bullish} alcistas, ${rec.hold} hold, ${bearish} bajistas (total ${total} analistas)`,
      );
    } else {
      lines.push("  Recomendaciones: sin dato");
    }
    if (news.length > 0) {
      lines.push("  Noticias recientes (proxy Bloomberg/Reuters):");
      for (const headline of news) {
        lines.push(`    · ${headline}`);
      }
    }
  }

  return lines.join("\n");
}
