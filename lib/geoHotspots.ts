import type { GdeltEvent } from "@/lib/marketData/gdelt";
import type { StructuredAnalysis } from "@/lib/marketAnalysis";

export type GeoHotspot = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** 1 = mild, 2 = elevated, 3 = critical */
  intensity: 1 | 2 | 3;
  headline: string;
  explanation: string;
  relatedAssets: string[];
};

type GeoZone = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radiusDeg: number;
  keywords: string[];
  assetHints: Record<string, string>;
  defaultHeadline: string;
  defaultExplanation: (assets: string[]) => string;
};

type ProfileAssets = {
  crypto?: string[];
  stocks?: string[];
  etfs?: string[];
  metals?: string[];
};

const GEO_ZONES: GeoZone[] = [
  {
    id: "eastern-europe",
    name: "Ucrania / Europa del Este",
    lat: 49,
    lon: 32,
    radiusDeg: 18,
    keywords: [
      "ukraine",
      "ucrania",
      "russia",
      "rusia",
      "nato",
      "europe",
      "europa",
      "war",
      "guerra",
    ],
    assetHints: {
      "MSCI World": "Los fondos globales absorben el riesgo geopolítico europeo.",
      "S&P Europe 350": "Las tensiones en la frontera oriental pesan sobre el bloque europeo.",
      Oro: "El oro suele actuar como refugio cuando sube el riesgo en Europa del Este.",
      "S&P 500 (SPY)": "La energía y la defensa arrastran sectores del índice amplio.",
    },
    defaultHeadline: "Tensión geopolítica en Europa del Este",
    defaultExplanation: (assets) =>
      `El conflicto y las sanciones en la región elevan el coste de la energía y el riesgo en mercados europeos. Para tu cartera (${assets.join(", ")}), esto puede mover tipos de interés, defensa y materias primas.`,
  },
  {
    id: "middle-east",
    name: "Oriente Medio",
    lat: 28,
    lon: 46,
    radiusDeg: 22,
    keywords: [
      "israel",
      "gaza",
      "iran",
      "irán",
      "middle east",
      "oriente medio",
      "oil",
      "petróleo",
      "red sea",
      "mar rojo",
      "hormuz",
    ],
    assetHints: {
      Oro: "El oro reacciona rápido a choques en Oriente Medio.",
      Plata: "La plata sigue el sentimiento de riesgo ligado al petróleo.",
      Tesla: "El coste energético y la cadena de suministro pueden afectar márgenes.",
      Bitcoin: "En crisis geopolíticas, el crypto oscila entre refugio y venta forzada.",
    },
    defaultHeadline: "Presión en Oriente Medio",
    defaultExplanation: (assets) =>
      `Los titulares de la región mueven el petróleo y el apetito por riesgo. Con ${assets.join(", ")} en cartera, vigila si el crudo dispara inflación o si el oro/crypto captan flujos defensivos.`,
  },
  {
    id: "us-policy",
    name: "EE.UU. / política y Fed",
    lat: 38.9,
    lon: -77,
    radiusDeg: 20,
    keywords: [
      "federal reserve",
      "fed",
      "treasury",
      "tariff",
      "aranceles",
      "trump",
      "inflation",
      "inflación",
      "rate",
      "tipos",
      "sec",
    ],
    assetHints: {
      "Nasdaq (QQQ)": "La Fed y la regulación tech mueven el Nasdaq con fuerza.",
      Apple: "Tipos altos y aranceles a China impactan márgenes y múltiplos.",
      Nvidia: "La política de chips y tipos condicionan el sector IA.",
      Bitcoin: "La Fed marca el coste del dinero — clave para activos de riesgo.",
    },
    defaultHeadline: "Decisiones macro en Washington",
    defaultExplanation: (assets) =>
      `Tipos, inflación y aranceles desde EE.UU. marcan el tono global. Tus activos (${assets.join(", ")}) suelen reaccionar primero a sorpresas de la Fed o a nuevas medidas comerciales.`,
  },
  {
    id: "china-asia",
    name: "China / Asia-Pacífico",
    lat: 35,
    lon: 105,
    radiusDeg: 24,
    keywords: [
      "china",
      "taiwan",
      "taiwán",
      "beijing",
      "semiconductor",
      "semiconductor",
      "asia",
      "trade",
      "comercio",
      "tariff",
    ],
    assetHints: {
      Apple: "La demanda china y la cadena de suministro pesan en el valor.",
      Nvidia: "Restricciones de exportación de chips son un catalizador directo.",
      "S&P 500 (SPY)": "Muchas multinacionales del índice dependen de ventas en Asia.",
      Bitcoin: "El sentimiento en Asia influye en volumen y liquidez crypto.",
    },
    defaultHeadline: "Riesgo comercial y tecnológico en Asia",
    defaultExplanation: (assets) =>
      `China condiciona manufactura, chips y comercio global. Para ${assets.join(", ")}, los aranceles o tensiones en Taiwán pueden golpear crecimiento y márgenes.`,
  },
  {
    id: "latam",
    name: "América Latina",
    lat: -15,
    lon: -58,
    radiusDeg: 20,
    keywords: [
      "brazil",
      "brasil",
      "argentina",
      "mexico",
      "méxico",
      "latin",
      "latam",
      "commodit",
    ],
    assetHints: {
      "S&P 500 (SPY)": "Las materias primas latinoamericanas alimentan inflación global.",
      Oro: "La demanda de metales desde la región afecta precios internacionales.",
    },
    defaultHeadline: "Volatilidad macro en Latinoamérica",
    defaultExplanation: (assets) =>
      `Devaluaciones y política fiscal en la región mueven commodities. Si tienes ${assets.join(", ")}, los movimientos en materias primas pueden filtrarse a tu cartera.`,
  },
];

