import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { getStripe } from "@/lib/stripe";
import {
  hasActiveSubscription,
  resolveStripeCustomerId,
} from "@/lib/subscription";
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

type FredHistoricalContext = {
  fedFunds: {
    current: FredObservation | null;
    sixMonthsAgo: FredObservation | null;
    oneYearAgo: FredObservation | null;
  };
  cpi: {
    current: FredObservation | null;
    sixMonthsAgo: FredObservation | null;
  };
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
};

type StructuredAnalysis = {
  headline: string;
  asset_insights: {
    symbol: string;
    name: string;
    micro_insight: string;
  }[];
  analysis: {
    paragraph_1: string;
    paragraph_2: string;
    paragraph_3: string;
  };
  terms: {
    word: string;
    beginner: string;
    intermediate: string;
    advanced: string;
  }[];
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

async function fetchFredSeriesHistory(
  apiKey: string,
  seriesId: string,
  limit = 15,
): Promise<FredObservation[]> {
  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${seriesId}&api_key=${apiKey}&limit=${limit}&sort_order=desc&file_type=json`;
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

async function fetchFredHistoricalContext(
  apiKey: string | undefined,
): Promise<FredHistoricalContext | null> {
  if (!apiKey) return null;

  try {
    const [fedHistory, cpiHistory] = await Promise.all([
      fetchFredSeriesHistory(apiKey, "FEDFUNDS", 15),
      fetchFredSeriesHistory(apiKey, "CPIAUCSL", 15),
    ]);

    return {
      fedFunds: {
        current: fedHistory[0] ?? null,
        sixMonthsAgo: fedHistory[6] ?? null,
        oneYearAgo: fedHistory[12] ?? null,
      },
      cpi: {
        current: cpiHistory[0] ?? null,
        sixMonthsAgo: cpiHistory[6] ?? null,
      },
    };
  } catch (err) {
    console.error("[market-analysis] FRED historical fetch error:", err);
    return null;
  }
}

function formatFredHistoricalContext(context: FredHistoricalContext | null): string {
  if (!context) {
    return "Contexto histórico FRED no disponible.";
  }

  const lines: string[] = ["Contexto histórico (FRED):"];

  const { fedFunds, cpi } = context;

  if (fedFunds.current) {
    lines.push("Tipos Fed (FEDFUNDS):");
    lines.push(`- Actual (${fedFunds.current.date}): ${fedFunds.current.value}%`);
    if (fedFunds.sixMonthsAgo) {
      lines.push(
        `- Hace ~6 meses (${fedFunds.sixMonthsAgo.date}): ${fedFunds.sixMonthsAgo.value}%`,
      );
    }
    if (fedFunds.oneYearAgo) {
      lines.push(
        `- Hace ~1 año (${fedFunds.oneYearAgo.date}): ${fedFunds.oneYearAgo.value}%`,
      );
    }
    if (fedFunds.sixMonthsAgo) {
      const delta6m = fedFunds.current.value - fedFunds.sixMonthsAgo.value;
      lines.push(
        `- Cambio vs hace 6 meses: ${delta6m > 0 ? "+" : ""}${delta6m.toFixed(2)} pp`,
      );
    }
    if (fedFunds.oneYearAgo) {
      const delta1y = fedFunds.current.value - fedFunds.oneYearAgo.value;
      lines.push(
        `- Cambio vs hace 1 año: ${delta1y > 0 ? "+" : ""}${delta1y.toFixed(2)} pp`,
      );
    }
  }

  if (cpi.current) {
    lines.push("");
    lines.push("Inflación CPI (CPIAUCSL, índice):");
    lines.push(`- Actual (${cpi.current.date}): ${cpi.current.value}`);
    if (cpi.sixMonthsAgo) {
      lines.push(
        `- Hace ~6 meses (${cpi.sixMonthsAgo.date}): ${cpi.sixMonthsAgo.value}`,
      );
      const pctChange =
        ((cpi.current.value - cpi.sixMonthsAgo.value) / cpi.sixMonthsAgo.value) *
        100;
      lines.push(
        `- Variación aproximada en 6 meses: ${pctChange > 0 ? "+" : ""}${pctChange.toFixed(2)}%`,
      );
    }
  }

  lines.push("");
  lines.push(
    "Usa este contexto histórico para dar perspectiva temporal (ej. 'los tipos llevan meses altos') en lugar de citar solo el dato de hoy.",
  );

  return lines.join("\n");
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
      .select("experience_level, selected_assets, free_text")
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

function formatMarketData(
  stocks: Stock[],
  crypto: Crypto[],
  macro: Macro[],
): string {
  const stockLines = stocks
    .map(
      (s) =>
        `- ${s.name} (${s.symbol}): ${s.price !== null ? `$${s.price}` : "sin dato"}${
          s.changePercent !== null
            ? ` (${s.changePercent > 0 ? "+" : ""}${s.changePercent.toFixed(2)}%)`
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
        }`,
    )
    .join("\n");

  return [
    stocks.length > 0 ? `Mercados (acciones, índices, metales):\n${stockLines}` : null,
    crypto.length > 0 ? `Crypto:\n${cryptoLines}` : null,
    `Macroeconomía:\n${macroLines}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n\n");
}

function buildClaudeSystemPrompt(
  profile: UserProfile | null,
  stocks: Stock[],
  crypto: Crypto[],
  macro: Macro[],
  fredHistory: FredHistoricalContext | null,
): string {
  const experienceLevel =
    LEVEL_LABELS[profile?.experience_level ?? ""] ??
    profile?.experience_level ??
    "Intermedio";
  const selectedAssets = formatSelectedAssets(profile);
  const freeText = profile?.free_text?.trim() || "sin contexto personal";
  const marketData = formatMarketData(stocks, crypto, macro);
  const historicalContext = formatFredHistoricalContext(fredHistory);

  return `Eres el analista de NextWall. Tu trabajo es explicar en lenguaje directo 
y honesto cómo la economía global afecta a las inversiones de este usuario específico.

PERFIL DEL USUARIO:
- Nivel: ${experienceLevel}
- Tiene invertido en: ${selectedAssets}
- Lo que quiere entender: ${freeText}

DATOS DE HOY:
${marketData}

${historicalContext}

REGLAS ESTRICTAS:
- Empieza siempre con UNA frase de resumen de máximo 15 palabras que capture 
  lo más importante del día. Ejemplo: 'Los mercados caen hoy por miedo a nuevas 
  subidas de tipos.'
- Luego escribe exactamente 3 párrafos cortos (máximo 4 frases cada uno):
  * Párrafo 1: Qué está pasando hoy en los activos de este usuario
  * Párrafo 2: Por qué está pasando — conecta con los datos macro
  * Párrafo 3: Qué contexto histórico es relevante y qué debería saber este inversor
- Adapta el lenguaje al nivel del usuario:
  * Principiante: usa analogías cotidianas, evita términos técnicos, 
    explica todo como si fuera la primera vez
  * Intermedio: puedes usar términos básicos pero explícalos en la misma frase
  * Avanzado: análisis directo, terminología financiera sin explicaciones básicas
- NUNCA digas qué comprar o vender
- NUNCA uses frases vacías como 'es importante recordar' o 'cabe destacar'
- NUNCA repitas información entre párrafos
- Si un activo del usuario sube mucho o baja mucho hoy (más de 2%), 
  menciónalo específicamente y explica por qué
- Usa el contexto histórico de FRED para dar perspectiva temporal, no solo el dato puntual

FORMATO DE RESPUESTA — devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin markdown:

{
  "headline": "La frase de resumen de máximo 15 palabras",
  "asset_insights": [
    {
      "symbol": "símbolo del activo",
      "name": "nombre del activo",
      "micro_insight": "Una frase de máximo 12 palabras explicando por qué se mueve hoy este activo específico"
    }
  ],
  "analysis": {
    "paragraph_1": "Qué está pasando hoy en los activos de este usuario — máximo 4 frases",
    "paragraph_2": "Por qué está pasando — conecta con datos macro — máximo 4 frases",
    "paragraph_3": "Contexto histórico relevante y qué debería saber este inversor — máximo 4 frases"
  },
  "terms": [
    {
      "word": "término exacto tal como aparece en el análisis",
      "beginner": "definición simple con analogía cotidiana, máximo 2 frases",
      "intermediate": "definición con contexto financiero básico, máximo 2 frases",
      "advanced": "definición técnica directa, máximo 1 frase"
    }
  ]
}

Reglas del JSON:
- El headline debe ser específico para los activos de este usuario
- Incluye asset_insights para los activos del usuario con movimiento relevante hoy
- Los terms deben ser palabras que realmente aparecen en los 3 párrafos
- Devuelve SOLO el JSON, nada más`;
}

function parseAnalysisJson(raw: string): StructuredAnalysis {
  const trimmed = raw.trim();
  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) {
      parsed = JSON.parse(codeBlock[1].trim());
    } else {
      const start = trimmed.indexOf("{");
      const end = trimmed.lastIndexOf("}");
      if (start === -1 || end === -1) {
        throw new Error("No JSON object found in Claude response");
      }
      parsed = JSON.parse(trimmed.slice(start, end + 1));
    }
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Parsed analysis is not an object");
  }

  const obj = parsed as Record<string, unknown>;
  if (
    typeof obj.headline !== "string" ||
    !Array.isArray(obj.asset_insights) ||
    !obj.analysis ||
    typeof obj.analysis !== "object" ||
    !Array.isArray(obj.terms)
  ) {
    throw new Error("Analysis JSON missing required fields");
  }

  return obj as StructuredAnalysis;
}

async function fetchStructuredAnalysis(
  profile: UserProfile | null,
  stocks: Stock[],
  crypto: Crypto[],
  macro: Macro[],
  fredHistory: FredHistoricalContext | null,
  apiKey: string,
): Promise<StructuredAnalysis> {
  const client = new Anthropic({ apiKey });
  const system = buildClaudeSystemPrompt(
    profile,
    stocks,
    crypto,
    macro,
    fredHistory,
  );
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      console.log(
        `[market-analysis] Calling Anthropic model (attempt ${attempt + 1})`,
      );

      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
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

    // Fetch user profile, macro snapshot, and FRED historical context in parallel
    const [profile, macroResult, fredHistory] = await Promise.all([
      fetchUserProfile(user.id),
      fetchMacro(fredKey),
      fetchFredHistoricalContext(fredKey),
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
      const analysis = await fetchStructuredAnalysis(
        profile,
        stocks,
        crypto,
        macro,
        fredHistory,
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
