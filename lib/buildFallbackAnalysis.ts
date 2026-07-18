import type { StructuredAnalysis } from "@/lib/marketAnalysis";
import type { AnalysisContext } from "@/lib/marketAnalysisPrompt";
import { mergeAnalysisTerms } from "@/lib/mergeAnalysisTerms";

function clip(text: string, max = 280): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}…`;
}

function firstMeaningfulLine(block: string, fallback: string): string {
  for (const line of block.split("\n")) {
    const trimmed = line.replace(/^[-•*]\s*/, "").trim();
    if (trimmed.length > 12) {
      return clip(trimmed);
    }
  }
  return fallback;
}

export function buildFallbackAnalysis(
  userName: string,
  ctx: AnalysisContext,
): StructuredAnalysis {
  const now = new Date().toISOString();

  const worldEvent = firstMeaningfulLine(
    ctx.gdelt_events_formatted,
    "El contexto global sigue marcado por macroeconomía, geopolítica y flujos de riesgo.",
  );
  const macroLine = firstMeaningfulLine(
    ctx.fed_calendar_events,
    "Los bancos centrales y los datos macro siguen siendo el marco de referencia del día.",
  );
  const technical = firstMeaningfulLine(
    ctx.technical_analysis,
    "Los precios muestran movimiento dentro del rango reciente; conviene leerlo junto al contexto macro.",
  );
  const onchain = firstMeaningfulLine(
    ctx.onchain_metrics,
    "En crypto, volumen y dominancia ayudan a ver si el movimiento tiene convicción o es ruido.",
  );
  const experts = firstMeaningfulLine(
    ctx.analyst_consensus,
    "Las opiniones de analistas siguen divididas; el consenso cambia cuando llegan datos nuevos.",
  );

  return {
    headline: `${userName}, esto es lo que dicen los datos de hoy`,
    three_layers: {
      layer_1_what_happened: {
        title: "¿Qué pasó?",
        events: [
          {
            event: worldEvent,
            where: "Global",
            impact_on_user: macroLine,
            evidence: clip(
              ctx.gdelt_events_formatted || ctx.fed_calendar_events,
              400,
            ),
          },
        ],
      },
      layer_2_what_price_says: {
        title: "¿Qué dice el precio?",
        technical,
        onchain,
        pattern: firstMeaningfulLine(
          ctx.asset_prices_today,
          "Revisa el cambio del día en tus activos y compáralo con el mes.",
        ),
      },
      layer_3_what_experts_think: {
        title: "¿Qué dicen los expertos?",
        fundamental: experts,
        quants: clip(ctx.historical_context_12m, 280) ||
          "El contexto de 12 meses ayuda a separar ruido de tendencia.",
        range: "Los rangos de consenso suelen ampliarse cuando aumenta la incertidumbre.",
        humility:
          "Este resumen se generó con datos de mercado cuando el modelo no pudo completar el análisis narrativo.",
      },
    },
    narrative: clip(
      `${ctx.asset_prices_today}\n\n${ctx.historical_context_12m}`.trim(),
      800,
    ) || "Los mercados combinan noticias, precios y expectativas; hoy el foco está en leer esas tres capas juntas.",
    action_insight: clip(
      ctx.analyst_consensus ||
        "Vigila tus activos clave y los indicadores macro que más te importan; un solo día no define tu plan.",
      280,
    ),
    terms: mergeAnalysisTerms([], "es"),
    meta: {
      confidence: "media-baja",
      sources: "Finnhub, CoinGecko, FRED, GDELT (resumen automático)",
      last_updated: now,
    },
  };
}
