import type { Locale } from "@/lib/i18n/translations";
import type { StructuredAnalysis } from "@/lib/marketAnalysis";

export type DemoStock = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
};

export type DemoCrypto = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
};

export type DemoMacro = {
  id: string;
  name: string;
  value: number;
  unit: string;
  date: string;
};

export type DemoAnalysis = StructuredAnalysis;

export type DemoMarketData = {
  stocks: DemoStock[];
  crypto: DemoCrypto[];
  macro: DemoMacro[];
  marketOpen: boolean;
  lastUpdated: string;
  analysis: DemoAnalysis;
};

const demoAnalysisEn: DemoAnalysis = {
  headline: "Tech leads while rate-cut hopes keep gold steady.",
  three_layers: {
    layer_1_what_happened: {
      title: "What happened in the world?",
      events: [
        {
          event: "Markets are balancing strong mega-cap earnings against sticky inflation.",
          where: "macro",
          impact_on_user:
            "Your Nvidia and Apple positions move in opposite directions — growth is selective, not broad.",
          evidence: "Demo macro: Fed funds 5.33%, CPI 2.9%",
        },
        {
          event: "Rate-cut expectations flicker after soft labor signals.",
          where: "macro",
          impact_on_user: "Bitcoin in your mix tends to bounce when yields ease slightly.",
          evidence: "BTC +1.4% in demo data",
        },
      ],
    },
    layer_2_what_price_says: {
      title: "What does price say today?",
      technical:
        "Nvidia is up ~2% while Apple pulls back ~1.2%. SPY is flat — the market is cautious, not panicked. Gold ETF holds firm near resistance.",
      onchain:
        "Bitcoin shows moderate 30d momentum; demo proxy suggests holders are not in extreme fear or greed.",
      pattern:
        "Similar setups in 2023 saw sharp tech swings followed by recoveries when earnings confirmed the growth story.",
    },
    layer_3_what_experts_think: {
      title: "What do the pros think?",
      fundamental:
        "Fundamental analysts focus on whether AI capex can sustain chip valuations at current multiples.",
      quants:
        "Quant models flag elevated volatility in mega-cap tech but no systemic stress signal.",
      range:
        "Demo consensus: more bulls than bears on growth, but disagreement on magnitude of next leg up.",
      humility:
        "Even top analysts misread 2023 rate paths — watch data, not headlines.",
    },
  },
  narrative:
    "Your mix of tech, broad ETFs and Bitcoin is split today: Nvidia and Solana are up, while Apple and Tesla pull back. That usually means investors still want growth, but selectively.\n\nInflation is cooling but not gone, so the Fed keeps rates high. When cut hopes flicker, growth stocks and crypto bounce; gold holds when direction is unclear.\n\nHistorically, sideways markets dominate when rates stay above 5% and inflation hovers near 3%. The lesson: notice which story drives the day — rates, earnings, or risk appetite.",
  action_insight:
    "If this pattern repeats, watch the next CPI print and Fed speaker tone — not every daily tick. Track whether today's driver is rates, earnings, or risk appetite.",
  terms: [
    {
      word: "Fed funds rate",
      beginner:
        "The interest rate banks charge each other overnight — when it rises, borrowing gets more expensive for everyone.",
      intermediate:
        "The Fed's main policy rate; higher rates slow the economy and often pressure stock valuations.",
      advanced:
        "Effective lower bound of the Fed target range; anchors discount rates in equity and credit pricing.",
    },
    {
      word: "risk appetite",
      beginner:
        "How willing investors are to buy risky assets like stocks and crypto versus playing it safe.",
      intermediate:
        "Market tolerance for volatility; rises when macro fears fade and liquidity improves.",
      advanced:
        "Cross-asset factor linking equity beta, credit spreads, and crypto correlation regimes.",
    },
  ],
  meta: {
    confidence: "medium",
    sources: "Demo data — not live GDELT/FRED/Finnhub",
    last_updated: new Date().toISOString(),
  },
};

