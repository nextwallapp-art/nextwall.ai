import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { getStripe } from "@/lib/stripe";
import {
  hasActiveSubscription,
  resolveStripeCustomerId,
} from "@/lib/subscription";
import type { StructuredAnalysis } from "@/lib/marketAnalysis";
import {
  buildClaudeSystemPrompt,
  parseAnalysisJson,
  type AnalysisContext,
} from "@/lib/marketAnalysisPrompt";
import { fetchAnalystConsensus } from "@/lib/marketData/analystConsensus";
import { fetchFedCalendarEvents } from "@/lib/marketData/fedCalendar";
import { fetchGdeltEvents, formatGdeltEvents } from "@/lib/marketData/gdelt";
import {
  fetchOnChainMetrics,
  formatOnChainMetrics,
} from "@/lib/marketData/onchain";
import {
  fetchTechnicalAnalysis,
  formatTechnicalAnalysis,
} from "@/lib/marketData/technical";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Types ────────────────────────────────────────────────────────────────────

type Stock = {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
};

type Crypto = {
  symbol: string;
  name: string;
  price: number | null;
  change24h: number | null;
};

type Macro = {
  id: string;
  name: string;
  value: number | null;
  unit: string;
  date: string | null;
};

type FredObservation = {
  value: number;
  date: string;
};

type FredSeriesHistory = {
  seriesId: string;
  name: string;
  unit: string;
  observations: FredObservation[];
};

type UserProfile = {
  experience_level: string | null;
  selected_assets: {
    crypto?: string[];
    stocks?: string[];
    etfs?: string[];
    metals?: string[];
  } | null;
  free_text: string | null;
  last_onboarding_date: string | null;
  created_at: string | null;
};

// ── Default asset lists (used when no profile or empty selection) ─────────────

const DEFAULT_STOCKS: { symbol: string; name: string }[] = [
  { symbol: "SPY", name: "S&P 500" },
  { symbol: "QQQ", name: "Nasdaq" },
  { symbol: "AAPL", name: "Apple" },
  { symbol: "NVDA", name: "Nvidia" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "GLD", name: "Oro" },
  { symbol: "SLV", name: "Plata" },
];

const DEFAULT_CRYPTO: { id: string; symbol: string; name: string }[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
];

// ── Asset name → API symbol maps ──────────────────────────────────────────────

const STOCK_BY_NAME: Record<string, { symbol: string; name: string }> = {
  Apple: { symbol: "AAPL", name: "Apple" },
  Nvidia: { symbol: "NVDA", name: "Nvidia" },
  Tesla: { symbol: "TSLA", name: "Tesla" },
  Amazon: { symbol: "AMZN", name: "Amazon" },
  Microsoft: { symbol: "MSFT", name: "Microsoft" },
  Google: { symbol: "GOOGL", name: "Google" },
  "S&P 500 (SPY)": { symbol: "SPY", name: "S&P 500" },
  "Nasdaq (QQQ)": { symbol: "QQQ", name: "Nasdaq" },
  "MSCI World": { symbol: "URTH", name: "MSCI World" },
  "S&P Europe 350": { symbol: "IEV", name: "S&P Europe 350" },
  Oro: { symbol: "GLD", name: "Oro" },
  Plata: { symbol: "SLV", name: "Plata" },
  Platino: { symbol: "PPLT", name: "Platino" },
};

const CRYPTO_BY_NAME: Record<
  string,
  { id: string; symbol: string; name: string }
> = {
  Bitcoin: { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  Ethereum: { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  Solana: { id: "solana", symbol: "SOL", name: "Solana" },
  BNB: { id: "binancecoin", symbol: "BNB", name: "BNB" },
  XRP: { id: "ripple", symbol: "XRP", name: "XRP" },
};

// ── Build filtered asset lists from profile ───────────────────────────────────

const BENCHMARK_STOCKS: { symbol: string; name: string }[] = [
  { symbol: "SPY", name: "S&P 500" },
  { symbol: "QQQ", name: "Nasdaq" },
  { symbol: "GLD", name: "Oro" },
  { symbol: "SLV", name: "Plata" },
];

const BENCHMARK_CRYPTO: { id: string; symbol: string; name: string }[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
];

function mergeUniqueStocks(
  lists: { symbol: string; name: string }[][],
): { symbol: string; name: string }[] {
  const seen = new Set<string>();
  const out: { symbol: string; name: string }[] = [];
  for (const list of lists) {
    for (const item of list) {
      if (!seen.has(item.symbol)) {
        seen.add(item.symbol);
        out.push(item);
      }
    }
  }
  return out;
}

function mergeUniqueCrypto(
  lists: { id: string; symbol: string; name: string }[][],
): { id: string; symbol: string; name: string }[] {
  const seen = new Set<string>();
  const out: { id: string; symbol: string; name: string }[] = [];
  for (const list of lists) {
    for (const item of list) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        out.push(item);
      }
    }
  }
  return out;
}

