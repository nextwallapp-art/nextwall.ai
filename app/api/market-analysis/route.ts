import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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

async function fetchStocks(
  token: string,
  stocks: { symbol: string; name: string }[],
): Promise<Stock[]> {
  if (stocks.length === 0) return [];
  console.log(
    "[market-analysis] fetchStocks →",
    stocks.map((s) => s.symbol).join(", "),
  );
  return Promise.all(
    stocks.map(async ({ symbol, name }) => {
      try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          console.error(`[market-analysis] Finnhub ${symbol} HTTP ${res.status}`);
          return { symbol, name, price: null, change: null, changePercent: null };
        }
        const data = (await res.json()) as {
          c?: number;
          d?: number;
          dp?: number;
          pc?: number;
        };
        console.log(`[market-analysis] Finnhub ${symbol}:`, JSON.stringify(data));
        const price =
          typeof data.c === "number" && data.c !== 0
            ? data.c
            : typeof data.pc === "number" && data.pc !== 0
              ? data.pc
              : null;
        return {
          symbol,
          name,
          price,
          change: typeof data.d === "number" ? data.d : null,
          changePercent: typeof data.dp === "number" ? data.dp : null,
        };
      } catch (err) {
        console.error(`[market-analysis] Finnhub ${symbol} error:`, err);
        return { symbol, name, price: null, change: null, changePercent: null };
      }
    }),
  );
}

async function fetchCrypto(
  apiKey: string | undefined,
  cryptoList: { id: string; symbol: string; name: string }[],
): Promise<Crypto[]> {
  if (cryptoList.length === 0) return [];
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
      return cryptoList.map((c) => ({
        symbol: c.symbol,
        name: c.name,
        price: null,
        change24h: null,
      }));
    }

    const data = (await res.json()) as Record<
      string,
      { usd?: number; usd_24h_change?: number }
    >;
    console.log("[market-analysis] CoinGecko raw:", JSON.stringify(data));

    return cryptoList.map((c) => {
      const entry = data[c.id];
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
  } catch (err) {
    console.error("[market-analysis] CoinGecko error:", err);
    return cryptoList.map((c) => ({
      symbol: c.symbol,
      name: c.name,
      price: null,
      change24h: null,
    }));
  }
}

