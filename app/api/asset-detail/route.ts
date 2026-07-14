import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getAssetKnowledge } from "@/lib/assetKnowledge";
import {
  formatLargeUsd,
  formatPercent,
  formatPrice,
} from "@/lib/formatMarket";
import type { AssetDetail, AssetDetailMetric } from "@/lib/marketTypes";
import { COINGECKO_ID_BY_SYMBOL } from "@/lib/profileAssets";
import { checkRateLimit } from "@/lib/rateLimit";
import { getStripe } from "@/lib/stripe";
import {
  hasActiveSubscription,
  resolveStripeCustomerId,
} from "@/lib/subscription";
import type { Locale } from "@/lib/i18n/translations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseLocale(value: string | null): Locale {
  return value === "en" ? "en" : "es";
}

async function fetchStockQuote(
  token: string,
  symbol: string,
): Promise<{
  price: number | null;
  changePercent: number | null;
}> {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { price: null, changePercent: null };

  const quote = (await res.json()) as {
    c?: number;
    dp?: number;
    pc?: number;
  };
  const price =
    typeof quote.c === "number" && quote.c !== 0
      ? quote.c
      : typeof quote.pc === "number" && quote.pc !== 0
        ? quote.pc
        : null;

  return {
    price,
    changePercent: typeof quote.dp === "number" ? quote.dp : null,
  };
}

async function fetchStockProfile(
  token: string,
  symbol: string,
): Promise<{
  name: string | null;
  marketCap: number | null;
  industry: string | null;
  exchange: string | null;
}> {
  const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${token}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return { name: null, marketCap: null, industry: null, exchange: null };
  }

  const profile = (await res.json()) as {
    name?: string;
    marketCapitalization?: number;
    finnhubIndustry?: string;
    exchange?: string;
  };

  return {
    name: profile.name ?? null,
    marketCap:
      typeof profile.marketCapitalization === "number"
        ? profile.marketCapitalization * 1_000_000
        : null,
    industry: profile.finnhubIndustry ?? null,
    exchange: profile.exchange ?? null,
  };
}