function buildStockList(
  profile: UserProfile | null,
): { symbol: string; name: string }[] {
  if (!profile?.selected_assets) return DEFAULT_STOCKS;
  const { stocks = [], etfs = [], metals = [] } = profile.selected_assets;
  const names = [...stocks, ...etfs, ...metals];
  const userMapped = names.map((n) => STOCK_BY_NAME[n]).filter(Boolean);
  return mergeUniqueStocks([BENCHMARK_STOCKS, userMapped]);
}

function buildCryptoList(
  profile: UserProfile | null,
): { id: string; symbol: string; name: string }[] {
  if (!profile?.selected_assets) return DEFAULT_CRYPTO;
  const names = profile.selected_assets.crypto ?? [];
  const userMapped = names.map((n) => CRYPTO_BY_NAME[n]).filter(Boolean);
  if (userMapped.length === 0) return BENCHMARK_CRYPTO;
  return mergeUniqueCrypto([BENCHMARK_CRYPTO, userMapped]);
}

// ── Macro series (always fetched) ─────────────────────────────────────────────

const MACRO_SERIES: { id: string; name: string; unit: string }[] = [
  { id: "FEDFUNDS", name: "Tipos Fed", unit: "%" },
  { id: "CPIAUCSL", name: "Inflación CPI", unit: "índice" },
  { id: "UNRATE", name: "Desempleo", unit: "%" },
  { id: "DGS10", name: "Bono 10 años", unit: "%" },
  { id: "DCOILWTICO", name: "Petróleo (WTI)", unit: "$" },
  { id: "UMCSENT", name: "Confianza consumidor", unit: "índice" },
];

// ── Fetch helpers ─────────────────────────────────────────────────────────────

type SourceFetchResult<T> = {
  data: T;
  failed: boolean;
};

function emptyStock(
  stocks: { symbol: string; name: string }[],
): Stock[] {
  return stocks.map((s) => ({
    ...s,
    price: null,
    change: null,
    changePercent: null,
  }));
}

async function fetchStocks(
  token: string | undefined,
  stocks: { symbol: string; name: string }[],
): Promise<SourceFetchResult<Stock[]>> {
  if (stocks.length === 0) {
    return { data: [], failed: false };
  }

  if (!token) {
    console.warn("[market-analysis] FINNHUB_API_KEY missing");
    return { data: emptyStock(stocks), failed: true };
  }

  console.log(
    "[market-analysis] fetchStocks →",
    stocks.map((s) => s.symbol).join(", "),
  );

  const data = await Promise.all(
    stocks.map(async ({ symbol, name }) => {
      try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          console.error(`[market-analysis] Finnhub ${symbol} HTTP ${res.status}`);
          return { symbol, name, price: null, change: null, changePercent: null };
        }
        const quote = (await res.json()) as {
          c?: number;
          d?: number;
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
          symbol,
          name,
          price,
          change: typeof quote.d === "number" ? quote.d : null,
          changePercent: typeof quote.dp === "number" ? quote.dp : null,
        };
      } catch (err) {
        console.error(`[market-analysis] Finnhub ${symbol} error:`, err);
        return { symbol, name, price: null, change: null, changePercent: null };
      }
    }),
  );

  const failed = data.every((stock) => stock.price === null);
  return { data, failed };
}