async function fetchMacro(apiKey: string | undefined): Promise<Macro[]> {
  if (!apiKey) {
    console.warn("[market-analysis] FRED_API_KEY missing — returning nulls");
    return MACRO_SERIES.map((s) => ({
      id: s.id,
      name: s.name,
      value: null,
      unit: s.unit,
      date: null,
    }));
  }

  return Promise.all(
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
        const data = (await res.json()) as {
          observations?: { date: string; value: string }[];
        };
        const obs = data.observations?.[0];
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
}

async function fetchUserProfile(
  supabaseUrl: string,
  supabaseAnonKey: string,
  token: string,
  userId: string,
): Promise<UserProfile | null> {
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await client
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

// ── Claude system prompt adapted to user profile ─────────────────────────────

function buildSystemPrompt(profile: UserProfile | null): string {
  if (!profile) {
    return `Eres el analista de NextWall. Explica en 3 párrafos cortos y directos cómo los datos macroeconómicos actuales se relacionan con lo que está pasando en los mercados.

Estructura:
- Párrafo 1: Qué está pasando ahora mismo en los mercados (usa los datos de precios)
- Párrafo 2: Por qué está pasando (conecta con los datos macro — tipos, inflación, petróleo, bono a 10 años)
- Párrafo 3: Qué contexto histórico es relevante y qué debería tener en cuenta un inversor

Reglas: Sin jerga innecesaria. Sin decir qué comprar o vender. Sin ser alarmista. Directo y útil.`;
  }

  const levelMap: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
  };

  const allAssets = [
    ...(profile.selected_assets?.crypto ?? []),
    ...(profile.selected_assets?.stocks ?? []),
    ...(profile.selected_assets?.etfs ?? []),
    ...(profile.selected_assets?.metals ?? []),
  ];

  const levelLabel = levelMap[profile.experience_level ?? ""] ?? "Intermedio";
  const assetsLabel =
    allAssets.length > 0 ? allAssets.join(", ") : "activos generales";

  return `Eres el analista de NextWall. El usuario tiene este perfil:
- Nivel: ${levelLabel}
- Invierte en: ${assetsLabel}
${profile.free_text ? `- Contexto adicional: ${profile.free_text}` : ""}

Adapta tu explicación a su nivel:
- Principiante: lenguaje simple, sin jerga, analogías cotidianas
- Intermedio: puedes usar términos básicos pero explícalos brevemente
- Avanzado: análisis directo con terminología financiera estándar

Explica en 3 párrafos cómo los datos macroeconómicos actuales afectan ESPECÍFICAMENTE a los activos que este usuario tiene.
No menciones activos que no tiene en su lista. Sin recomendar qué comprar o vender.`;
}

// ── Analysis ──────────────────────────────────────────────────────────────────

async function fetchAnalysis(
  stocks: Stock[],
  crypto: Crypto[],
  macro: Macro[],
  profile: UserProfile | null,
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[market-analysis] ANTHROPIC_API_KEY missing — skipping");
    return null;
  }

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

  const systemPrompt = buildSystemPrompt(profile);

  const userMessage = [
    "Datos actuales del mercado.",
    "",
    stocks.length > 0
      ? `Mercados (acciones, índices, metales):\n${stockLines}`
      : null,
    crypto.length > 0 ? `Crypto:\n${cryptoLines}` : null,
    `Macroeconomía:\n${macroLines}`,
    "",
    "Explica qué está pasando siguiendo la estructura indicada.",
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    const client = new Anthropic({ apiKey });
    console.log("[market-analysis] Calling Anthropic model");

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `${systemPrompt}\n\n${userMessage}`,
        },
      ],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    console.log("[market-analysis] Analysis length:", text.length);
    return text || null;
  } catch (error) {
    console.error("[market-analysis] Anthropic error:", error);
    return null;
  }
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

    // Fetch user profile and build filtered asset lists in parallel with macro
    const [profile, macro] = await Promise.all([
      fetchUserProfile(supabaseUrl, supabaseAnonKey, token, user.id),
      fetchMacro(fredKey),
    ]);

    console.log(
      "[market-analysis] Profile:",
      profile
        ? `level=${profile.experience_level}, assets=${JSON.stringify(profile.selected_assets)}`
        : "none (using defaults)",
    );

    const stocksToFetch = buildStockList(profile);
    const cryptoToFetch = buildCryptoList(profile);

    const [stocks, crypto] = await Promise.all([
      finnhubKey
        ? fetchStocks(finnhubKey, stocksToFetch)
        : Promise.resolve(
            stocksToFetch.map((s) => ({
              ...s,
              price: null,
              change: null,
              changePercent: null,
            })),
          ),
      fetchCrypto(coingeckoKey, cryptoToFetch),
    ]);

    console.log("[market-analysis] Data fetched:", {
      stocksWithPrice: stocks.filter((s) => s.price !== null).length,
      cryptoWithPrice: crypto.filter((c) => c.price !== null).length,
      macroWithValue: macro.filter((m) => m.value !== null).length,
    });

    const analysis = await fetchAnalysis(stocks, crypto, macro, profile);

    const result = {
      stocks,
      crypto,
      macro,
      analysis,
      marketOpen: isUsMarketOpen(),
      lastUpdated: new Date().toISOString(),
    };

    console.log("[market-analysis] Returning result keys:", Object.keys(result));
    return NextResponse.json(result);
  } catch (error) {
    console.error("[market-analysis] Unhandled error:", error);
    return NextResponse.json(
      { error: "No se pudo obtener el análisis de mercado" },
      { status: 500 },
    );
  }
}
