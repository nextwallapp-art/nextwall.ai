export type OnChainSnapshot = {
  symbol: string;
  name: string;
  price: number | null;
  change24h: number | null;
  athChangePct: number | null;
  change30dPct: number | null;
  marketCapRank: number | null;
  dominanceNote: string;
  mvrvProxy: string;
  holdersUnderWaterProxy: string;
};

async function fetchCoinDetail(
  coingeckoId: string,
  apiKey: string | undefined,
): Promise<OnChainSnapshot | null> {
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coingeckoId)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers["x-cg-demo-api-key"] = apiKey;

  try {
    const res = await fetch(url, { cache: "no-store", headers });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      symbol?: string;
      name?: string;
      market_data?: {
        current_price?: { usd?: number };
        ath_change_percentage?: { usd?: number };
        price_change_percentage_24h?: number;
        price_change_percentage_30d?: number;
        market_cap_rank?: number;
      };
    };

    const md = data.market_data;
    const athChange = md?.ath_change_percentage?.usd ?? null;
    const change30d = md?.price_change_percentage_30d ?? null;

    let mvrvProxy = "MVRV no disponible en CoinGecko — proxy: distancia al ATH";
    if (athChange !== null) {
      if (athChange > -10) mvrvProxy += ` → cerca del ATH (${athChange.toFixed(1)}% del máximo)`;
      else if (athChange > -40)
        mvrvProxy += ` → zona intermedia (${athChange.toFixed(1)}% del ATH)`;
      else mvrvProxy += ` → lejos del ATH (${athChange.toFixed(1)}% del máximo, posible infravaloración relativa)`;
    }

    let holdersProxy =
      "Datos on-chain de holders en rojo no disponibles — proxy: cambio 30d";
    if (change30d !== null) {
      holdersProxy +=
        change30d < -15
          ? ` → caída fuerte 30d (${change30d.toFixed(1)}%), muchos compradores recientes probablemente en pérdida`
          : change30d > 15
            ? ` → rally 30d (+${change30d.toFixed(1)}%), mayoría de holders recientes en verde`
            : ` → movimiento moderado 30d (${change30d.toFixed(1)}%)`;
    }

    return {
      symbol: (data.symbol ?? coingeckoId).toUpperCase(),
      name: data.name ?? coingeckoId,
      price: md?.current_price?.usd ?? null,
      change24h: md?.price_change_percentage_24h ?? null,
      athChangePct: athChange,
      change30dPct: change30d,
      marketCapRank: md?.market_cap_rank ?? null,
      dominanceNote: md?.market_cap_rank
        ? `Ranking market cap global: #${md.market_cap_rank} (proxy de concentración — top 10 wallets no disponible en API gratuita)`
        : "Concentración top-10 no disponible en API gratuita",
      mvrvProxy,
      holdersUnderWaterProxy: holdersProxy,
    };
  } catch {
    return null;
  }
}

export async function fetchOnChainMetrics(
  apiKey: string | undefined,
  cryptoList: { id: string; symbol: string; name: string }[],
): Promise<OnChainSnapshot[]> {
  if (cryptoList.length === 0) return [];

  const results = await Promise.all(
    cryptoList.map(async (coin) => {
      const detail = await fetchCoinDetail(coin.id, apiKey);
      if (detail) return detail;
      return {
        symbol: coin.symbol,
        name: coin.name,
        price: null,
        change24h: null,
        athChangePct: null,
        change30dPct: null,
        marketCapRank: null,
        dominanceNote: "Datos on-chain no disponibles",
        mvrvProxy: "Sin datos",
        holdersUnderWaterProxy: "Sin datos",
      };
    }),
  );

  return results;
}

export function formatOnChainMetrics(snapshots: OnChainSnapshot[]): string {
  if (snapshots.length === 0) {
    return "Usuario sin cripto en cartera — capa on-chain no aplica.";
  }

  return snapshots
    .map(
      (s) =>
        [
          `${s.name} (${s.symbol}):`,
          `  Precio: ${s.price ?? "sin dato"} USD | 24h: ${s.change24h !== null ? `${s.change24h.toFixed(2)}%` : "sin dato"}`,
          `  ${s.mvrvProxy}`,
          `  ${s.holdersUnderWaterProxy}`,
          `  ${s.dominanceNote}`,
        ].join("\n"),
    )
    .join("\n\n");
}
