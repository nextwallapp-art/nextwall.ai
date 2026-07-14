import type { Locale } from "@/lib/i18n/translations";
import { getAssetKnowledge } from "@/lib/assetKnowledge";
import { getDemoWhatsHappening } from "@/lib/demoWhatsHappening";
import { formatLargeUsd, formatPercent, formatPrice } from "@/lib/formatMarket";
import type { AssetDetail, AssetDetailMetric } from "@/lib/marketTypes";
import { getDemoMarketData, getMicroInsight } from "@/lib/demoData";

const demoFinancialsEn: Record<
  string,
  {
    marketCap: number;
    revenue: number | null;
    netIncome: number | null;
    peRatio: number | null;
    high52w: number | null;
    low52w: number | null;
    industry: string | null;
    exchange: string | null;
    volume?: number | null;
    rank?: number | null;
  }
> = {
  AAPL: {
    marketCap: 3_350_000_000_000,
    revenue: 391_000_000_000,
    netIncome: 97_000_000_000,
    peRatio: 28.4,
    high52w: 220.2,
    low52w: 164.1,
    industry: "Technology",
    exchange: "NASDAQ",
  },
  NVDA: {
    marketCap: 3_100_000_000_000,
    revenue: 96_000_000_000,
    netIncome: 53_000_000_000,
    peRatio: 62.1,
    high52w: 140.8,
    low52w: 78.2,
    industry: "Semiconductors",
    exchange: "NASDAQ",
  },
  TSLA: {
    marketCap: 790_000_000_000,
    revenue: 97_000_000_000,
    netIncome: 7_100_000_000,
    peRatio: 58.3,
    high52w: 278.4,
    low52w: 138.8,
    industry: "Automotive",
    exchange: "NASDAQ",
  },
  SPY: {
    marketCap: 540_000_000_000,
    revenue: null,
    netIncome: null,
    peRatio: null,
    high52w: 562.4,
    low52w: 410.2,
    industry: "ETF · S&P 500",
    exchange: "NYSE Arca",
  },
  QQQ: {
    marketCap: 310_000_000_000,
    revenue: null,
    netIncome: null,
    peRatio: null,
    high52w: 495.2,
    low52w: 342.8,
    industry: "ETF · Nasdaq-100",
    exchange: "NASDAQ",
  },
  GLD: {
    marketCap: 68_000_000_000,
    revenue: null,
    netIncome: null,
    peRatio: null,
    high52w: 245.3,
    low52w: 183.6,
    industry: "Commodity ETF · Gold",
    exchange: "NYSE Arca",
  },
  BTC: {
    marketCap: 1_320_000_000_000,
    revenue: null,
    netIncome: null,
    peRatio: null,
    high52w: null,
    low52w: null,
    industry: null,
    exchange: null,
    volume: 28_000_000_000,
    rank: 1,
  },
  ETH: {
    marketCap: 410_000_000_000,
    revenue: null,
    netIncome: null,
    peRatio: null,
    high52w: null,
    low52w: null,
    industry: null,
    exchange: null,
    volume: 12_000_000_000,
    rank: 2,
  },
  SOL: {
    marketCap: 68_000_000_000,
    revenue: null,
    netIncome: null,
    peRatio: null,
    high52w: null,
    low52w: null,
    industry: null,
    exchange: null,
    volume: 3_200_000_000,
    rank: 5,
  },
};

const demoFinancialsEs: Record<string, (typeof demoFinancialsEn)[string]> = {
  ...demoFinancialsEn,
  SPY: { ...demoFinancialsEn.SPY, industry: "ETF · S&P 500", exchange: "NYSE Arca" },
};

