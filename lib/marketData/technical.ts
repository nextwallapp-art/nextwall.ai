export type TechnicalSnapshot = {
  symbol: string;
  name: string;
  price: number | null;
  changeDayPct: number | null;
  changeWeekPct: number | null;
  changeMonthPct: number | null;
  support: number | null;
  resistance: number | null;
  sma20: number | null;
  rsi14: number | null;
  rsiSignal: "sobrecompra" | "sobreventa" | "neutral";
};

function computeRsi(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;

  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function pctChange(from: number, to: number): number {
  return ((to - from) / from) * 100;
}

async function fetchCandles(
  token: string,
  symbol: string,
): Promise<{ t: number[]; c: number[]; l: number[]; h: number[] } | null> {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 60 * 24 * 60 * 60;
  const url =
    `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}` +
    `&resolution=D&from=${from}&to=${to}&token=${token}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      s?: string;
      t?: number[];
      c?: number[];
      l?: number[];
      h?: number[];
    };
    if (data.s !== "ok" || !data.c?.length) return null;
    return {
      t: data.t ?? [],
      c: data.c,
      l: data.l ?? data.c,
      h: data.h ?? data.c,
    };
  } catch {
    return null;
  }
}

export async function fetchTechnicalAnalysis(
  token: string | undefined,
  assets: { symbol: string; name: string; price: number | null; changePercent: number | null }[],
): Promise<TechnicalSnapshot[]> {
  if (!token) {
    return assets.map((a) => ({
      symbol: a.symbol,
      name: a.name,
      price: a.price,
      changeDayPct: a.changePercent,
      changeWeekPct: null,
      changeMonthPct: null,
      support: null,
      resistance: null,
      sma20: null,
      rsi14: null,
      rsiSignal: "neutral",
    }));
  }

  return Promise.all(
    assets.slice(0, 10).map(async (asset) => {
      const candles = await fetchCandles(token, asset.symbol);
      if (!candles) {
        return {
          symbol: asset.symbol,
          name: asset.name,
          price: asset.price,
          changeDayPct: asset.changePercent,
          changeWeekPct: null,
          changeMonthPct: null,
          support: null,
          resistance: null,
          sma20: null,
          rsi14: null,
          rsiSignal: "neutral" as const,
        };
      }

      const { c, l, h } = candles;
      const last = c[c.length - 1];
      const weekAgo = c.length >= 6 ? c[c.length - 6] : c[0];
      const monthAgo = c.length >= 22 ? c[c.length - 22] : c[0];
      const recentLows = l.slice(-20);
      const recentHighs = h.slice(-20);
      const sma20 =
        c.length >= 20
          ? c.slice(-20).reduce((a, b) => a + b, 0) / 20
          : null;
      const rsi14 = computeRsi(c);
      let rsiSignal: TechnicalSnapshot["rsiSignal"] = "neutral";
      if (rsi14 !== null) {
        if (rsi14 >= 70) rsiSignal = "sobrecompra";
        else if (rsi14 <= 30) rsiSignal = "sobreventa";
      }

      return {
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price ?? last,
        changeDayPct: asset.changePercent,
        changeWeekPct: weekAgo ? pctChange(weekAgo, last) : null,
        changeMonthPct: monthAgo ? pctChange(monthAgo, last) : null,
        support: recentLows.length ? Math.min(...recentLows) : null,
        resistance: recentHighs.length ? Math.max(...recentHighs) : null,
        sma20,
        rsi14,
        rsiSignal,
      };
    }),
  );
}

export function formatTechnicalAnalysis(snapshots: TechnicalSnapshot[]): string {
  if (snapshots.length === 0) return "Análisis técnico no disponible.";

  return snapshots
    .map((s) => {
      const fmt = (n: number | null, suffix = "") =>
        n !== null ? `${n.toFixed(2)}${suffix}` : "sin dato";
      return [
        `${s.name} (${s.symbol}):`,
        `  Precio: ${fmt(s.price, " USD")} | Día: ${fmt(s.changeDayPct, "%")} | Semana: ${fmt(s.changeWeekPct, "%")} | Mes: ${fmt(s.changeMonthPct, "%")}`,
        `  Soporte (20d low): ${fmt(s.support, " USD")} | Resistencia (20d high): ${fmt(s.resistance, " USD")}`,
        `  Media móvil 20d: ${fmt(s.sma20, " USD")} | RSI(14): ${fmt(s.rsi14)} (${s.rsiSignal})`,
      ].join("\n");
    })
    .join("\n\n");
}
