import type { AnalysisTerms } from "@/lib/marketAnalysis";
import type { Locale } from "@/lib/i18n/translations";

type TermDefinitions = {
  word: string;
  beginner: string;
  intermediate: string;
  advanced: string;
};

type BilingualGlossaryEntry = {
  match: string[];
  es: TermDefinitions;
  en: TermDefinitions;
};

const CORE_GLOSSARY: BilingualGlossaryEntry[] = [
  {
    match: ["inflación", "inflacion", "IPC", "índice de precios", "inflation", "CPI"],
    es: {
      word: "inflación",
      beginner:
        "Cuando los precios de lo que compras suben con el tiempo.",
      intermediate:
        "Aumento generalizado del nivel de precios; los bancos centrales la vigilan de cerca.",
      advanced:
        "Presión sobre el poder adquisitivo medida por el IPC; guía expectativas de política monetaria.",
    },
    en: {
      word: "inflation",
      beginner: "When everyday prices rise over time.",
      intermediate:
        "A broad rise in price levels; central banks target and react to it.",
      advanced:
        "Purchasing-power erosion measured by CPI; anchors monetary policy expectations.",
    },
  },
  {
    match: [
      "tipos de interés",
      "tipos",
      "tasa de interés",
      "tasas",
      "interest rates",
      "rates",
      "Fed funds rate",
    ],
    es: {
      word: "tipos de interés",
      beginner:
        "El precio de pedir dinero prestado; si suben, créditos e hipotecas cuestan más.",
      intermediate:
        "Coste del crédito fijado por bancos centrales; subir tipos frena la economía.",
      advanced:
        "Tasa de descuento implícita en valoración de activos; canal principal de transmisión monetaria.",
    },
    en: {
      word: "interest rates",
      beginner: "The cost of borrowing money.",
      intermediate:
        "The price of credit set by central banks; higher rates slow the economy.",
      advanced:
        "Discount-rate anchor in asset pricing; primary monetary transmission channel.",
    },
  },
  {
    match: ["Fed", "la Fed", "Reserva Federal", "Federal Reserve", "the Fed"],
    es: {
      word: "Fed",
      beginner:
        "El banco central de EE.UU.; decide si el dinero es caro o barato de pedir prestado.",
      intermediate:
        "Reserva Federal; sus decisiones sobre tipos impactan acciones, bonos y divisas.",
      advanced:
        "Autoridad monetaria cuyo dot plot guía la curva de tipos y múltiplos de equity.",
    },
    en: {
      word: "Fed",
      beginner: "The US central bank; it sets borrowing costs.",
      intermediate:
        "Federal Reserve; its rate decisions move stocks, bonds, and currencies.",
      advanced:
        "Monetary authority whose dot plot steers the yield curve and equity multiples.",
    },
  },
  {
    match: ["BCE", "Banco Central Europeo", "ECB", "European Central Bank"],
    es: {
      word: "BCE",
      beginner:
        "El banco central de la zona euro; influye en el coste del crédito en Europa.",
      intermediate:
        "Banco Central Europeo; fija tipos y compra bonos para controlar inflación.",
      advanced:
        "Emisor del euro; su política condiciona spreads soberanos y crédito europeo.",
    },
    en: {
      word: "ECB",
      beginner: "The central bank for the euro area.",
      intermediate:
        "European Central Bank; sets rates and bond programs for the eurozone.",
      advanced:
        "Euro issuer whose rate path shapes sovereign spreads and European credit.",
    },
  },
  {
    match: ["bonos", "renta fija", "bonds", "fixed income", "treasuries"],
    es: {
      word: "bonos",
      beginner:
        "Préstamos a gobiernos o empresas a cambio de intereses periódicos.",
      intermediate:
        "Instrumentos de deuda; rendimientos altos suelen presionar acciones de crecimiento.",
      advanced:
        "Activos de renta fija cuyo yield actúa como referencia libre de riesgo.",
    },
    en: {
      word: "bonds",
      beginner: "Loans to governments or companies in exchange for interest.",
      intermediate:
        "Debt instruments; rising yields often pressure growth stocks.",
      advanced:
        "Fixed-income assets whose yields serve as the risk-free reference.",
    },
  },
  {
    match: ["rendimiento", "yield", "rentabilidad del bono"],
    es: {
      word: "rendimiento",
      beginner: "Lo que ganas por tener un bono, en porcentaje al año.",
      intermediate: "Yield: rentabilidad anualizada; sube cuando el bono baja de precio.",
      advanced: "Tasa interna de retorno implícita del flujo de cupones.",
    },
    en: {
      word: "yield",
      beginner: "What you earn from a bond, as an annual percentage.",
      intermediate: "Annualized bond return; rises when bond prices fall.",
      advanced: "IRR implied by coupon flows; anchors the sovereign curve.",
    },
  },
  {
    match: ["volatilidad", "VIX", "volatility"],
    es: {
      word: "volatilidad",
      beginner: "Cuánto sube y baja un precio de forma brusca.",
      intermediate: "Magnitud de fluctuaciones; alta volatilidad refleja incertidumbre.",
      advanced: "Desviación estándar anualizada de retornos; input en pricing de opciones.",
    },
    en: {
      word: "volatility",
      beginner: "How sharply prices move up and down.",
      intermediate: "Magnitude of price swings; high volatility reflects uncertainty.",
      advanced: "Annualized return standard deviation; key in options pricing.",
    },
  },
  {
    match: ["soporte", "support", "nivel de soporte"],
    es: {
      word: "soporte",
      beginner: "Precio donde compradores suelen entrar y el activo deja de caer.",
      intermediate: "Nivel técnico con demanda histórica; si se rompe, acelera ventas.",
      advanced: "Zona de liquidez/compra en el libro de órdenes o volumen.",
    },
    en: {
      word: "support",
      beginner: "A price where buyers often step in.",
      intermediate: "Technical level with historical demand.",
      advanced: "Liquidity concentration zone in the order book.",
    },
  },
  {
    match: ["resistencia", "resistance", "nivel de resistencia"],
    es: {
      word: "resistencia",
      beginner: "Precio donde vendedores aparecen y el activo cuesta subir.",
      intermediate: "Nivel donde la oferta superó demanda; ruptura alcista abre rally.",
      advanced: "Cluster de órdenes de venta o máximos previos como barrera.",
    },
    en: {
      word: "resistance",
      beginner: "A price where sellers often appear.",
      intermediate: "Level where supply dominated; upside breaks can fuel rallies.",
      advanced: "Sell-order cluster or prior highs acting as a price barrier.",
    },
  },
  {
    match: ["media móvil", "moving average", "MA", "SMA", "EMA"],
    es: {
      word: "media móvil",
      beginner: "Precio medio de los últimos días; muestra la tendencia.",
      intermediate: "Media en ventana (50/200 sesiones); cruces señalan cambio de tendencia.",
      advanced: "Filtro lagging; cruces SMA/EMA en reglas de momentum sistemático.",
    },
    en: {
      word: "moving average",
      beginner: "Average price over recent days; shows the trend.",
      intermediate: "Smoothed price window; crossovers signal trend shifts.",
      advanced: "Lagging trend filter used in systematic momentum rules.",
    },
  },
  {
    match: [
      "apetito por riesgo",
      "risk appetite",
      "risk-on",
      "risk-off",
      "sentimiento de mercado",
    ],
    es: {
      word: "apetito por riesgo",
      beginner:
        "Si inversores prefieren activos arriesgados o refugios seguros.",
      intermediate:
        "Tolerancia al riesgo; mejora con macro benigna y liquidez.",
      advanced:
        "Factor cross-asset que correlaciona beta equity, crédito y crypto.",
    },
    en: {
      word: "risk appetite",
      beginner: "Whether investors prefer risky assets or safe havens.",
      intermediate: "Market risk tolerance; rises with benign macro data.",
      advanced: "Cross-asset factor linking equity beta, credit, and crypto.",
    },
  },
  {
    match: ["liquidez", "liquidity"],
    es: {
      word: "liquidez",
      beginner: "Qué tan fácil es comprar o vender sin mover mucho el precio.",
      intermediate: "Profundidad de mercado; baja liquidez amplifica movimientos.",
      advanced: "Coste de ejecución y market impact en estrategias de tamaño.",
    },
    en: {
      word: "liquidity",
      beginner: "How easily you can trade without moving the price.",
      intermediate: "Market depth; thin liquidity amplifies moves.",
      advanced: "Execution cost and slippage in size-sensitive strategies.",
    },
  },
  {
    match: ["macro", "macroeconomía", "macroeconomics", "datos macro"],
    es: {
      word: "macro",
      beginner: "Lo grande: inflación, empleo, tipos y crecimiento.",
      intermediate: "Variables agregadas que mueven expectativas monetarias.",
      advanced: "Régimen macro que define ciclo de tipos y correlaciones.",
    },
    en: {
      word: "macro",
      beginner: "The big picture: inflation, jobs, rates, growth.",
      intermediate: "Aggregate variables shifting monetary expectations.",
      advanced: "Macro regime defining rate cycles and correlations.",
    },
  },
  {
    match: ["PIB", "GDP", "producto interior bruto"],
    es: {
      word: "PIB",
      beginner: "Todo lo que produce un país; si crece, economía va bien.",
      intermediate: "PIB real vs nominal; desaceleración anticipa recortes.",
      advanced: "Agregado de demanda final para modelos de ciclo.",
    },
    en: {
      word: "GDP",
      beginner: "Total output of a country; growth signals health.",
      intermediate: "Real vs nominal GDP; slowdowns precede rate cuts.",
      advanced: "Final-demand aggregate feeding cycle models.",
    },
  },
  {
    match: ["recesión", "recession", "contracción"],
    es: {
      word: "recesión",
      beginner: "Economía que encoge varios meses: menos ventas y empleo.",
      intermediate: "Contracción del PIB; eleva prima de riesgo.",
      advanced: "Fase con caída de earnings y compresión de múltiplos.",
    },
    en: {
      word: "recession",
      beginner: "Economy shrinking for months — weaker sales and hiring.",
      intermediate: "GDP contraction; raises risk premia.",
      advanced: "Cycle phase with falling earnings and multiple compression.",
    },
  },
  {
    match: ["sanciones", "sanctions", "embargo"],
    es: {
      word: "sanciones",
      beginner: "Castigos económicos entre países que encarecen bienes.",
      intermediate: "Alteran oferta de commodities y flujos comerciales.",
      advanced: "Shock de oferta que repricea energía, FX y defensa.",
    },
    en: {
      word: "sanctions",
      beginner: "Economic penalties between countries.",
      intermediate: "Disrupt commodity supply and trade flows.",
      advanced: "Supply shock repricing energy, FX, and defense.",
    },
  },
  {
    match: ["geopolítica", "geopolitics"],
    es: {
      word: "geopolítica",
      beginner: "Conflictos y tensiones entre países que mueven mercados.",
      intermediate: "Riesgo geopolítico eleva primas en energía y refugios.",
      advanced: "Factor de cola que altera correlaciones hacia safe havens.",
    },
    en: {
      word: "geopolitics",
      beginner: "Conflicts and tensions between countries.",
      intermediate: "Geopolitical risk lifts energy and safe-haven premia.",
      advanced: "Tail-risk factor shifting flows to safe havens.",
    },
  },
  {
    match: ["MVRV", "market value to realized value"],
    es: {
      word: "MVRV",
      beginner: "En crypto, compara precio actual con lo que pagó la gente.",
      intermediate: "MVRV alto sugiere sobrevaloración vs coste histórico.",
      advanced: "Ratio market cap / realized cap para zonas de toma de beneficios.",
    },
    en: {
      word: "MVRV",
      beginner: "In crypto, compares price to average holder cost.",
      intermediate: "High MVRV suggests rich prices vs cost basis.",
      advanced: "Market cap / realized cap ratio for profit-taking zones.",
    },
  },
  {
    match: ["on-chain", "on chain", "datos on-chain", "blockchain data"],
    es: {
      word: "on-chain",
      beginner: "Datos públicos de blockchain: movimientos y exchanges.",
      intermediate: "Análisis de flujos, ballenas y concentración en crypto.",
      advanced: "Flujos netos a exchanges y realized cap para timing de régimen.",
    },
    en: {
      word: "on-chain",
      beginner: "Public blockchain data: flows and exchange balances.",
      intermediate: "Analysis of whale flows and concentration.",
      advanced: "Exchange net flows and realized cap for regime timing.",
    },
  },
  {
    match: ["ballenas", "whales", "grandes tenedores"],
    es: {
      word: "ballenas",
      beginner: "Inversores con montos enormes que pueden mover el precio.",
      intermediate: "Wallets grandes; movimientos a exchanges anticipan ventas.",
      advanced: "Concentración de supply en top addresses.",
    },
    en: {
      word: "whales",
      beginner: "Large holders who can move prices when they trade.",
      intermediate: "High-balance wallets; exchange inflows precede selling.",
      advanced: "Supply concentration in top addresses.",
    },
  },
  {
    match: ["ETF", "fondo cotizado", "exchange-traded fund"],
    es: {
      word: "ETF",
      beginner: "Fondo que compra muchos activos y cotiza en bolsa.",
      intermediate: "Vehículo barato para exposición diversificada (SPY, QQQ).",
      advanced: "Wrapper con creación/redención; flujos mueven el underlying.",
    },
    en: {
      word: "ETF",
      beginner: "A fund holding many assets that trades like a stock.",
      intermediate: "Low-cost diversified exposure vehicle.",
      advanced: "Creation/redemption wrapper; flows move the underlying.",
    },
  },
  {
    match: ["múltiplos", "multiples", "PER", "P/E", "valoración"],
    es: {
      word: "múltiplos",
      beginner: "Cuántas veces el precio supera los beneficios; cara o barata.",
      intermediate: "Ratios P/E, EV/EBITDA; suben con crecimiento o tipos bajos.",
      advanced: "Compresión/expansión explica gran parte del retorno equity.",
    },
    en: {
      word: "multiples",
      beginner: "How many times price exceeds earnings.",
      intermediate: "P/E, EV/EBITDA ratios expand with growth or lower rates.",
      advanced: "Multiple expansion/compression drives equity returns.",
    },
  },
  {
    match: ["beneficios", "earnings", "resultados", "ganancias corporativas"],
    es: {
      word: "beneficios",
      beginner: "Dinero que ganan las empresas; sorpresas al alza mueven la acción.",
      intermediate: "Earnings y guidance; temporada de resultados mueve sectores.",
      advanced: "EPS revisions y beat/miss alimentan modelos factoriales.",
    },
    en: {
      word: "earnings",
      beginner: "Money companies make; beats often lift the stock.",
      intermediate: "Earnings and guidance move sectors in reporting season.",
      advanced: "EPS revisions feed quality and growth factor models.",
    },
  },
  {
    match: ["consenso", "consensus", "expectativas"],
    es: {
      word: "consenso",
      beginner: "Lo que la mayoría de analistas espera antes de un dato.",
      intermediate: "Rango de pronósticos; sorpresas vs consenso mueven precios.",
      advanced: "Dispersión del consenso como señal de incertidumbre.",
    },
    en: {
      word: "consensus",
      beginner: "What most analysts expect before a release.",
      intermediate: "Forecast range; surprises vs consensus move prices.",
      advanced: "Consensus dispersion as uncertainty signal.",
    },
  },
  {
    match: ["cuantitativo", "quant", "quants", "quantitative models"],
    es: {
      word: "cuantitativo",
      beginner: "Análisis con datos y fórmulas, no solo opiniones.",
      intermediate: "Estrategias sistemáticas con señales estadísticas.",
      advanced: "Modelos factoriales y stat-arb con riesgo por volatilidad.",
    },
    en: {
      word: "quant",
      beginner: "Analysis driven by data and formulas.",
      intermediate: "Systematic strategies using statistical signals.",
      advanced: "Factor models and stat-arb with vol targeting.",
    },
  },
  {
    match: ["cripto", "crypto", "criptomonedas", "Bitcoin", "BTC", "Ethereum", "ETH"],
    es: {
      word: "cripto",
      beginner: "Monedas digitales muy volátiles, sensibles al apetito por riesgo.",
      intermediate: "Activos 24/7; correlacionan con liquidez global.",
      advanced: "Clase de activo con beta variable vs NASDAQ y DXY.",
    },
    en: {
      word: "crypto",
      beginner: "Digital assets like Bitcoin — volatile and risk-sensitive.",
      intermediate: "24/7 assets correlating with global liquidity.",
      advanced: "Asset class with variable beta to NASDAQ and DXY.",
    },
  },
  {
    match: ["oro", "gold", "GLD"],
    es: {
      word: "oro",
      beginner: "Metal refugio cuando hay miedo; sube si bajan tipos reales.",
      intermediate: "Hedge vs inflación y tensión geopolítica.",
      advanced: "Activo real con correlación negativa a tipos reales y DXY.",
    },
    en: {
      word: "gold",
      beginner: "Safe-haven metal; often rises when fear increases.",
      intermediate: "Hedge vs inflation and geopolitical stress.",
      advanced: "Real asset negatively correlated to real rates and DXY.",
    },
  },
  {
    match: ["petróleo", "petroleo", "crudo", "oil", "WTI", "Brent"],
    es: {
      word: "petróleo",
      beginner: "Combustible clave; si sube, encarece transporte e inflación.",
      intermediate: "Commodity cíclico ligado a OPEP+ y demanda global.",
      advanced: "Shock de oferta/demanda que repricea inflación breakeven.",
    },
    en: {
      word: "oil",
      beginner: "Key fuel; rising oil makes transport and inflation pricier.",
      intermediate: "Cyclical commodity tied to OPEC+ and global demand.",
      advanced: "Supply/demand shock repricing breakeven inflation.",
    },
  },
  {
    match: ["dólar", "dolar", "USD", "DXY", "dollar"],
    es: {
      word: "dólar",
      beginner: "Moneda de referencia; fuerte presiona commodities y emergentes.",
      intermediate: "DXY refleja fortaleza USD; impacta exportadores.",
      advanced: "Factor de liquidez global; USD fuerte correlaciona con risk-off.",
    },
    en: {
      word: "dollar",
      beginner: "World reserve currency; strength pressures commodities and EM.",
      intermediate: "DXY tracks USD strength; impacts exporters.",
      advanced: "Global liquidity factor; strong USD correlates with risk-off.",
    },
  },
  {
    match: [
      "recorte de tipos",
      "bajada de tipos",
      "rate cut",
      "rate cuts",
      "easing",
      "relajación monetaria",
    ],
    es: {
      word: "recorte de tipos",
      beginner: "El banco central hace más barato pedir dinero prestado.",
      intermediate: "Política expansiva que impulsa growth y crypto.",
      advanced: "Ciclo de easing que comprime primas de riesgo.",
    },
    en: {
      word: "rate cut",
      beginner: "Central bank makes borrowing cheaper.",
      intermediate: "Expansionary policy boosting growth assets.",
      advanced: "Easing cycle compressing risk premia.",
    },
  },
  {
    match: [
      "subida de tipos",
      "subida de tasas",
      "rate hike",
      "rate hikes",
      "tightening",
      "apretón monetario",
    ],
    es: {
      word: "subida de tipos",
      beginner: "El banco central encarece el crédito para frenar inflación.",
      intermediate: "Giro hawkish que presiona valuations.",
      advanced: "Endurecimiento que eleva coste de capital.",
    },
    en: {
      word: "rate hike",
      beginner: "Central bank makes credit more expensive.",
      intermediate: "Hawkish shift pressuring valuations.",
      advanced: "Tightening raising the cost of capital.",
    },
  },
];

export function getFinanceGlossary(locale: Locale): AnalysisTerms[] {
  return CORE_GLOSSARY.map((entry) => entry[locale]);
}

export function getFinanceGlossaryMatches(locale: Locale): AnalysisTerms[] {
  const definitions = (entry: BilingualGlossaryEntry) => entry[locale];
  const terms: AnalysisTerms[] = [];

  for (const entry of CORE_GLOSSARY) {
    const def = definitions(entry);
    for (const variant of entry.match) {
      terms.push({
        word: variant,
        beginner: def.beginner,
        intermediate: def.intermediate,
        advanced: def.advanced,
      });
    }
  }

  return terms.sort((a, b) => b.word.length - a.word.length);
}