function findDemoPrice(
  locale: Locale,
  symbol: string,
  type: "stock" | "crypto",
): { price: number | null; changePercent: number | null; name: string } {
  const data = getDemoMarketData(locale);
  if (type === "stock") {
    const stock = data.stocks.find((s) => s.symbol === symbol);
    return {
      price: stock?.price ?? null,
      changePercent: stock?.changePercent ?? null,
      name: stock?.name ?? symbol,
    };
  }
  const crypto = data.crypto.find((c) => c.symbol === symbol);
  return {
    price: crypto?.price ?? null,
    changePercent: crypto?.change24h ?? null,
    name: crypto?.name ?? symbol,
  };
}

export function getDemoAssetDetail(
  locale: Locale,
  type: "stock" | "crypto",
  symbol: string,
): AssetDetail {
  const numberLocale = locale === "es" ? "es-ES" : "en-US";
  const labels =
    locale === "es"
      ? {
          marketCap: "Capitalización",
          revenue: "Ingresos anuales",
          netIncome: "Beneficio neto",
          peRatio: "PER",
          range52w: "Rango 52 semanas",
          industry: "Sector",
          exchange: "Bolsa",
          volume24h: "Volumen 24h",
          rank: "Ranking mercado",
        }
      : {
          marketCap: "Market cap",
          revenue: "Annual revenue",
          netIncome: "Net income",
          peRatio: "P/E ratio",
          range52w: "52-week range",
          industry: "Industry",
          exchange: "Exchange",
          volume24h: "24h volume",
          rank: "Market rank",
        };

  const priceData = findDemoPrice(locale, symbol, type);
  const fin =
    (locale === "es" ? demoFinancialsEs : demoFinancialsEn)[symbol] ??
    demoFinancialsEn[symbol];
  const knowledge = getAssetKnowledge(symbol, locale);
  const analysis = getDemoMarketData(locale).analysis;
  const microInsight = getMicroInsight(analysis, symbol);

  const metrics: AssetDetailMetric[] = [];

  if (fin) {
    const marketCap = formatLargeUsd(fin.marketCap, numberLocale);
    if (marketCap) metrics.push({ label: labels.marketCap, value: marketCap });

    const revenue = formatLargeUsd(fin.revenue, numberLocale);
    if (revenue) metrics.push({ label: labels.revenue, value: revenue });

    const netIncome = formatLargeUsd(fin.netIncome, numberLocale);
    if (netIncome) metrics.push({ label: labels.netIncome, value: netIncome });

    if (fin.peRatio !== null) {
      metrics.push({
        label: labels.peRatio,
        value: fin.peRatio.toLocaleString(numberLocale, {
          maximumFractionDigits: 1,
        }),
      });
    }

    if (fin.high52w !== null && fin.low52w !== null) {
      const high = formatPrice(fin.high52w, numberLocale);
      const low = formatPrice(fin.low52w, numberLocale);
      if (high && low) {
        metrics.push({ label: labels.range52w, value: `${low} – ${high}` });
      }
    }

    const volume = formatLargeUsd(fin.volume ?? null, numberLocale);
    if (volume) metrics.push({ label: labels.volume24h, value: volume });

    if (fin.rank) {
      metrics.push({ label: labels.rank, value: `#${fin.rank}` });
    }

    if (fin.industry) {
      metrics.push({ label: labels.industry, value: fin.industry });
    }

    if (fin.exchange) {
      metrics.push({ label: labels.exchange, value: fin.exchange });
    }
  }

  return {
    symbol,
    name: priceData.name,
    type,
    price: priceData.price,
    changePercent: priceData.changePercent,
    marketCap: fin?.marketCap ?? null,
    revenue: fin?.revenue ?? null,
    netIncome: fin?.netIncome ?? null,
    peRatio: fin?.peRatio ?? null,
    industry: fin?.industry ?? null,
    exchange: fin?.exchange ?? null,
    topProduct: knowledge?.topProduct ?? null,
    revenueDrivers: knowledge?.revenueDrivers ?? [],
    description: knowledge?.description ?? null,
    metrics,
    microInsight,
    whatsHappening: getDemoWhatsHappening(symbol, locale),
  };
}
