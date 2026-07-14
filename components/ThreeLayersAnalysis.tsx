"use client";

import ExplainableText from "@/components/ExplainableText";
import { SkeletonBlock } from "@/components/AssetCard";
import {
  analysisToFullText,
  narrativeParagraphs,
  type StructuredAnalysis,
} from "@/lib/marketAnalysis";
import { useState, type ReactNode } from "react";

function LayerSkeleton({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-4 border border-[#bbbbbb] bg-[#ffffff] p-5 sm:p-6">
      <SkeletonBlock className="h-5 w-48" />
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#111111]/35">
        {title}
      </p>
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-11/12" />
        <SkeletonBlock className="h-4 w-10/12" />
      </div>
    </div>
  );
}

function LayerCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-4 border border-[#bbbbbb] bg-[#ffffff] p-5 sm:p-6">
      <h4 className="text-base font-medium tracking-tight text-[#111111] sm:text-lg">
        {title}
      </h4>
      <div className="space-y-4 text-sm leading-relaxed text-[#111111]/75 sm:text-[0.9375rem]">
        {children}
      </div>
    </article>
  );
}

export default function ThreeLayersAnalysis({
  analysis,
  loading,
  unavailableLabel,
  actionInsightLabel,
  narrativeLabel,
  layerLabels,
  learningMode,
  experienceLevel,
}: {
  analysis: StructuredAnalysis | null;
  loading: boolean;
  unavailableLabel: string;
  actionInsightLabel: string;
  narrativeLabel: string;
  layerLabels: { world: string; price: string; experts: string };
  learningMode: boolean;
  experienceLevel: string | null;
}) {
  const [mobileLayer, setMobileLayer] = useState<"world" | "price" | "experts">(
    "world",
  );

  if (loading) {
    return (
      <section className="mt-10 space-y-8 sm:mt-14">
        <div className="hidden gap-5 lg:grid lg:grid-cols-3">
          <LayerSkeleton title={layerLabels.world} />
          <LayerSkeleton title={layerLabels.price} />
          <LayerSkeleton title={layerLabels.experts} />
        </div>
        <div className="lg:hidden">
          <LayerSkeleton title={layerLabels.world} />
        </div>
        <div className="space-y-3">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-10/12" />
        </div>
      </section>
    );
  }

  if (!analysis) {
    return (
      <section className="mt-10 border-t border-[#bbbbbb] pt-8 sm:mt-14 sm:pt-10">
        <p className="text-sm text-[#111111]/45">{unavailableLabel}</p>
      </section>
    );
  }

  const { three_layers: layers } = analysis;
  const fullText = analysisToFullText(analysis);
  const paragraphs = narrativeParagraphs(analysis.narrative);

  const worldLayer = (
    <LayerCard title={layers.layer_1_what_happened.title}>
      {layers.layer_1_what_happened.events.map((event, i) => (
        <div key={i} className="border-l-2 border-[#111111]/10 pl-4">
          <p className="font-medium text-[#111111]">{event.event}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-[#111111]/40">
            {event.where}
          </p>
          <p className="mt-2">{event.impact_on_user}</p>
          <p className="mt-1 text-xs text-[#111111]/50">{event.evidence}</p>
        </div>
      ))}
    </LayerCard>
  );

  const priceLayer = (
    <LayerCard title={layers.layer_2_what_price_says.title}>
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#111111]/40">
          Técnico
        </p>
        <p>{layers.layer_2_what_price_says.technical}</p>
      </div>
      {layers.layer_2_what_price_says.onchain ? (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#111111]/40">
            On-chain
          </p>
          <p>{layers.layer_2_what_price_says.onchain}</p>
        </div>
      ) : null}
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#111111]/40">
          Patrón
        </p>
        <p>{layers.layer_2_what_price_says.pattern}</p>
      </div>
    </LayerCard>
  );

  const expertsLayer = (
    <LayerCard title={layers.layer_3_what_experts_think.title}>
      <p>{layers.layer_3_what_experts_think.fundamental}</p>
      <p>{layers.layer_3_what_experts_think.quants}</p>
      <p>{layers.layer_3_what_experts_think.range}</p>
      <p className="text-[#111111]/55 italic">
        {layers.layer_3_what_experts_think.humility}
      </p>
    </LayerCard>
  );

  const mobileTabs = [
    { id: "world" as const, label: layerLabels.world },
    { id: "price" as const, label: layerLabels.price },
    { id: "experts" as const, label: layerLabels.experts },
  ];

  return (
    <section className="mt-10 space-y-8 sm:mt-14">
      <div className="hidden gap-5 lg:grid lg:grid-cols-3">
        {worldLayer}
        {priceLayer}
        {expertsLayer}
      </div>

      <div className="lg:hidden">
        <div className="-mx-[var(--page-gutter)] mb-4 flex gap-2 overflow-x-auto px-[var(--page-gutter)] scrollbar-none">
          {mobileTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileLayer(tab.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                mobileLayer === tab.id
                  ? "bg-[#111111] text-white"
                  : "border border-[#bbbbbb] bg-[#ffffff] text-[#111111]/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {mobileLayer === "world" && worldLayer}
        {mobileLayer === "price" && priceLayer}
        {mobileLayer === "experts" && expertsLayer}
      </div>

      <div className="max-w-2xl space-y-5">
        <h3 className="text-lg font-medium tracking-tight">{narrativeLabel}</h3>
        <div className="space-y-4">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-[#111111]/75 sm:text-base">
              {learningMode ? (
                <ExplainableText
                  text={paragraph}
                  terms={analysis.terms}
                  experienceLevel={experienceLevel}
                  enabled
                />
              ) : (
                paragraph
              )}
            </p>
          ))}
        </div>
      </div>

      <div className="max-w-2xl border border-[#111111]/15 bg-[#fafafa] p-5 sm:p-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#111111]/45">
          {actionInsightLabel}
        </p>
        <div className="mt-3 text-sm leading-relaxed text-[#111111] sm:text-base">
          <ExplainableText
            text={analysis.action_insight}
            terms={analysis.terms}
            experienceLevel={experienceLevel}
            enabled={learningMode}
          />
        </div>
      </div>

      {learningMode ? (
        <div className="sr-only">
          <ExplainableText
            text={fullText}
            terms={analysis.terms}
            experienceLevel={experienceLevel}
            enabled
          />
        </div>
      ) : null}

      {analysis.meta?.sources ? (
        <p className="text-xs text-[#111111]/35">
          {analysis.meta.sources} · Confianza: {analysis.meta.confidence}
        </p>
      ) : null}
    </section>
  );
}
