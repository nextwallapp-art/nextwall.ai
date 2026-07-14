import type { Locale } from "@/lib/i18n/translations";

type AssetKnowledge = {
  topProduct: string;
  revenueDrivers: string[];
  description: string;
};

const knowledgeEn: Record<string, AssetKnowledge> = {
  AAPL: {
    topProduct: "iPhone",
    revenueDrivers: [
      "iPhone hardware sales (~50% of revenue)",
      "Services: App Store, iCloud, Apple Pay, subscriptions",
      "Mac and iPad for productivity and education",
      "Wearables: Apple Watch and AirPods",
    ],
    description:
      "Apple designs consumer electronics and software. Most profit comes from selling premium devices and growing high-margin services.",
  },
  NVDA: {
    topProduct: "Data-center AI GPUs (H100 / Blackwell)",
    revenueDrivers: [
      "AI data-center GPUs sold to cloud giants and enterprises",
      "Gaming graphics cards (GeForce)",
      "Automotive and robotics chips",
      "CUDA software ecosystem locking in developers",
    ],
    description:
      "Nvidia dominates AI accelerator chips. Demand from hyperscalers training large models drives most revenue growth.",
  },
  TSLA: {
    topProduct: "Model Y",
    revenueDrivers: [
      "Electric vehicle deliveries (Model 3/Y/S/X)",
      "Energy storage and solar installations",
      "Full Self-Driving software subscriptions",
      "Regulatory credits sold to other automakers",
    ],
    description:
      "Tesla earns most revenue from EV sales, with energy and software adding higher-margin upside.",
  },
  AMZN: {
    topProduct: "Amazon Web Services (AWS)",
    revenueDrivers: [
      "North America and international e-commerce",
      "AWS cloud infrastructure (highest operating profit)",
      "Advertising on Amazon.com",
      "Prime memberships and logistics network",
    ],
    description:
      "Amazon's retail volume is huge, but AWS and advertising generate a large share of operating profit.",
  },
  MSFT: {
    topProduct: "Microsoft Cloud (Azure + Office 365)",
    revenueDrivers: [
      "Azure cloud infrastructure",
      "Office 365 and enterprise productivity",
      "LinkedIn and Dynamics business software",
      "Windows licensing and Xbox gaming",
    ],
    description:
      "Microsoft shifted from Windows to cloud subscriptions. Enterprise software and Azure drive recurring revenue.",
  },
  GOOGL: {
    topProduct: "Google Search advertising",
    revenueDrivers: [
      "Search and YouTube ad auctions",
      "Google Cloud (GCP) for enterprises",
      "Android Play Store and Pixel hardware",
      "Waymo and Other Bets (long-term)",
    ],
    description:
      "Alphabet still earns most money from digital ads, while Google Cloud is the fastest-growing profit engine.",
  },
  SPY: {
    topProduct: "S&P 500 index basket",
    revenueDrivers: [
      "Tracks 500 largest US companies",
      "Heavy weight in mega-cap tech (Apple, Microsoft, Nvidia)",
      "Broad US economic exposure across sectors",
      "Low-cost passive fund flows from long-term investors",
    ],
    description:
      "SPY is an ETF that mirrors the S&P 500 — a benchmark for the overall US stock market.",
  },
  QQQ: {
    topProduct: "Nasdaq-100 index basket",
    revenueDrivers: [
      "Mega-cap technology and growth stocks",
      "Concentrated in Apple, Microsoft, Nvidia, Amazon",
      "Sensitive to rate cuts and earnings surprises",
      "Global demand for US tech leadership",
    ],
    description:
      "QQQ tracks the Nasdaq-100, giving concentrated exposure to large US technology companies.",
  },
  GLD: {
    topProduct: "Physical gold bullion backing",
    revenueDrivers: [
      "Gold price movements (rates, inflation, USD)",
      "Safe-haven demand during geopolitical stress",
      "Central bank buying and jewelry/industrial demand",
      "ETF inflows from portfolio hedging",
    ],
    description:
      "GLD holds physical gold. It rises when investors seek protection from inflation or market stress.",
  },
  SLV: {
    topProduct: "Physical silver bullion backing",
    revenueDrivers: [
      "Silver spot price (industrial + precious metal demand)",
      "Solar panel and electronics industrial usage",
      "Gold/silver ratio and inflation hedging",
      "ETF inflows from commodity allocators",
    ],
    description:
      "SLV tracks silver prices. Silver blends precious-metal hedging with industrial demand.",
  },
  BTC: {
    topProduct: "Bitcoin network (BTC)",
    revenueDrivers: [
      "Scarce supply capped at 21 million coins",
      "Institutional ETF and corporate treasury demand",
      "Risk-on flows when liquidity improves",
      "Halving cycles reducing new supply issuance",
    ],
    description:
      "Bitcoin is a decentralized digital asset often used as a macro liquidity and risk sentiment barometer.",
  },
  ETH: {
    topProduct: "Ethereum network (ETH)",
    revenueDrivers: [
      "DeFi and stablecoin activity on Ethereum",
      "NFT and gaming applications (cyclical)",
      "Layer-2 scaling ecosystems (Arbitrum, Base)",
      "Staking yields after the Merge upgrade",
    ],
    description:
      "Ethereum is a programmable blockchain. Fees and staking demand grow with on-chain financial activity.",
  },
  SOL: {
    topProduct: "Solana blockchain (SOL)",
    revenueDrivers: [
      "High-speed DeFi and memecoin trading volumes",
      "Mobile and consumer crypto apps (e.g. wallets)",
      "NFT and gaming projects on Solana",
      "Validator staking participation",
    ],
    description:
      "Solana targets fast, low-cost transactions. Activity spikes when retail crypto trading heats up.",
  },
};

