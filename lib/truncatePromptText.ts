/** Keep Claude input bounded — cuts at word boundary when possible. */
export function truncatePromptText(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;

  const slice = trimmed.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > maxChars * 0.7 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trim()}…`;
}

export function compactAnalysisContext(ctx: {
  gdelt_events_formatted: string;
  fed_calendar_events: string;
  asset_prices_today: string;
  technical_analysis: string;
  onchain_metrics: string;
  historical_context_12m: string;
  analyst_consensus: string;
}) {
  return {
    gdelt_events_formatted: truncatePromptText(ctx.gdelt_events_formatted, 900),
    fed_calendar_events: truncatePromptText(ctx.fed_calendar_events, 700),
    asset_prices_today: truncatePromptText(ctx.asset_prices_today, 1_200),
    technical_analysis: truncatePromptText(ctx.technical_analysis, 900),
    onchain_metrics: truncatePromptText(ctx.onchain_metrics, 500),
    historical_context_12m: truncatePromptText(ctx.historical_context_12m, 800),
    analyst_consensus: truncatePromptText(ctx.analyst_consensus, 700),
  };
}