async function fetchCrypto(
  apiKey: string | undefined,
  cryptoList: { id: string; symbol: string; name: string }[],
): Promise<SourceFetchResult<Crypto[]>> {
  if (cryptoList.length === 0) {
    return { data: [], failed: false };
  }

  const empty = cryptoList.map((c) => ({
    symbol: c.symbol,
    name: c.name,
    price: null,
    change24h: null,
  }));

  const ids = cryptoList.map((c) => c.id).join(",");
  console.log("[market-analysis] fetchCrypto →", ids, "| hasKey:", !!apiKey);

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (apiKey) headers["x-cg-demo-api-key"] = apiKey;

    const res = await fetch(url, { cache: "no-store", headers });
    if (!res.ok) {
      console.error(
        "[market-analysis] CoinGecko HTTP",
        res.status,
        await res.text().catch(() => ""),
      );
      return { data: empty, failed: true };
    }

    const payload = (await res.json()) as Record<
      string,
      { usd?: number; usd_24h_change?: number }
    >;

    const data = cryptoList.map((c) => {
      const entry = payload[c.id];
      return {
        symbol: c.symbol,
        name: c.name,
        price: typeof entry?.usd === "number" ? entry.usd : null,
        change24h:
          typeof entry?.usd_24h_change === "number"
            ? entry.usd_24h_change
            : null,
      };
    });

    const failed = data.every((item) => item.price === null);
    return { data, failed };
  } catch (err) {
    console.error("[market-analysis] CoinGecko error:", err);
    return { data: empty, failed: true };
  }
}

async function fetchFredSeriesTwelveMonths(
  apiKey: string,
  seriesId: string,
): Promise<FredObservation[]> {
  const start = new Date();
  start.setMonth(start.getMonth() - 12);
  const observation_start = start.toISOString().slice(0, 10);

  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${seriesId}&api_key=${apiKey}` +
    `&observation_start=${observation_start}&sort_order=asc&file_type=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`FRED ${seriesId} HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    observations?: { date: string; value: string }[];
  };

  return (data.observations ?? [])
    .map((obs) => {
      const value = Number(obs.value);
      if (!Number.isFinite(value)) return null;
      return { value, date: obs.date };
    })
    .filter((obs): obs is FredObservation => obs !== null);
}

function sampleMonthlyObservations(
  observations: FredObservation[],
): FredObservation[] {
  const byMonth = new Map<string, FredObservation>();
  for (const obs of observations) {
    byMonth.set(obs.date.slice(0, 7), obs);
  }
  return Array.from(byMonth.values());
}

async function fetchFredTwelveMonthHistory(
  apiKey: string | undefined,
): Promise<FredSeriesHistory[]> {
  if (!apiKey) return [];

  const results = await Promise.all(
    MACRO_SERIES.map(async (series) => {
      try {
        const raw = await fetchFredSeriesTwelveMonths(apiKey, series.id);
        const observations =
          series.id === "DGS10" || raw.length > 15
            ? sampleMonthlyObservations(raw)
            : raw;
        return {
          seriesId: series.id,
          name: series.name,
          unit: series.unit,
          observations,
        };
      } catch (err) {
        console.error(
          `[market-analysis] FRED 12mo ${series.id} error:`,
          err,
        );
        return {
          seriesId: series.id,
          name: series.name,
          unit: series.unit,
          observations: [],
        };
      }
    }),
  );

  return results;
}

function formatUnit(value: number, unit: string): string {
  if (unit === "$") return `${value} USD`;
  if (unit === "%") return `${value}%`;
  return `${value}`;
}

function formatFredTwelveMonthComparison(histories: FredSeriesHistory[]): string {
  if (histories.length === 0) {
    return "Datos históricos FRED no disponibles.";
  }

  const lines: string[] = [];

  for (const series of histories) {
    lines.push(`${series.name} (${series.seriesId}):`);

    if (series.observations.length === 0) {
      lines.push("- Sin datos en los últimos 12 meses");
      lines.push("");
      continue;
    }

    const first = series.observations[0];
    const last = series.observations[series.observations.length - 1];
    lines.push(
      `- Hace ~12 meses (${first.date}): ${formatUnit(first.value, series.unit)}`,
    );
    lines.push(
      `- Actual (${last.date}): ${formatUnit(last.value, series.unit)}`,
    );

    const delta = last.value - first.value;
    if (series.unit === "%") {
      lines.push(
        `- Cambio en 12 meses: ${delta > 0 ? "+" : ""}${delta.toFixed(2)} pp`,
      );
    } else if (first.value !== 0) {
      const pct = ((delta / first.value) * 100).toFixed(2);
      lines.push(
        `- Cambio en 12 meses: ${delta > 0 ? "+" : ""}${delta.toFixed(2)} (${pct}%)`,
      );
    }

    lines.push("- Evolución mensual:");
    for (const obs of series.observations) {
      lines.push(`  · ${obs.date}: ${formatUnit(obs.value, series.unit)}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

async function fetchMacro(
  apiKey: string | undefined,
): Promise<SourceFetchResult<Macro[]>> {
  const empty = MACRO_SERIES.map((s) => ({
    id: s.id,
    name: s.name,
    value: null,
    unit: s.unit,
    date: null,
  }));

  if (!apiKey) {
    console.warn("[market-analysis] FRED_API_KEY missing — returning nulls");
    return { data: empty, failed: true };
  }

  const data = await Promise.all(
    MACRO_SERIES.map(async (series) => {
      try {
        const url =
          `https://api.stlouisfed.org/fred/series/observations` +
          `?series_id=${series.id}&api_key=${apiKey}&limit=1&sort_order=desc&file_type=json`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          console.error(
            `[market-analysis] FRED ${series.id} HTTP ${res.status}`,
          );
          return {
            id: series.id,
            name: series.name,
            value: null,
            unit: series.unit,
            date: null,
          };
        }
        const payload = (await res.json()) as {
          observations?: { date: string; value: string }[];
        };
        const obs = payload.observations?.[0];
        const value = obs ? Number(obs.value) : NaN;
        return {
          id: series.id,
          name: series.name,
          value: Number.isFinite(value) ? value : null,
          unit: series.unit,
          date: obs?.date ?? null,
        };
      } catch (err) {
        console.error(`[market-analysis] FRED ${series.id} error:`, err);
        return {
          id: series.id,
          name: series.name,
          value: null,
          unit: series.unit,
          date: null,
        };
      }
    }),
  );

  const failed = data.every((item) => item.value === null);
  return { data, failed };
}

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) return null;

    const { data, error } = await admin
      .from("user_profiles")
      .select(
        "experience_level, selected_assets, free_text, last_onboarding_date, created_at",
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[market-analysis] Profile fetch error:", error.message);
      return null;
    }
    return (data as UserProfile) ?? null;
  } catch (err) {
    console.error("[market-analysis] Profile fetch exception:", err);
    return null;
  }
}

