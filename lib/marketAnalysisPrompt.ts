import type { StructuredAnalysis } from "@/lib/marketAnalysis";

export type AnalysisContext = {
  gdelt_events_formatted: string;
  fed_calendar_events: string;
  asset_prices_today: string;
  technical_analysis: string;
  onchain_metrics: string;
  historical_context_12m: string;
  analyst_consensus: string;
};

export function buildClaudeSystemPrompt(
  userName: string,
  experienceLevel: string,
  selectedAssets: string,
  freeText: string,
  investmentTimeline: string,
  ctx: AnalysisContext,
): string {
  return `Analista NextWall. Conecta macro/geopolítica, precio y consenso de analistas para ${userName} (${experienceLevel}).
Activos: ${selectedAssets}. Interés: ${freeText}. Timeline: ${investmentTimeline}.
Educar, no recomendar compra/venta. Español. Textos concisos (máx. 2-3 frases por campo).

DATOS:
Geopolítica: ${ctx.gdelt_events_formatted}
Macro: ${ctx.fed_calendar_events}
Precios: ${ctx.asset_prices_today}
Técnico: ${ctx.technical_analysis}
On-chain: ${ctx.onchain_metrics}
Histórico 12m: ${ctx.historical_context_12m}
Analistas: ${ctx.analyst_consensus}

JSON OBLIGATORIO (sin markdown, sin glosario "terms"):
{
  "headline": "una frase personalizada para ${userName}",
  "three_layers": {
    "layer_1_what_happened": {
      "title": "¿Qué pasó en el mundo?",
      "events": [{"event":"","where":"","impact_on_user":"","evidence":""}]
    },
    "layer_2_what_price_says": {
      "title": "¿Qué dice el precio hoy?",
      "technical": "",
      "onchain": "",
      "pattern": ""
    },
    "layer_3_what_experts_think": {
      "title": "¿Qué dicen los expertos?",
      "fundamental": "",
      "quants": "",
      "range": "",
      "humility": ""
    }
  },
  "narrative": "2 párrafos cortos conectando las 3 capas",
  "action_insight": "señales a vigilar, sin recomendar operar",
  "meta": {"confidence":"alto|medio|bajo","sources":"GDELT,FRED,Finnhub","last_updated":"ISO8601"}
}

Reglas: máx. 2 eventos en layer_1; personaliza impact_on_user a sus activos; datos antes que opinión.`;
}

function requireString(obj: Record<string, unknown>, key: string): string {
  const val = obj[key];
  if (typeof val !== "string") {
    throw new Error(`Missing or invalid field: ${key}`);
  }
  return val;
}

function parseLayerEvent(raw: unknown): StructuredAnalysis["three_layers"]["layer_1_what_happened"]["events"][number] {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid layer event");
  }
  const o = raw as Record<string, unknown>;
  return {
    event: requireString(o, "event"),
    where: requireString(o, "where"),
    impact_on_user: requireString(o, "impact_on_user"),
    evidence: requireString(o, "evidence"),
  };
}

function parseThreeLayers(raw: unknown): StructuredAnalysis["three_layers"] {
  if (!raw || typeof raw !== "object") {
    throw new Error("Missing three_layers");
  }
  const o = raw as Record<string, unknown>;

  const l1 = o.layer_1_what_happened;
  const l2 = o.layer_2_what_price_says;
  const l3 = o.layer_3_what_experts_think;

  if (!l1 || typeof l1 !== "object" || !l2 || typeof l2 !== "object" || !l3 || typeof l3 !== "object") {
    throw new Error("Invalid three_layers structure");
  }

  const layer1 = l1 as Record<string, unknown>;
  const layer2 = l2 as Record<string, unknown>;
  const layer3 = l3 as Record<string, unknown>;

  if (!Array.isArray(layer1.events)) {
    throw new Error("layer_1 events must be array");
  }

  return {
    layer_1_what_happened: {
      title: requireString(layer1, "title"),
      events: layer1.events.slice(0, 2).map(parseLayerEvent),
    },
    layer_2_what_price_says: {
      title: requireString(layer2, "title"),
      technical: requireString(layer2, "technical"),
      onchain: requireString(layer2, "onchain"),
      pattern: requireString(layer2, "pattern"),
    },
    layer_3_what_experts_think: {
      title: requireString(layer3, "title"),
      fundamental: requireString(layer3, "fundamental"),
      quants: requireString(layer3, "quants"),
      range: requireString(layer3, "range"),
      humility: requireString(layer3, "humility"),
    },
  };
}

function parseTerms(raw: unknown): StructuredAnalysis["terms"] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (term): term is StructuredAnalysis["terms"][number] =>
      !!term &&
      typeof term === "object" &&
      typeof (term as { word?: unknown }).word === "string",
  );
}

export function parseAnalysisJson(raw: string): StructuredAnalysis {
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
  const metaRaw = obj.meta;

  if (
    typeof obj.headline !== "string" ||
    typeof obj.narrative !== "string" ||
    typeof obj.action_insight !== "string" ||
    !metaRaw ||
    typeof metaRaw !== "object"
  ) {
    throw new Error("Analysis JSON missing required fields");
  }

  const meta = metaRaw as Record<string, unknown>;

  return {
    headline: obj.headline,
    three_layers: parseThreeLayers(obj.three_layers),
    narrative: obj.narrative,
    action_insight: obj.action_insight,
    terms: parseTerms(obj.terms),
    meta: {
      confidence: requireString(meta, "confidence"),
      sources: requireString(meta, "sources"),
      last_updated:
        typeof meta.last_updated === "string"
          ? meta.last_updated
          : new Date().toISOString(),
    },
  };
}