async function fetchStockMetrics(
  token: string,
  symbol: string,
): Promise<{
  peRatio: number | null;
  revenue: number | null;
  netIncome: number | null;
  high52w: number | null;
  low52w: number | null;
}> {
  const url = `https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${token}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return {
      peRatio: null,
      revenue: null,
      netIncome: null,
      high52w: null,
      low52w: null,
    };
  }

  const payload = (await res.json()) as {
    metric?: {
      peBasic?: number;
      revenuePerShareTTM?: number;
      epsTTM?: number;
      "52WeekHigh"?: number;
      "52WeekLow"?: number;
      marketCapitalization?: number;
    };
    series?: {
      annual?: {
        revenue?: Array<{ period: string; v: number }>;
        netIncome?: Array<{ period: string; v: number }>;
      };
    };
  };

  const latestRevenue = payload.series?.annual?.revenue?.at(-1)?.v ?? null;
  const latestNetIncome = payload.series?.annual?.netIncome?.at(-1)?.v ?? null;

  return {
    peRatio:
      typeof payload.metric?.peBasic === "number"
        ? payload.metric.peBasic
        : null,
    revenue: typeof latestRevenue === "number" ? latestRevenue : null,
    netIncome: typeof latestNetIncome === "number" ? latestNetIncome : null,
    high52w:
      typeof payload.metric?.["52WeekHigh"] === "number"
        ? payload.metric["52WeekHigh"]
        : null,
    low52w:
      typeof payload.metric?.["52WeekLow"] === "number"
        ? payload.metric["52WeekLow"]
        : null,
  };
}

async function fetchCryptoDetail(
  apiKey: string | undefined,
  coingeckoId: string,
  locale: Locale,
): Promise<{
  name: string | null;
  price: number | null;
  changePercent: number | null;
  marketCap: number | null;
  volume: number | null;
  rank: number | null;
  description: string | null;
}> {
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coingeckoId)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers["x-cg-demo-api-key"] = apiKey;

  const res = await fetch(url, { cache: "no-store", headers });
  if (!res.ok) {
    return {
      name: null,
      price: null,
      changePercent: null,
      marketCap: null,
      volume: null,
      rank: null,
      description: null,
    };
  }

  const payload = (await res.json()) as {
    name?: string;
    market_data?: {
      current_price?: { usd?: number };
      market_cap?: { usd?: number };
      total_volume?: { usd?: number };
      price_change_percentage_24h?: number;
      market_cap_rank?: number;
    };
    description?: { en?: string; es?: string };
  };

  const description =
    locale === "es"
      ? (payload.description?.es ?? payload.description?.en ?? null)
      : (payload.description?.en ?? null);

  return {
    name: payload.name ?? null,
    price: payload.market_data?.current_price?.usd ?? null,
    changePercent: payload.market_data?.price_change_percentage_24h ?? null,
    marketCap: payload.market_data?.market_cap?.usd ?? null,
    volume: payload.market_data?.total_volume?.usd ?? null,
    rank: payload.market_data?.market_cap_rank ?? null,
    description: description
      ? description.replace(/<[^>]+>/g, "").slice(0, 420)
      : null,
  };
}

function buildStockDetail(
  symbol: string,
  name: string,
  locale: Locale,
  quote: { price: number | null; changePercent: number | null },
  profile: {
    name: string | null;
    marketCap: number | null;
    industry: string | null;
    exchange: string | null;
  },
  metrics: {
    peRatio: number | null;
    revenue: number | null;
    netIncome: number | null;
    high52w: number | null;
    low52w: number | null;
  },
  labels: Record<string, string>,
): AssetDetail {
  const numberLocale = locale === "es" ? "es-ES" : "en-US";
  const knowledge = getAssetKnowledge(symbol, locale);
  const metricsList: AssetDetailMetric[] = [];

  const marketCap = formatLargeUsd(profile.marketCap, numberLocale);
  if (marketCap) {
    metricsList.push({ label: labels.marketCap, value: marketCap });
  }

  const revenue = formatLargeUsd(metrics.revenue, numberLocale);
  if (revenue) {
    metricsList.push({ label: labels.revenue, value: revenue });
  }

  const netIncome = formatLargeUsd(metrics.netIncome, numberLocale);
  if (netIncome) {
    metricsList.push({ label: labels.netIncome, value: netIncome });
  }

  if (metrics.peRatio !== null) {
    metricsList.push({
      label: labels.peRatio,
      value: metrics.peRatio.toLocaleString(numberLocale, {
        maximumFractionDigits: 1,
      }),
    });
  }

  if (metrics.high52w !== null && metrics.low52w !== null) {
    const high = formatPrice(metrics.high52w, numberLocale);
    const low = formatPrice(metrics.low52w, numberLocale);
    if (high && low) {
      metricsList.push({
        label: labels.range52w,
        value: `${low} – ${high}`,
      });
    }
  }

  if (profile.industry) {
    metricsList.push({ label: labels.industry, value: profile.industry });
  }

  if (profile.exchange) {
    metricsList.push({ label: labels.exchange, value: profile.exchange });
  }

  return {
    symbol,
    name: profile.name ?? name,
    type: "stock",
    price: quote.price,
    changePercent: quote.changePercent,
    marketCap: profile.marketCap,
    revenue: metrics.revenue,
    netIncome: metrics.netIncome,
    peRatio: metrics.peRatio,
    industry: profile.industry,
    exchange: profile.exchange,
    topProduct: knowledge?.topProduct ?? null,
    revenueDrivers: knowledge?.revenueDrivers ?? [],
    description: knowledge?.description ?? null,
    metrics: metricsList,
    microInsight: null,
  };
}

function buildCryptoDetail(
  symbol: string,
  name: string,
  locale: Locale,
  data: Awaited<ReturnType<typeof fetchCryptoDetail>>,
  labels: Record<string, string>,
): AssetDetail {
  const numberLocale = locale === "es" ? "es-ES" : "en-US";
  const knowledge = getAssetKnowledge(symbol, locale);
  const metricsList: AssetDetailMetric[] = [];

  const marketCap = formatLargeUsd(data.marketCap, numberLocale);
  if (marketCap) {
    metricsList.push({ label: labels.marketCap, value: marketCap });
  }

  const volume = formatLargeUsd(data.volume, numberLocale);
  if (volume) {
    metricsList.push({ label: labels.volume24h, value: volume });
  }

  if (data.rank !== null) {
    metricsList.push({
      label: labels.rank,
      value: `#${data.rank}`,
    });
  }

  return {
    symbol,
    name: data.name ?? name,
    type: "crypto",
    price: data.price,
    changePercent: data.changePercent,
    marketCap: data.marketCap,
    revenue: null,
    netIncome: null,
    peRatio: null,
    industry: null,
    exchange: null,
    topProduct: knowledge?.topProduct ?? null,
    revenueDrivers: knowledge?.revenueDrivers ?? [],
    description: data.description ?? knowledge?.description ?? null,
    metrics: metricsList,
    microInsight: null,
  };
}

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const finnhubKey = process.env.FINNHUB_API_KEY?.trim();
  const coingeckoKey = process.env.COINGECKO_API_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Server misconfigured: missing Supabase env vars" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const symbol = searchParams.get("symbol")?.trim().toUpperCase();
  const name = searchParams.get("name")?.trim() ?? symbol ?? "";
  const coingeckoId =
    searchParams.get("coingeckoId")?.trim() ??
    (symbol ? COINGECKO_ID_BY_SYMBOL[symbol] : undefined);
  const locale = parseLocale(searchParams.get("locale"));

  if (!type || !symbol || (type !== "stock" && type !== "crypto")) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

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

  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`asset-detail:${user.id}`, 30);
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Demasiadas peticiones, espera un momento" },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        },
      );
    }

    const stripe = getStripe();
    const stripeCustomerId = await resolveStripeCustomerId(
      stripe,
      supabaseUrl,
      supabaseAnonKey,
      token,
      user.id,
      user.email ?? undefined,
    );

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "Suscripción requerida", redirect: "/payment" },
        { status: 403 },
      );
    }

    const subscribed = await hasActiveSubscription(stripeCustomerId, stripe);
    if (!subscribed) {
      return NextResponse.json(
        { error: "Suscripción requerida", redirect: "/payment" },
        { status: 403 },
      );
    }

    if (type === "stock") {
      if (!finnhubKey) {
        return NextResponse.json(
          { error: "Datos no disponibles" },
          { status: 503 },
        );
      }

      const [quote, profile, metrics] = await Promise.all([
        fetchStockQuote(finnhubKey, symbol),
        fetchStockProfile(finnhubKey, symbol),
        fetchStockMetrics(finnhubKey, symbol),
      ]);

      const detail = buildStockDetail(
        symbol,
        name,
        locale,
        quote,
        profile,
        metrics,
        labels,
      );

      return NextResponse.json(detail);
    }

    if (!coingeckoId) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    const cryptoData = await fetchCryptoDetail(coingeckoKey, coingeckoId, locale);
    const detail = buildCryptoDetail(symbol, name, locale, cryptoData, labels);

    return NextResponse.json(detail);
  } catch (error) {
    console.error("[asset-detail] error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los detalles" },
      { status: 500 },
    );
  }
}
