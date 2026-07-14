export type AnalysisTerms = {
  word: string;
  beginner: string;
  intermediate: string;
  advanced: string;
};

export type LayerEvent = {
  event: string;
  where: string;
  impact_on_user: string;
  evidence: string;
};

export type ThreeLayers = {
  layer_1_what_happened: {
    title: string;
    events: LayerEvent[];
  };
  layer_2_what_price_says: {
    title: string;
    technical: string;
    onchain: string;
    pattern: string;
  };
  layer_3_what_experts_think: {
    title: string;
    fundamental: string;
    quants: string;
    range: string;
    humility: string;
  };
};

export type StructuredAnalysis = {
  headline: string;
  three_layers: ThreeLayers;
  narrative: string;
  action_insight: string;
  terms: AnalysisTerms[];
  meta: {
    confidence: string;
    sources: string;
    last_updated: string;
  };
};

export function analysisToFullText(analysis: StructuredAnalysis): string {
  const { three_layers: layers } = analysis;
  const layer1 = layers.layer_1_what_happened.events
    .map((e) => `${e.event} ${e.impact_on_user}`)
    .join("\n");
  return [
    layer1,
    layers.layer_2_what_price_says.technical,
    layers.layer_2_what_price_says.onchain,
    layers.layer_2_what_price_says.pattern,
    layers.layer_3_what_experts_think.fundamental,
    layers.layer_3_what_experts_think.quants,
    layers.layer_3_what_experts_think.range,
    analysis.narrative,
    analysis.action_insight,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function narrativeParagraphs(narrative: string): string[] {
  return narrative
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function getAssetMicroInsight(
  analysis: StructuredAnalysis | null,
  symbol: string,
): string | null {
  if (!analysis) return null;
  const upper = symbol.toUpperCase();
  for (const event of analysis.three_layers.layer_1_what_happened.events) {
    const haystack =
      `${event.event} ${event.impact_on_user} ${event.evidence}`.toUpperCase();
    if (haystack.includes(upper)) {
      return event.impact_on_user || event.event;
    }
  }
  const technical = analysis.three_layers.layer_2_what_price_says;
  const priceText = `${technical.technical} ${technical.pattern}`.toUpperCase();
  if (priceText.includes(upper)) {
    return technical.technical.slice(0, 120) || null;
  }
  return null;
}
