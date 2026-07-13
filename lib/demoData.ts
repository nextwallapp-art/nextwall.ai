import type { Locale } from "@/lib/i18n/translations";

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

export type DemoTerm = {
  word: string;
  beginner: string;
  intermediate: string;
  advanced: string;
};

export type DemoAnalysis = {
  headline: string;
  asset_insights: { symbol: string; name: string; micro_insight: string }[];
  analysis: {
    paragraph_1: string;
    paragraph_2: string;
    paragraph_3: string;
  };
  terms: DemoTerm[];
};

export type DemoMarketData = {
  stocks: DemoStock[];
  crypto: DemoCrypto[];
  macro: DemoMacro[];
  marketOpen: boolean;
  lastUpdated: string;
  analysis: DemoAnalysis;
};

const demoByLocale: Record<Locale, DemoMarketData> = {
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
      {
        id: "fed_funds",
        name: "Fed funds rate",
        value: 5.33,
        unit: "%",
        date: "Jun 2026",
      },
      {
        id: "cpi",
        name: "CPI (YoY)",
        value: 2.9,
        unit: "%",
        date: "May 2026",
      },
      {
        id: "unemployment",
        name: "Unemployment",
        value: 4.1,
        unit: "%",
        date: "May 2026",
      },
      {
        id: "vix",
        name: "VIX",
        value: 14.8,
        unit: "índice",
        date: "Today",
      },
    ],
    marketOpen: true,
    lastUpdated: new Date().toISOString(),
    analysis: {
      headline: "Tech leads while rate-cut hopes keep gold steady.",
      asset_insights: [
        {
          symbol: "NVDA",
          name: "Nvidia",
          micro_insight: "AI demand headlines are lifting chip leaders today.",
        },
        {
          symbol: "AAPL",
          name: "Apple",
          micro_insight: "Profit-taking after a strong week in mega-cap tech.",
        },
        {
          symbol: "SPY",
          name: "S&P 500 ETF",
          micro_insight: "Broad market flat as investors wait for CPI clarity.",
        },
        {
          symbol: "BTC",
          name: "Bitcoin",
          micro_insight: "Risk appetite is improving as yields ease slightly.",
        },
        {
          symbol: "GLD",
          name: "Gold ETF",
          micro_insight: "Hedge demand stays firm ahead of Fed speakers.",
        },
      ],
      analysis: {
        paragraph_1:
          "Your mix of tech, broad ETFs and Bitcoin is split today: Nvidia and Solana are up, while Apple and Tesla pull back. That pattern usually means investors are still betting on growth, but not blindly — they're trimming names that ran up fast. Your S&P and Nasdaq ETFs are barely moving, which tells you the overall mood is cautious, not panicked.",
        paragraph_2:
          "The macro backdrop explains a lot of this. Inflation is cooling but not gone, so the Fed is still keeping rates high — that makes borrowing expensive for companies and households. When rate-cut hopes flicker (like after soft jobs data), growth stocks and crypto tend to bounce. Gold in your portfolio is doing its job: it holds up when people aren't sure whether to be optimistic or defensive.",
        paragraph_3:
          "Historically, when rates stay above 5% and inflation hovers near 3%, markets chop sideways for weeks rather than crash or rally hard. For a beginner portfolio like this demo, the lesson isn't to react to every daily move — it's to notice which story is driving the day: rates, earnings, or risk appetite. That's exactly what NextWall tracks for your real holdings once you sign up.",
      },
      terms: [
        {
          word: "Fed funds rate",
          beginner:
            "The interest rate banks charge each other overnight — when it goes up, borrowing gets more expensive for everyone.",
          intermediate:
            "The Fed's main policy rate; higher rates slow the economy and often pressure stock valuations.",
          advanced:
            "The effective lower bound of the Fed's target range; influences the discount rate used in equity and credit pricing.",
        },
        {
          word: "CPI",
          beginner:
            "A monthly report that tracks how much everyday prices (food, rent, gas) have changed.",
          intermediate:
            "Consumer Price Index — the most watched inflation gauge for Fed policy decisions.",
          advanced:
            "Headline and core CPI drive real yield expectations and front-end rate pricing.",
        },
        {
          word: "risk appetite",
          beginner:
            "How willing investors are to buy risky assets like stocks and crypto versus playing it safe.",
          intermediate:
            "The market's tolerance for volatility; rises when macro fears fade and liquidity improves.",
          advanced:
            "Cross-asset factor linking equity beta, credit spreads, and crypto correlation regimes.",
        },
      ],
    },
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
      {
        id: "fed_funds",
        name: "Tipo Fed",
        value: 5.33,
        unit: "%",
        date: "Jun 2026",
      },
      {
        id: "cpi",
        name: "IPC (interanual)",
        value: 2.9,
        unit: "%",
        date: "May 2026",
      },
      {
        id: "unemployment",
        name: "Desempleo",
        value: 4.1,
        unit: "%",
        date: "May 2026",
      },
      {
        id: "vix",
        name: "VIX",
        value: 14.8,
        unit: "índice",
        date: "Hoy",
      },
    ],
    marketOpen: true,
    lastUpdated: new Date().toISOString(),
    analysis: {
      headline: "El tech lidera mientras el oro se mantiene firme.",
      asset_insights: [
        {
          symbol: "NVDA",
          name: "Nvidia",
          micro_insight: "La demanda de IA impulsa hoy a las chipmakers.",
        },
        {
          symbol: "AAPL",
          name: "Apple",
          micro_insight: "Toma de beneficios tras una semana fuerte en mega caps.",
        },
        {
          symbol: "SPY",
          name: "ETF S&P 500",
          micro_insight: "Mercado plano mientras se espera claridad sobre inflación.",
        },
        {
          symbol: "BTC",
          name: "Bitcoin",
          micro_insight: "Mejora el apetito por riesgo al ceder ligeramente los tipos.",
        },
        {
          symbol: "GLD",
          name: "ETF Oro",
          micro_insight: "Demanda defensiva firme antes de intervenciones de la Fed.",
        },
      ],
      analysis: {
        paragraph_1:
          "Tu mezcla de tech, ETFs amplios y Bitcoin está dividida hoy: Nvidia y Solana suben, mientras Apple y Tesla corrigen. Eso suele significar que los inversores siguen apostando por crecimiento, pero con selectividad — recortan nombres que subieron mucho. Tus ETFs del S&P y Nasdaq apenas se mueven, señal de un humor cauteloso, no de pánico.",
        paragraph_2:
          "El contexto macro lo explica. La inflación enfría pero no desaparece, así que la Fed mantiene tipos altos — eso encarece el crédito para empresas y familias. Cuando parpadean las esperanzas de recorte (por ejemplo tras datos laborales débiles), suelen repuntar acciones de crecimiento y crypto. El oro cumple su papel: se mantiene cuando nadie tiene claro si conviene ser optimista o defensivo.",
        paragraph_3:
          "Históricamente, con tipos por encima del 5% e inflación cerca del 3%, los mercados laterales duran semanas sin crash ni rally fuerte. En una cartera principiante como esta demo, la lección no es reaccionar a cada movimiento diario — es identificar qué historia manda hoy: tipos, resultados o apetito por riesgo. Eso es lo que NextWall hace con tus activos reales cuando te registras.",
      },
      terms: [
        {
          word: "Fed",
          beginner:
            "El banco central de EE.UU.; sube o baja tipos para controlar inflación y empleo.",
          intermediate:
            "Reserva Federal; sus decisiones de tipos impactan acciones, bonos y divisas globalmente.",
          advanced:
            "Autoridad monetaria cuyo dot plot y minutes guían la curva de tipos y múltiplos de equity.",
        },
        {
          word: "IPC",
          beginner:
            "Informe mensual que mide cuánto han subido precios de consumo (comida, alquiler, gasolina).",
          intermediate:
            "Índice de Precios al Consumo — indicador clave de inflación para la política de la Fed.",
          advanced:
            "Headline vs core IPC condicionan expectativas de tipos reales y pricing del front-end.",
        },
        {
          word: "apetito por riesgo",
          beginner:
            "Cuánta disposición hay a comprar activos arriesgados (acciones, crypto) frente a refugios seguros.",
          intermediate:
            "Tolerancia del mercado a la volatilidad; sube cuando mejora la liquidez y bajan los miedos macro.",
          advanced:
            "Factor cross-asset que correlaciona beta equity, spreads de crédito y regímenes crypto.",
        },
      ],
    },
  },
};

export function getDemoMarketData(locale: Locale): DemoMarketData {
  const data = demoByLocale[locale];
  return {
    ...data,
    lastUpdated: new Date().toISOString(),
  };
}

export function getMicroInsight(
  analysis: DemoAnalysis,
  symbol: string,
): string | null {
  const match = analysis.asset_insights.find(
    (item) => item.symbol.toUpperCase() === symbol.toUpperCase(),
  );
  return match?.micro_insight ?? null;
}