const knowledgeEs: Record<string, AssetKnowledge> = {
  AAPL: {
    topProduct: "iPhone",
    revenueDrivers: [
      "Ventas de iPhone (~50% de los ingresos)",
      "Servicios: App Store, iCloud, Apple Pay, suscripciones",
      "Mac e iPad para productividad y educación",
      "Wearables: Apple Watch y AirPods",
    ],
    description:
      "Apple diseña electrónica de consumo y software. La mayor parte del beneficio viene de dispositivos premium y servicios de alto margen.",
  },
  NVDA: {
    topProduct: "GPUs de IA para data centers (H100 / Blackwell)",
    revenueDrivers: [
      "GPUs de IA vendidas a nubes y empresas",
      "Tarjetas gráficas gaming (GeForce)",
      "Chips para automoción y robótica",
      "Ecosistema CUDA que fideliza desarrolladores",
    ],
    description:
      "Nvidia domina los chips de IA. La demanda de hyperscalers entrenando modelos impulsa el crecimiento.",
  },
  TSLA: {
    topProduct: "Model Y",
    revenueDrivers: [
      "Entregas de vehículos eléctricos (Model 3/Y/S/X)",
      "Almacenamiento de energía e instalaciones solares",
      "Suscripciones de software Full Self-Driving",
      "Créditos regulatorios vendidos a otros fabricantes",
    ],
    description:
      "Tesla gana la mayor parte con ventas de coches eléctricos; energía y software aportan margen adicional.",
  },
  AMZN: {
    topProduct: "Amazon Web Services (AWS)",
    revenueDrivers: [
      "E-commerce en Norteamérica e internacional",
      "Infraestructura cloud AWS (mayor beneficio operativo)",
      "Publicidad en Amazon.com",
      "Membresías Prime y red logística",
    ],
    description:
      "El volumen retail de Amazon es enorme, pero AWS y la publicidad generan gran parte del beneficio.",
  },
  MSFT: {
    topProduct: "Microsoft Cloud (Azure + Office 365)",
    revenueDrivers: [
      "Infraestructura cloud Azure",
      "Office 365 y productividad empresarial",
      "LinkedIn y Dynamics",
      "Licencias Windows y Xbox",
    ],
    description:
      "Microsoft migró de Windows a suscripciones cloud. Azure y software empresarial impulsan ingresos recurrentes.",
  },
  GOOGL: {
    topProduct: "Publicidad en Google Search",
    revenueDrivers: [
      "Anuncios en Search y YouTube",
      "Google Cloud (GCP) para empresas",
      "Play Store Android y hardware Pixel",
      "Waymo y Other Bets (largo plazo)",
    ],
    description:
      "Alphabet sigue ganando sobre todo con publicidad digital; Google Cloud es el motor de crecimiento.",
  },
  SPY: {
    topProduct: "Cesta del índice S&P 500",
    revenueDrivers: [
      "Replica las 500 mayores empresas de EE.UU.",
      "Peso elevado en mega caps tech (Apple, Microsoft, Nvidia)",
      "Exposición amplia a la economía estadounidense",
      "Flujos pasivos de inversores a largo plazo",
    ],
    description:
      "SPY es un ETF que sigue el S&P 500 — referencia del mercado bursátil estadounidense.",
  },
  QQQ: {
    topProduct: "Cesta del Nasdaq-100",
    revenueDrivers: [
      "Mega caps tecnológicas y de crecimiento",
      "Concentrado en Apple, Microsoft, Nvidia, Amazon",
      "Sensible a recortes de tipos y resultados",
      "Demanda global por liderazgo tech de EE.UU.",
    ],
    description:
      "QQQ sigue el Nasdaq-100, con exposición concentrada a grandes tecnológicas estadounidenses.",
  },
  GLD: {
    topProduct: "Oro físico en custodia",
    revenueDrivers: [
      "Precio del oro (tipos, inflación, dólar)",
      "Demanda refugio ante tensiones geopolíticas",
      "Compras de bancos centrales y joyería/industria",
      "Entradas al ETF como cobertura de cartera",
    ],
    description:
      "GLD posee oro físico. Sube cuando los inversores buscan protección ante inflación o estrés de mercado.",
  },
  SLV: {
    topProduct: "Plata física en custodia",
    revenueDrivers: [
      "Precio spot de la plata (industrial + metal precioso)",
      "Demanda industrial (paneles solares, electrónica)",
      "Ratio oro/plata y cobertura inflacionaria",
      "Flujos al ETF desde inversores en commodities",
    ],
    description:
      "SLV replica el precio de la plata, mezcla cobertura y demanda industrial.",
  },
  BTC: {
    topProduct: "Red Bitcoin (BTC)",
    revenueDrivers: [
      "Oferta limitada a 21 millones de monedas",
      "Demanda institucional vía ETFs y tesorerías corporativas",
      "Flujos risk-on cuando mejora la liquidez",
      "Halvings que reducen la emisión nueva",
    ],
    description:
      "Bitcoin es un activo digital descentralizado, usado como barómetro de liquidez y apetito por riesgo.",
  },
  ETH: {
    topProduct: "Red Ethereum (ETH)",
    revenueDrivers: [
      "Actividad DeFi y stablecoins en Ethereum",
      "NFTs y gaming (cíclico)",
      "Ecosistemas Layer-2 (Arbitrum, Base)",
      "Staking tras la actualización Merge",
    ],
    description:
      "Ethereum es una blockchain programable. Las comisiones y el staking crecen con la actividad on-chain.",
  },
  SOL: {
    topProduct: "Blockchain Solana (SOL)",
    revenueDrivers: [
      "DeFi y trading retail de alta velocidad",
      "Apps crypto móviles y wallets",
      "NFTs y gaming en Solana",
      "Participación en staking de validadores",
    ],
    description:
      "Solana apunta a transacciones rápidas y baratas. La actividad sube cuando el retail crypto se calienta.",
  },
};

export function getAssetKnowledge(
  symbol: string,
  locale: Locale,
): AssetKnowledge | null {
  const key = symbol.toUpperCase();
  const table = locale === "es" ? knowledgeEs : knowledgeEn;
  return table[key] ?? null;
}
