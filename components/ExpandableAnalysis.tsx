"use client";

import { SkeletonBlock } from "@/components/AssetCard";
import ExplainableText from "@/components/ExplainableText";
import type { Locale } from "@/lib/i18n/translations";
import type { StructuredAnalysis } from "@/lib/marketAnalysis";
import { mergeAnalysisTerms } from "@/lib/mergeAnalysisTerms";
import { useMemo, useState } from "react";

type SectionLabels = {
  whatHappened: string;
  whatPriceSays: string;
  whatExpertsThink: string;
};

type OpenSections = {
  0: boolean;
  1: boolean;
  2: boolean;
};

function layer1Paragraphs(
  layer: StructuredAnalysis["three_layers"]["layer_1_what_happened"] | undefined,
): string[] {
  if (!layer?.events?.length) return [];
  return layer.events.flatMap((event) => {
    const main = `${event.event} (${event.where}). ${event.impact_on_user}`;
    return event.evidence ? [main, event.evidence] : [main];
  });
}

function layer2Paragraphs(
  layer: StructuredAnalysis["three_layers"]["layer_2_what_price_says"] | undefined,
): string[] {
  if (!layer) return [];
  return [layer.technical, layer.onchain, layer.pattern].filter(Boolean);
}

function layer3Paragraphs(
  layer: StructuredAnalysis["three_layers"]["layer_3_what_experts_think"] | undefined,
): string[] {
  if (!layer) return [];
  return [layer.fundamental, layer.quants, layer.range, layer.humility].filter(
    Boolean,
  );
}

function ParagraphBlock({
  paragraphs,
  terms,
  learningMode,
  experienceLevel,
}: {
  paragraphs: string[];
  terms: StructuredAnalysis["terms"];
  learningMode: boolean;
  experienceLevel: string | null;
}) {
  if (paragraphs.length === 0) {
    return <p className="text-sm text-[#111111]/45">Sin datos disponibles.</p>;
  }

  return (
    <div className="space-y-5">
      {paragraphs.map((paragraph, index) =>
        learningMode ? (
          <div
            key={index}
            className="text-sm leading-[1.6] text-[#0a0a0a] sm:text-[15px]"
          >
            <ExplainableText
              text={paragraph}
              terms={terms}
              experienceLevel={experienceLevel}
              enabled
            />
          </div>
        ) : (
          <p
            key={index}
            className="text-sm leading-[1.6] text-[#0a0a0a] sm:text-[15px]"
          >
            {paragraph}
          </p>
        ),
      )}
    </div>
  );
}

function ExpandableSkeleton() {
  return (
    <div className="mx-auto max-w-[800px]">
      <SkeletonBlock className="mb-8 h-9 w-full max-w-xl" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default function ExpandableAnalysis({
  analysis,
  loading = false,
  unavailableLabel = "El análisis no está disponible en este momento.",
  sectionLabels = {
    whatHappened: "¿Qué pasó hoy?",
    whatPriceSays: "¿Qué dice el precio?",
    whatExpertsThink: "¿Qué dicen los expertos?",
  },
  learningMode = false,
  experienceLevel = null,
  locale = "es",
}: {
  analysis: StructuredAnalysis | null;
  loading?: boolean;
  unavailableLabel?: string;
  sectionLabels?: SectionLabels;
  learningMode?: boolean;
  experienceLevel?: string | null;
  locale?: Locale;
}) {
  const [openSections, setOpenSections] = useState<OpenSections>({
    0: true,
    1: false,
    2: false,
  });

  function toggleSection(index: 0 | 1 | 2) {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  if (loading) {
    return (
      <section className="mb-8 sm:mb-10">
        <ExpandableSkeleton />
      </section>
    );
  }

  if (!analysis) {
    return (
      <section className="mb-8 border-t border-[#bbbbbb] pt-8 sm:mb-10 sm:pt-10">
        <p className="text-sm text-[#111111]/45">{unavailableLabel}</p>
      </section>
    );
  }

  const layers = analysis.three_layers;
  const terms = useMemo(
    () => mergeAnalysisTerms(analysis.terms, locale),
    [analysis.terms, locale],
  );
  const sections: {
    icon: string;
    title: string;
    paragraphs: string[];
  }[] = [
    {
      icon: "🌍",
      title: sectionLabels.whatHappened,
      paragraphs: layer1Paragraphs(layers.layer_1_what_happened),
    },
    {
      icon: "📊",
      title: sectionLabels.whatPriceSays,
      paragraphs: layer2Paragraphs(layers.layer_2_what_price_says),
    },
    {
      icon: "🧠",
      title: sectionLabels.whatExpertsThink,
      paragraphs: layer3Paragraphs(layers.layer_3_what_experts_think),
    },
  ];

  return (
    <section className="mb-8 sm:mb-10">
      {analysis.headline ? (
        <h2 className="mb-8 text-[1.75rem] font-bold leading-tight tracking-tight text-[#111111] sm:mb-10 sm:text-[2rem]">
          {analysis.headline}
        </h2>
      ) : null}

      <div className="mx-auto max-w-[800px] space-y-1">
        {sections.map((section, index) => {
          const i = index as 0 | 1 | 2;
          const isOpen = openSections[i];
          return (
            <div key={section.title} className="expandable">
              <button
                type="button"
                className="expandable-header"
                aria-expanded={isOpen}
                onClick={() => toggleSection(i)}
              >
                <span>
                  {section.icon} {section.title}
                </span>
                <span className={`chevron ${isOpen ? "open" : ""}`} aria-hidden>
                  ▼
                </span>
              </button>
              <div className={`expandable-panel ${isOpen ? "open" : ""}`}>
                <div className="expandable-panel-inner">
                  <div className="expandable-slide-content px-3 pb-6 pt-2">
                    <ParagraphBlock
                      paragraphs={section.paragraphs}
                      terms={terms}
                      learningMode={learningMode}
                      experienceLevel={experienceLevel}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