// ── Claude structured analysis ────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

function formatSelectedAssets(profile: UserProfile | null): string {
  if (!profile?.selected_assets) return "activos generales";
  const allAssets = [
    ...(profile.selected_assets.crypto ?? []),
    ...(profile.selected_assets.stocks ?? []),
    ...(profile.selected_assets.etfs ?? []),
    ...(profile.selected_assets.metals ?? []),
  ];
  return allAssets.length > 0 ? allAssets.join(", ") : "activos generales";
}

function formatSelectedAssetNames(profile: UserProfile | null): string[] {
  if (!profile?.selected_assets) return [];
  return [
    ...(profile.selected_assets.crypto ?? []),
    ...(profile.selected_assets.stocks ?? []),
    ...(profile.selected_assets.etfs ?? []),
    ...(profile.selected_assets.metals ?? []),
  ];
}

function formatAssetPricesToday(
  stocks: Stock[],
  crypto: Crypto[],
  macro: Macro[],
): string {
  const stockLines = stocks
    .map(
      (s) =>
        `- ${s.name} (${s.symbol}): ${s.price !== null ? `$${s.price}` : "sin dato"}${
          s.changePercent !== null
            ? ` (${s.changePercent > 0 ? "+" : ""}${s.changePercent.toFixed(2)}% hoy)`
            : ""
        }`,
    )
    .join("\n");

  const cryptoLines = crypto
    .map(
      (c) =>
        `- ${c.name} (${c.symbol}): ${c.price !== null ? `$${c.price}` : "sin dato"}${
          c.change24h !== null
            ? ` (${c.change24h > 0 ? "+" : ""}${c.change24h.toFixed(2)}% 24h)`
            : ""
        }`,
    )
    .join("\n");

  const macroLines = macro
    .map(
      (m) =>
        `- ${m.name}: ${
          m.value !== null
            ? `${m.value}${m.unit === "$" ? " USD" : m.unit === "%" ? "%" : ""}`
            : "sin dato"
        } (${m.date ?? "reciente"})`,
    )
    .join("\n");

  return [
    stocks.length > 0 ? `Acciones/ETFs/metales:\n${stockLines}` : null,
    crypto.length > 0 ? `Crypto:\n${cryptoLines}` : null,
    `Macro FRED (actualidad):\n${macroLines}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n\n");
}

async function compileAnalysisContext(
  profile: UserProfile | null,
  stocks: Stock[],
  crypto: Crypto[],
  macro: Macro[],
  fredHistory: FredSeriesHistory[],
  finnhubKey: string | undefined,
  coingeckoKey: string | undefined,
  cryptoList: { id: string; symbol: string; name: string }[],
): Promise<AnalysisContext> {
  const assetNames = formatSelectedAssetNames(profile);
  const gdeltNames =
    assetNames.length > 0
      ? assetNames
      : [
          ...stocks.map((s) => s.name),
          ...crypto.map((c) => c.name),
        ];

  const technicalInput = stocks.map((s) => ({
    symbol: s.symbol,
    name: s.name,
    price: s.price,
    changePercent: s.changePercent,
  }));

  const [
    gdeltEvents,
    technical,
    onchain,
    fedCalendar,
    analystConsensus,
  ] = await Promise.all([
    fetchGdeltEvents(gdeltNames),
    fetchTechnicalAnalysis(finnhubKey, technicalInput),
    fetchOnChainMetrics(coingeckoKey, cryptoList),
    fetchFedCalendarEvents(
      finnhubKey,
      macro.map((m) => ({
        name: m.name,
        value: m.value,
        date: m.date,
      })),
    ),
    fetchAnalystConsensus(
      finnhubKey,
      stocks.map((s) => s.symbol),
    ),
  ]);

  return {
    gdelt_events_formatted: formatGdeltEvents(gdeltEvents),
    fed_calendar_events: fedCalendar,
    asset_prices_today: formatAssetPricesToday(stocks, crypto, macro),
    technical_analysis: formatTechnicalAnalysis(technical),
    onchain_metrics: formatOnChainMetrics(onchain),
    historical_context_12m: formatFredTwelveMonthComparison(fredHistory),
    analyst_consensus: analystConsensus,
  };
}

function deriveUserName(
  email: string | undefined,
  metadata: Record<string, unknown> | undefined,
): string {
  const fullName = metadata?.full_name ?? metadata?.name;
  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim().split(/\s+/)[0] ?? fullName.trim();
  }
  if (!email) return "Inversor";
  const local = email.split("@")[0] ?? "Inversor";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function deriveInvestmentTimeline(profile: UserProfile | null): string {
  if (profile?.last_onboarding_date) {
    return `Desde ${profile.last_onboarding_date.slice(0, 10)} (último onboarding)`;
  }
  if (profile?.created_at) {
    return `Perfil creado el ${profile.created_at.slice(0, 10)}`;
  }
  return "No especificado";
}

async function fetchStructuredAnalysis(
  userName: string,
  profile: UserProfile | null,
  ctx: AnalysisContext,
  apiKey: string,
): Promise<StructuredAnalysis> {
  const experienceLevel =
    LEVEL_LABELS[profile?.experience_level ?? ""] ??
    profile?.experience_level ??
    "Intermedio";
  const selectedAssets = formatSelectedAssets(profile);
  const freeText = profile?.free_text?.trim() || "sin contexto personal";
  const investmentTimeline = deriveInvestmentTimeline(profile);

  const client = new Anthropic({ apiKey });
  const system = buildClaudeSystemPrompt(
    userName,
    experienceLevel,
    selectedAssets,
    freeText,
    investmentTimeline,
    ctx,
  );
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      console.log(
        `[market-analysis] Calling Anthropic model (attempt ${attempt + 1})`,
      );

      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 8192,
        system,
        messages: [{ role: "user", content: "Devuelve el JSON." }],
      });

      const text = message.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("")
        .trim();

      const analysis = parseAnalysisJson(text);
      console.log("[market-analysis] Analysis JSON parsed successfully");
      return analysis;
    } catch (error) {
      lastError = error;
      console.warn(
        `[market-analysis] JSON parse failed (attempt ${attempt + 1}):`,
        error,
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("No se pudo parsear el análisis de Claude");
}

// ── Market open check ─────────────────────────────────────────────────────────

function isUsMarketOpen(): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const lookup = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekday = lookup("weekday");
  if (weekday === "Sat" || weekday === "Sun") return false;

  const hour = Number(lookup("hour"));
  const minute = Number(lookup("minute"));
  const minutes = hour * 60 + minute;

  return minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  console.log("[market-analysis] GET request received");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const finnhubKey = process.env.FINNHUB_API_KEY?.trim();
  const coingeckoKey = process.env.COINGECKO_API_KEY?.trim();
  const fredKey = process.env.FRED_API_KEY?.trim();

  console.log("[market-analysis] Env check:", {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey,
    finnhubKey: !!finnhubKey,
    coingeckoKey: !!coingeckoKey,
    fredKey: !!fredKey,
    anthropicKey: !!process.env.ANTHROPIC_API_KEY?.trim(),
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Server misconfigured: missing Supabase env vars" },
      { status: 500 },
    );
  }

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
      console.error(
        "[market-analysis] Auth error:",
        authError?.message ?? "no user",
      );
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    console.log("[market-analysis] Authenticated user:", user.id);

    const rateLimit = checkRateLimit(user.id);
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

    try {
      const subscribed = await hasActiveSubscription(stripeCustomerId, stripe);
      if (!subscribed) {
        return NextResponse.json(
          { error: "Suscripción requerida", redirect: "/payment" },
          { status: 403 },
        );
      }
    } catch (stripeError) {
      console.error("[market-analysis] Stripe verification error:", stripeError);
      return NextResponse.json(
        { error: "No se pudo verificar la suscripción" },
        { status: 500 },
      );
    }

    // Fetch user profile, macro snapshot, and 12-month FRED history in parallel
    const [profile, macroResult, fredHistory] = await Promise.all([
      fetchUserProfile(user.id),
      fetchMacro(fredKey),
      fetchFredTwelveMonthHistory(fredKey),
    ]);

    const macro = macroResult.data;
    const sourceErrors: ("finnhub" | "coingecko" | "fred")[] = [];
    if (macroResult.failed) sourceErrors.push("fred");

    console.log(
      "[market-analysis] Profile:",
      profile
        ? `level=${profile.experience_level}, assets=${JSON.stringify(profile.selected_assets)}`
        : "none (using defaults)",
    );

    const stocksToFetch = buildStockList(profile);
    const cryptoToFetch = buildCryptoList(profile);

    const [stocksResult, cryptoResult] = await Promise.all([
      fetchStocks(finnhubKey, stocksToFetch),
      fetchCrypto(coingeckoKey, cryptoToFetch),
    ]);

    const stocks = stocksResult.data;
    const crypto = cryptoResult.data;
    if (stocksResult.failed) sourceErrors.push("finnhub");
    if (cryptoResult.failed) sourceErrors.push("coingecko");

    console.log("[market-analysis] Data fetched:", {
      stocksWithPrice: stocks.filter((s) => s.price !== null).length,
      cryptoWithPrice: crypto.filter((c) => c.price !== null).length,
      macroWithValue: macro.filter((m) => m.value !== null).length,
    });

    const marketPayload = {
      stocks,
      crypto,
      macro,
      marketOpen: isUsMarketOpen(),
      lastUpdated: new Date().toISOString(),
      sourceErrors,
    };

    const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();

    if (!anthropicKey) {
      console.warn("[market-analysis] ANTHROPIC_API_KEY missing — market data only");
      return NextResponse.json({ ...marketPayload, analysis: null });
    }

    try {
      const userName = deriveUserName(
        user.email ?? undefined,
        user.user_metadata as Record<string, unknown> | undefined,
      );

      console.log("[market-analysis] Compiling 7-layer analysis context…");
      const analysisContext = await compileAnalysisContext(
        profile,
        stocks,
        crypto,
        macro,
        fredHistory,
        finnhubKey,
        coingeckoKey,
        cryptoToFetch,
      );

      const analysis = await fetchStructuredAnalysis(
        userName,
        profile,
        analysisContext,
        anthropicKey,
      );

      return NextResponse.json({ ...marketPayload, analysis });
    } catch (analysisError) {
      console.error("[market-analysis] Analysis generation failed:", analysisError);
      return NextResponse.json({ ...marketPayload, analysis: null });
    }
  } catch (error) {
    console.error("[market-analysis] Unhandled error:", error);
    return NextResponse.json(
      { error: "No se pudo obtener el análisis de mercado" },
      { status: 500 },
    );
  }
}
