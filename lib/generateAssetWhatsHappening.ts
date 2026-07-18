import Anthropic from "@anthropic-ai/sdk";
import type { Locale } from "@/lib/i18n/translations";
import { getAssetKnowledge } from "@/lib/assetKnowledge";

type NewsItem = {
  headline: string;
  summary: string;
};

type GenerateInput = {
  symbol: string;
  name: string;
  type: "stock" | "crypto";
  locale: Locale;
  experienceLevel: string | null;
  price: number | null;
  changePercent: number | null;
  industry: string | null;
  microInsight: string | null;
  news: NewsItem[];
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

function buildFallbackWhatsHappening(input: GenerateInput): string {
  const knowledge = getAssetKnowledge(input.symbol, input.locale);
  const parts: string[] = [];
  const isEs = input.locale === "es";

  if (input.microInsight) {
    parts.push(input.microInsight);
  }

  if (input.changePercent !== null) {
    const direction =
      input.changePercent >= 0
        ? isEs
          ? "sube"
          : "is up"
        : isEs
          ? "baja"
          : "is down";
    const move = `${input.name} ${direction} ${Math.abs(input.changePercent).toFixed(2)}% hoy.`;
    if (!parts.some((p) => p.includes(input.name))) {
      parts.push(move);
    }
  }

  if (input.news.length > 0) {
    const headline = input.news[0].headline;
    parts.push(
      isEs
        ? `En titulares recientes: ${headline}`
        : `Recent headlines: ${headline}`,
    );
  }

  if (knowledge?.topProduct) {
    parts.push(
      isEs
        ? `Su principal motor de ingresos sigue siendo ${knowledge.topProduct}.`
        : `Its main revenue driver remains ${knowledge.topProduct}.`,
    );
  }

  if (knowledge?.description) {
    parts.push(knowledge.description);
  }

  if (parts.length === 0) {
    return isEs
      ? "No hay contexto adicional disponible para este activo en este momento."
      : "No additional context is available for this asset right now.";
  }

  return parts.join("\n\n");
}

function buildPrompt(input: GenerateInput): string {
  const level =
    LEVEL_LABELS[input.experienceLevel ?? ""] ??
    input.experienceLevel ??
    "Intermedio";
  const language = input.locale === "es" ? "español" : "inglés";
  const knowledge = getAssetKnowledge(input.symbol, input.locale);
  const newsBlock =
    input.news.length > 0
      ? input.news
          .slice(0, 4)
          .map((n) => `- ${n.headline}: ${n.summary}`)
          .join("\n")
      : "Sin titulares recientes disponibles.";

  return `Eres el analista de NextWall. Explica QUÉ ESTÁ PASANDO HOY con un activo concreto del usuario.

ACTIVO: ${input.name} (${input.symbol}) — tipo ${input.type}
NIVEL DEL USUARIO: ${level}
IDIOMA DE RESPUESTA: ${language}

DATOS DE MERCADO:
- Precio: ${input.price ?? "N/D"}
- Variación hoy: ${input.changePercent !== null ? `${input.changePercent.toFixed(2)}%` : "N/D"}
- Sector/industria: ${input.industry ?? "N/D"}
- Insight breve del día: ${input.microInsight ?? "N/D"}
- Principal fuente de ingresos: ${knowledge?.topProduct ?? "N/D"}

TITULARES RECIENTES:
${newsBlock}

REGLAS:
- Escribe SOLO sobre ${input.name}, no sobre el mercado en general
- 2 o 3 párrafos cortos (máximo 3 frases cada uno)
- Párrafo 1: qué está pasando hoy con este activo
- Párrafo 2: por qué (macro, sector, noticias, sentimiento)
- Párrafo 3: qué debería entender un inversor ${level.toLowerCase()} — sin recomendar comprar o vender
- Tono directo, sin frases vacías
- Devuelve ÚNICAMENTE JSON válido: {"whats_happening": "texto con párrafos separados por \\n\\n"}`;
}

function parseWhatsHappeningJson(raw: string): string {
  const trimmed = raw.trim();
  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return trimmed;
    }
    parsed = JSON.parse(trimmed.slice(start, end + 1));
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    typeof (parsed as { whats_happening?: unknown }).whats_happening ===
      "string"
  ) {
    return (parsed as { whats_happening: string }).whats_happening.trim();
  }

  return trimmed;
}

export async function generateAssetWhatsHappening(
  input: GenerateInput,
  apiKey: string | undefined,
): Promise<string> {
  // Sin Claude por defecto — cada clic en un activo era otra llamada de pago.
  // Usa titulares, microInsight del dashboard y conocimiento estático.
  void apiKey;
  return buildFallbackWhatsHappening(input);
}

export async function fetchCompanyNews(
  finnhubKey: string,
  symbol: string,
): Promise<NewsItem[]> {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${fmt(from)}&to=${fmt(to)}&token=${finnhubKey}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const payload = (await res.json()) as Array<{
      headline?: string;
      summary?: string;
    }>;

    return payload
      .filter((item) => item.headline)
      .slice(0, 5)
      .map((item) => ({
        headline: item.headline ?? "",
        summary: item.summary ?? "",
      }));
  } catch {
    return [];
  }
}
