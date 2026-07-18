import type { AnalysisTerms } from "@/lib/marketAnalysis";
import type { Locale } from "@/lib/i18n/translations";
import { getFinanceGlossaryMatches } from "@/lib/financeGlossary";

function isValidTerm(term: unknown): term is AnalysisTerms {
  if (!term || typeof term !== "object") return false;
  const t = term as Record<string, unknown>;
  return (
    typeof t.word === "string" &&
    t.word.trim().length > 0 &&
    typeof t.beginner === "string" &&
    typeof t.intermediate === "string" &&
    typeof t.advanced === "string"
  );
}

function addTerm(
  map: Map<string, AnalysisTerms>,
  word: string,
  definitions: AnalysisTerms,
) {
  const key = word.trim().toLowerCase();
  if (!key) return;
  map.set(key, {
    word: word.trim(),
    beginner: definitions.beginner,
    intermediate: definitions.intermediate,
    advanced: definitions.advanced,
  });
}

export function mergeAnalysisTerms(
  llmTerms: AnalysisTerms[] | undefined | null,
  locale: Locale,
): AnalysisTerms[] {
  const merged = new Map<string, AnalysisTerms>();

  for (const entry of getFinanceGlossaryMatches(locale)) {
    addTerm(merged, entry.word, entry);
  }

  for (const term of llmTerms ?? []) {
    if (!isValidTerm(term)) continue;
    addTerm(merged, term.word, term);
  }

  return Array.from(merged.values()).sort((a, b) => b.word.length - a.word.length);
}