function flattenAssets(profile: { selected_assets?: ProfileAssets | null } | null): string[] {
  if (!profile?.selected_assets) return ["mercados generales"];
  const { crypto = [], stocks = [], etfs = [], metals = [] } = profile.selected_assets;
  const all = [...crypto, ...stocks, ...etfs, ...metals];
  return all.length > 0 ? all : ["mercados generales"];
}

function eventMatchesZone(event: GdeltEvent, zone: GeoZone): boolean {
  const haystack = `${event.event} ${event.country}`.toLowerCase();
  return zone.keywords.some((kw) => haystack.includes(kw));
}

function scoreZone(events: GdeltEvent[], zone: GeoZone): number {
  let score = 0;
  for (const event of events) {
    if (!eventMatchesZone(event, zone)) continue;
    score += event.tone === "negativo" ? 3 : event.tone === "neutral" ? 1 : 0.5;
  }
  return score;
}

function intensityFromScore(score: number): 1 | 2 | 3 {
  if (score >= 6) return 3;
  if (score >= 2.5) return 2;
  return 1;
}

function assetImpactSentence(assets: string[], zone: GeoZone): string | null {
  for (const asset of assets) {
    const hint = zone.assetHints[asset];
    if (hint) return hint;
  }
  return null;
}

function analysisSnippetForZone(
  zone: GeoZone,
  analysis: StructuredAnalysis | null | undefined,
): string | null {
  const events = analysis?.three_layers?.layer_1_what_happened?.events ?? [];
  const zoneName = zone.name.toLowerCase();
  for (const event of events) {
    const blob = `${event.event} ${event.where} ${event.impact_on_user}`.toLowerCase();
    if (zone.keywords.some((kw) => blob.includes(kw)) || blob.includes(zoneName.split("/")[0].trim())) {
      return event.impact_on_user || event.event;
    }
  }
  return null;
}

function buildExplanation(
  zone: GeoZone,
  assets: string[],
  matchedEvents: GdeltEvent[],
  analysis: StructuredAnalysis | null | undefined,
): string {
  const fromAnalysis = analysisSnippetForZone(zone, analysis);
  if (fromAnalysis) return fromAnalysis;

  const assetLine = assetImpactSentence(assets, zone);
  const eventLine =
    matchedEvents[0]?.event ??
    zone.defaultExplanation(assets);

  if (assetLine) {
    return `${eventLine} ${assetLine}`;
  }
  return typeof eventLine === "string" ? eventLine : zone.defaultExplanation(assets);
}

/** Map GDELT + profile into interactive globe hotspots (no extra API call). */
export function buildGeoHotspots(
  gdeltEvents: GdeltEvent[],
  profile: { selected_assets?: ProfileAssets | null } | null,
  analysis?: StructuredAnalysis | null,
): GeoHotspot[] {
  const assets = flattenAssets(profile);

  const scored = GEO_ZONES.map((zone) => {
    const matched = gdeltEvents.filter((e) => eventMatchesZone(e, zone));
    const score = scoreZone(gdeltEvents, zone);
    const baseIntensity = intensityFromScore(score);
    // Always show at least mild hotspots on active zones; boost if GDELT quiet
    const intensity = (
      matched.length === 0 && score < 1 ? Math.max(1, baseIntensity) : baseIntensity
    ) as 1 | 2 | 3;

    return {
      zone,
      matched,
      score,
      intensity,
    };
  })
    .filter((item) => item.score >= 0.5 || item.matched.length > 0)
    .sort((a, b) => b.score - a.score);

  const top = scored.length > 0 ? scored : GEO_ZONES.slice(0, 4).map((zone) => ({
    zone,
    matched: [] as GdeltEvent[],
    score: 1,
    intensity: 1 as const,
  }));

  return top.slice(0, 6).map(({ zone, matched, intensity }) => ({
    id: zone.id,
    name: zone.name,
    lat: zone.lat,
    lon: zone.lon,
    intensity,
    headline: matched[0]?.event?.slice(0, 120) ?? zone.defaultHeadline,
    explanation: buildExplanation(zone, assets, matched, analysis),
    relatedAssets: assets.filter((a) => zone.assetHints[a]).slice(0, 4),
  }));
}
