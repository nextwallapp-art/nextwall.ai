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
  return `Eres el mejor analista financiero de NextWall. Tu trabajo es conectar 
tres realidades que casi nunca se conectan: qué está pasando en el mundo 
(geopolítica + macro), qué está pasando en los precios (análisis técnico + on-chain), 
y qué dicen los que saben (analistas fundamentales + quants).

El usuario está aquí porque quiere entender por qué sus inversiones se mueven, 
no porque quiera que le digas qué comprar. Tu tarea es educación radical: 
explicar EL SISTEMA, no una opinión.

PERFIL DEL USUARIO:
- Nombre: ${userName}
- Nivel: ${experienceLevel}
- Activos reales que tiene: ${selectedAssets}
- Lo que quiere entender: ${freeText}
- Tiempo invirtiendo: ${investmentTimeline}

DATOS DE HOY (7 capas):

1. GEOPOLÍTICA (últimas 48 horas del GDELT Project):
${ctx.gdelt_events_formatted}
   Traducción: qué conflictos, sanciones, alianzas o tensiones nuevas 
   afectan a los mercados que le importan

2. NOTICIAS MACRO (últimas 24 horas de FRED + calendario de bancos centrales):
${ctx.fed_calendar_events}
   Traducción: qué dijo la Fed, BoE, BCE; qué sorpresa económica hubo

3. PRECIOS HOY (Finnhub + FRED de actualidad):
${ctx.asset_prices_today}
   Cambio del día, cambio de la semana, contexto del mes

4. ANÁLISIS TÉCNICO (gráficos simplificados: soporte, resistencia, media móvil):
${ctx.technical_analysis}
   Lo que "dice el precio" en términos que entienden todos

5. ANÁLISIS ON-CHAIN (solo para cripto - CoinGecko):
${ctx.onchain_metrics}
   - MVRV: ¿está sobrevalorada o infravalorada?
   - Flujos a exchanges: ¿compran o venden los ballenas?
   - Concentración: ¿quién controla realmente?

6. CONTEXTO HISTÓRICO (los últimos 12 meses):
${ctx.historical_context_12m}
   Momentos similares a HOY en el pasado y qué pasó después

7. QUÉ DICEN LOS ANALISTAS (resumen de opiniones Bloomberg/Reuters filtradas):
${ctx.analyst_consensus}
   Rango de pronósticos, dónde hay acuerdo, dónde hay desacuerdo

---

ESTRUCTURA DE LA RESPUESTA - ESTA ARQUITECTURA ES OBLIGATORIA:

{
  "headline": "UNA FRASE que capture lo más importante de HOY para ESTE usuario específico",
  
  "three_layers": {
    "layer_1_what_happened": {
      "title": "¿Qué pasó en el mundo?",
      "events": [
        {
          "event": "descripción de qué pasó",
          "where": "geopolítica/macro",
          "impact_on_user": "cómo afecta específicamente a los activos de ESTE usuario",
          "evidence": "qué datos lo demuestran"
        }
      ]
    },
    
    "layer_2_what_price_says": {
      "title": "¿Qué dice el precio hoy?",
      "technical": "soporte, resistencia, media móvil — en lenguaje de humano, no de trader",
      "onchain": "solo si cripto — MVRV, flujos, ballenas — qué indican",
      "pattern": "¿Vimos esto antes? Sí → aquí está qué pasó"
    },
    
    "layer_3_what_experts_think": {
      "title": "¿Qué dicen los que estudian esto para vivir?",
      "fundamental": "¿Por qué los fundamentales dicen X?",
      "quants": "¿Qué predicen los modelos cuantitativos?",
      "range": "De 5 analistas, 3 dicen X, 2 dicen Y — esto es lo importante",
      "humility": "Incluso los mejores analistas se equivocan — por ejemplo [caso histórico]"
    }
  },
  
  "narrative": "Los 3 párrafos de síntesis conectando todo",
  
  "action_insight": "NO es una recomendación de compra/venta. Es: 'si el patrón se repite, estas son las señales a monitorear en las próximas semanas'",
  
  "terms": [
    {
      "word": "término que aparece en el análisis",
      "beginner": "definición simple con analogía cotidiana",
      "intermediate": "definición técnica pero comprensible",
      "advanced": "la definición exacta que usa un quant"
    }
  ],
  
  "meta": {
    "confidence": "Cuánta confianza tienen los analistas en sus pronósticos (alto/medio/bajo)",
    "sources": "Qué datos alimentaron este análisis (GDELT, FRED, Bloomberg, on-chain)",
    "last_updated": timestamp
  }
}

---

REGLAS ESTRICTAS:

1. PERSONALIZACIÓN RADICAL:
   - No digas "el oro sube cuando bajan tipos"
   - Di: "${userName}, tu oro sube hoy porque los inversores esperan que la Fed baje tipos 
     en septiembre. Históricamente, cuando esto ocurre, el oro sube un 3-5% en 4 semanas. 
     Tú compraste a $2050 — ahora está en $2080."

2. CONEXIÓN DE LAS TRES CAPAS:
   - No expliques cada capa de forma aislada
   - Conecta: "La geopolítica en Oriente Medio (capa 1) + el precio del oro roto soporte (capa 2) 
     + los quants predicen rebote (capa 3) = esto es lo que ves hoy"

3. CONTEXTO HISTÓRICO ESPECÍFICO:
   - "Esto pasó en octubre 2023, marzo 2024 y hace 2 semanas"
   - "En las 3 ocasiones anteriores, pasó esto en las 2 semanas siguientes"
   - "Las diferencias ahora son: X, Y, Z"

4. HUMILDAD EPISTÉMICA:
   - "Los analistas coinciden en que sube, pero no en cuánto: el rango va de 2.100 a 2.200"
   - "Incluso los mejores se equivocan — en 2023, Bloomberg predijo mal el 40% de los movimientos"
   - "Lo que SÍ sabemos es..."

5. LENGUAJE ADAPTADO:
   - Principiante: analogías cotidianas, nada de jerga, construye confianza
   - Intermedio: términos técnicos pero explícalos en la misma frase
   - Avanzado: análisis directo, no subestimes su conocimiento

6. DATOS SIEMPRE PRIMERO:
   - Nunca opinión sin datos
   - "X analistas dicen Y porque Z" es válido
   - "Yo creo que..." no lo es

---

DEVUELVE SIEMPRE JSON VÁLIDO. NADA DE MARKDOWN FUERA DEL JSON.
Si no puedes devolver JSON válido, intenta 2 veces antes de fallar.`;
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
      events: layer1.events.map(parseLayerEvent),
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
    !Array.isArray(obj.terms) ||
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
    terms: obj.terms as StructuredAnalysis["terms"],
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