const demoAnalysisEs: DemoAnalysis = {
  ...demoAnalysisEn,
  headline: "El tech lidera mientras el oro se mantiene firme.",
  three_layers: {
    layer_1_what_happened: {
      title: "¿Qué pasó en el mundo?",
      events: [
        {
          event: "Los mercados equilibran resultados fuertes de mega caps con inflación persistente.",
          where: "macro",
          impact_on_user:
            "Tus posiciones en Nvidia y Apple van en direcciones opuestas — el crecimiento es selectivo.",
          evidence: "Macro demo: tipos Fed 5,33%, IPC 2,9%",
        },
        {
          event: "Parpadean las expectativas de recorte tras señales laborales más débiles.",
          where: "macro",
          impact_on_user: "Bitcoin en tu mix suele repuntar cuando ceden ligeramente los tipos.",
          evidence: "BTC +1,4% en datos demo",
        },
      ],
    },
    layer_2_what_price_says: {
      title: "¿Qué dice el precio hoy?",
      technical:
        "Nvidia sube ~2% mientras Apple corrige ~1,2%. SPY está plano — mercado cauteloso, no en pánico. El ETF de oro se mantiene firme.",
      onchain:
        "Bitcoin muestra momentum 30d moderado; proxy demo sin miedo ni euforia extrema.",
      pattern:
        "En 2023, setups similares trajeron swings fuertes en tech y recuperaciones cuando los beneficios confirmaron el relato.",
    },
    layer_3_what_experts_think: {
      title: "¿Qué piensan los expertos?",
      fundamental:
        "Los fundamentales miran si el capex en IA puede sostener múltiplos actuales en chips.",
      quants:
        "Modelos cuantitativos marcan volatilidad elevada en mega caps pero sin estrés sistémico.",
      range:
        "Consenso demo: más alcistas que bajistas en crecimiento, pero desacuerdo en la magnitud del siguiente tramo.",
      humility:
        "Incluso los mejores analistas fallaron la trayectoria de tipos en 2023 — mira datos, no titulares.",
    },
  },
  narrative:
    "Tu mezcla de tech, ETFs amplios y Bitcoin está dividida hoy: Nvidia y Solana suben, Apple y Tesla corrigen. Eso suele significar apuesta selectiva por crecimiento.\n\nLa inflación enfría pero no desaparece; la Fed mantiene tipos altos. Cuando parpadean recortes, repuntan growth y crypto; el oro aguanta cuando la dirección no está clara.\n\nHistóricamente, mercados laterales dominan con tipos >5% e inflación ~3%. La lección: identifica qué historia manda hoy — tipos, resultados o apetito por riesgo.",
  action_insight:
    "Si el patrón se repite, vigila el próximo IPC y el tono de la Fed — no cada tick diario. Identifica si mandan tipos, resultados o apetito por riesgo.",
  terms: [
    {
      word: "Fed",
      beginner:
        "El banco central de EE.UU.; sube o baja tipos para controlar inflación y empleo.",
      intermediate:
        "Reserva Federal; sus decisiones impactan acciones, bonos y divisas globalmente.",
      advanced:
        "Autoridad monetaria cuyo dot plot guía curva de tipos y múltiplos de equity.",
    },
    {
      word: "apetito por riesgo",
      beginner:
        "Disposición a comprar activos arriesgados frente a refugios seguros.",
      intermediate:
        "Tolerancia a la volatilidad; sube cuando mejora la liquidez y bajan miedos macro.",
      advanced:
        "Factor cross-asset que correlaciona beta equity, spreads de crédito y regímenes crypto.",
    },
  ],
  meta: {
    confidence: "medio",
    sources: "Datos demo — no GDELT/FRED/Finnhub en vivo",
    last_updated: new Date().toISOString(),
  },
};

const demoByLocale: Record<Locale, Omit<DemoMarketData, "lastUpdated">> = {
  en: {
    stocks: [
      { symbol: "AAPL", name: "Apple", price: 213.42, changePercent: -1.24 },
      { symbol: "NVDA", name: "Nvidia", price: 128.76, changePercent: 2.18 },
      { symbol: "SPY", name: "S&P 500 ETF", price: 548.31, changePercent: -0.42 },
      { symbol: "QQQ", name: "Nasdaq ETF", price: 472.15, changePercent: 0.31 },
      { symbol: "GLD", name: "Gold ETF", price: 228.9, changePercent: 0.87 },
      { symbol: "TSLA", name: "Tesla", price: 248.5, changePercent: -2.05 },
    ],
    crypto: [
      { symbol: "BTC", name: "Bitcoin", price: 67240, change24h: 1.42 },
      { symbol: "ETH", name: "Ethereum", price: 3412, change24h: -0.68 },
      { symbol: "SOL", name: "Solana", price: 148.2, change24h: 3.11 },
    ],
    macro: [
      { id: "fed_funds", name: "Fed funds rate", value: 5.33, unit: "%", date: "Jun 2026" },
      { id: "cpi", name: "CPI (YoY)", value: 2.9, unit: "%", date: "May 2026" },
      { id: "unemployment", name: "Unemployment", value: 4.1, unit: "%", date: "May 2026" },
      { id: "vix", name: "VIX", value: 14.8, unit: "índice", date: "Today" },
    ],
    marketOpen: true,
    analysis: demoAnalysisEn,
  },
  es: {
    stocks: [
      { symbol: "AAPL", name: "Apple", price: 213.42, changePercent: -1.24 },
      { symbol: "NVDA", name: "Nvidia", price: 128.76, changePercent: 2.18 },
      { symbol: "SPY", name: "ETF S&P 500", price: 548.31, changePercent: -0.42 },
      { symbol: "QQQ", name: "ETF Nasdaq", price: 472.15, changePercent: 0.31 },
      { symbol: "GLD", name: "ETF Oro", price: 228.9, changePercent: 0.87 },
      { symbol: "TSLA", name: "Tesla", price: 248.5, changePercent: -2.05 },
    ],
    crypto: [
      { symbol: "BTC", name: "Bitcoin", price: 67240, change24h: 1.42 },
      { symbol: "ETH", name: "Ethereum", price: 3412, change24h: -0.68 },
      { symbol: "SOL", name: "Solana", price: 148.2, change24h: 3.11 },
    ],
    macro: [
      { id: "fed_funds", name: "Tipo Fed", value: 5.33, unit: "%", date: "Jun 2026" },
      { id: "cpi", name: "IPC (interanual)", value: 2.9, unit: "%", date: "May 2026" },
      { id: "unemployment", name: "Desempleo", value: 4.1, unit: "%", date: "May 2026" },
      { id: "vix", name: "VIX", value: 14.8, unit: "índice", date: "Hoy" },
    ],
    marketOpen: true,
    analysis: demoAnalysisEs,
  },
};

export function getDemoMarketData(locale: Locale): DemoMarketData {
  const data = demoByLocale[locale];
  return {
    ...data,
    lastUpdated: new Date().toISOString(),
    analysis: {
      ...data.analysis,
      meta: {
        ...data.analysis.meta,
        last_updated: new Date().toISOString(),
      },
    },
  };
}

export function getMicroInsight(
  analysis: DemoAnalysis,
  symbol: string,
): string | null {
  const upper = symbol.toUpperCase();
  for (const event of analysis.three_layers.layer_1_what_happened.events) {
    const haystack =
      `${event.event} ${event.impact_on_user} ${event.evidence}`.toUpperCase();
    if (haystack.includes(upper)) {
      return event.impact_on_user || event.event;
    }
  }
  return null;
}
