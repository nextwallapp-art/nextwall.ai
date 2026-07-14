"use client";

import AssetCard, { AssetGrid, MacroCard } from "@/components/AssetCard";
import AssetDetailPanel from "@/components/AssetDetailPanel";
import ExplainableText from "@/components/ExplainableText";
import Header from "@/components/Header";
import LanguageToggle from "@/components/LanguageToggle";
import LearningModeToggle from "@/components/LearningModeToggle";
import { getDemoAssetDetail } from "@/lib/demoAssetDetail";
import {
  getDemoMarketData,
  getMicroInsight,
  type DemoCrypto,
  type DemoMacro,
  type DemoStock,
} from "@/lib/demoData";
import type { AssetDetail } from "@/lib/marketTypes";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Link from "next/link";
import { useState } from "react";

type DemoTab = "markets" | "crypto" | "macro";

export default function DemoPage() {
  const { locale, t } = useLanguage();
  const numberLocale = locale === "es" ? "es-ES" : "en-US";
  const data = getDemoMarketData(locale);
  const analysis = data.analysis;

  const [activeTab, setActiveTab] = useState<DemoTab>("markets");
  const [learningMode, setLearningMode] = useState(true);
  const [assetDetail, setAssetDetail] = useState<AssetDetail | null>(null);

  const markdown = [
    analysis.analysis.paragraph_1,
    analysis.analysis.paragraph_2,
    analysis.analysis.paragraph_3,
  ].join("\n\n");

  const tabs: { id: DemoTab; label: string }[] = [
    { id: "markets", label: t.dashboard.tabs.markets },
    { id: "crypto", label: t.dashboard.tabs.crypto },
    { id: "macro", label: t.dashboard.tabs.macro },
  ];

  function openAssetDetail(type: "stock" | "crypto", symbol: string) {
    setAssetDetail(getDemoAssetDetail(locale, type, symbol));
  }

  function closeAssetDetail() {
    setAssetDetail(null);
  }

  return (
    <div className="flex min-h-screen flex-col text-[#111111]">
      <Header showLoginButton />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-[var(--page-gutter)] pb-[calc(6rem+var(--safe-bottom))] pt-2 sm:pt-4 md:px-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <LearningModeToggle
            enabled={learningMode}
            onChange={setLearningMode}
            label={t.dashboard.learningMode}
          />
          <LanguageToggle />
        </div>

        <div className="mb-8 border border-[#111111]/15 bg-[#fafafa] px-4 py-4 sm:px-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#111111]/45">
            {t.demo.badge}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#111111]/65">
            {t.demo.banner}
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex w-full items-center justify-center bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85 sm:w-auto"
          >
            {t.demo.cta}
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
              {t.dashboard.title}
            </h1>
            <p className="mt-2 text-sm text-[#111111]/45">{t.demo.profileLabel}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#111111]/45">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#111111]/30" />
                {t.demo.sampleData}
              </span>
            </div>
          </div>
        </div>

        <h2 className="mb-8 text-xl font-medium leading-tight tracking-tight sm:text-2xl md:text-[2rem]">
          {analysis.headline}
        </h2>

        <div className="-mx-[var(--page-gutter)] mb-8 flex gap-4 overflow-x-auto border-b border-[#bbbbbb] px-[var(--page-gutter)] scrollbar-none sm:mx-0 sm:gap-6 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px shrink-0 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-[#111111] text-[#111111]"
                  : "text-[#111111]/40 hover:text-[#111111]/65"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AssetGrid>
          {activeTab === "markets" &&
            data.stocks.map((item: DemoStock) => (
              <AssetCard
                key={item.symbol}
                name={item.name}
                symbol={item.symbol}
                price={item.price}
                change={item.changePercent}
                microInsight={getMicroInsight(analysis, item.symbol)}
                locale={numberLocale}
                tapHint={t.assetDetail.tapHint}
                onClick={() => openAssetDetail("stock", item.symbol)}
              />
            ))}

          {activeTab === "crypto" &&
            data.crypto.map((item: DemoCrypto) => (
              <AssetCard
                key={item.symbol}
                name={item.name}
                symbol={item.symbol}
                price={item.price}
                change={item.change24h}
                microInsight={getMicroInsight(analysis, item.symbol)}
                locale={numberLocale}
                tapHint={t.assetDetail.tapHint}
                onClick={() => openAssetDetail("crypto", item.symbol)}
              />
            ))}

          {activeTab === "macro" &&
            data.macro.map((item: DemoMacro) => (
              <MacroCard
                key={item.id}
                name={item.name}
                value={item.value}
                unit={item.unit}
                date={item.date}
                locale={numberLocale}
              />
            ))}
        </AssetGrid>

        <section className="mt-10 max-w-2xl border-t border-[#bbbbbb] pt-8 sm:mt-14 sm:pt-10">
          <h3 className="text-lg font-medium tracking-tight">
            {t.dashboard.analysisTitle}
          </h3>
          <div className="mt-6">
            <ExplainableText
              text={markdown}
              terms={analysis.terms}
              experienceLevel="beginner"
              enabled={learningMode}
            />
          </div>
        </section>

        <div className="mt-12 border border-[#bbbbbb] bg-[#ffffff] p-5 text-center sm:p-6">
          <p className="text-sm leading-relaxed text-[#111111]/55">{t.demo.footer}</p>
          <Link
            href="/login"
            className="mt-4 inline-flex w-full items-center justify-center bg-[#4B4B4B] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85 sm:w-auto"
          >
            {t.demo.cta}
          </Link>
        </div>
      </main>

      <AssetDetailPanel
        detail={assetDetail}
        loading={false}
        error={null}
        onClose={closeAssetDetail}
      />
    </div>
  );
}
