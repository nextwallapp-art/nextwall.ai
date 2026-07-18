"use client";

import AssetCard, { AssetGrid, MacroCard } from "@/components/AssetCard";
import AssetDetailPanel from "@/components/AssetDetailPanel";
import DashboardSidebar from "@/components/DashboardSidebar";
import ExpandableAnalysis from "@/components/ExpandableAnalysis";
import LanguageToggle from "@/components/LanguageToggle";
import LearningModeToggle from "@/components/LearningModeToggle";
import LegalFooter from "@/components/LegalFooter";
import { getDemoAssetDetail } from "@/lib/demoAssetDetail";
import {
  getDemoMarketData,
  type DemoCrypto,
  type DemoMacro,
  type DemoStock,
} from "@/lib/demoData";
import { formatRelativeUpdated } from "@/lib/formatRelativeTime";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getAssetMicroInsight } from "@/lib/marketAnalysis";
import type { AssetDetail } from "@/lib/marketTypes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type DemoTab = "markets" | "crypto" | "macro";

function DemoTabs({
  activeTab,
  onChange,
  labels,
}: {
  activeTab: DemoTab;
  onChange: (tab: DemoTab) => void;
  labels: { markets: string; crypto: string; macro: string };
}) {
  const tabs: { id: DemoTab; label: string }[] = [
    { id: "markets", label: labels.markets },
    { id: "crypto", label: labels.crypto },
    { id: "macro", label: labels.macro },
  ];

  return (
    <div className="-mx-[var(--page-gutter)] mb-8 flex gap-5 overflow-x-auto border-b border-[#bbbbbb] px-[var(--page-gutter)] pb-1 scrollbar-none sm:mx-0 sm:gap-6 sm:px-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
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
  );
}

export default function DemoPage() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const numberLocale = locale === "es" ? "es-ES" : "en-US";
  const data = getDemoMarketData(locale);
  const analysis = data.analysis;

  const [activeTab, setActiveTab] = useState<DemoTab>("markets");
  const [learningMode, setLearningMode] = useState(true);
  const [assetDetail, setAssetDetail] = useState<AssetDetail | null>(null);
  const [relativeUpdated, setRelativeUpdated] = useState("");

  useEffect(() => {
    const update = () => {
      setRelativeUpdated(formatRelativeUpdated(data.lastUpdated, locale));
    };
    update();
    const intervalId = window.setInterval(update, 30_000);
    return () => window.clearInterval(intervalId);
  }, [data.lastUpdated, locale]);

  function openAssetDetail(type: "stock" | "crypto", symbol: string) {
    setAssetDetail(getDemoAssetDetail(locale, type, symbol));
  }

  function closeAssetDetail() {
    setAssetDetail(null);
  }

  function handleSignOut() {
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col text-[#111111] md:flex-row">
      <DashboardSidebar
        compact
        variant="demo"
        active="home"
        email="demo@nextwall.ai"
        onSignOut={handleSignOut}
      />
      <DashboardSidebar
        variant="demo"
        active="home"
        email="demo@nextwall.ai"
        onSignOut={handleSignOut}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-6 sm:px-10 sm:py-6">
          <LearningModeToggle
            enabled={learningMode}
            onChange={setLearningMode}
            label={t.dashboard.learningMode}
          />
          <LanguageToggle />
        </div>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-[var(--page-gutter)] pb-[calc(6rem+var(--safe-bottom))] sm:px-6 md:px-10">
          <div className="mb-8 rounded-xl border border-[#111111]/15 bg-[#fafafa] p-5 sm:rounded-none sm:p-4 sm:px-5">
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
            <div className="min-w-0">
              <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
                {t.dashboard.title}
              </h1>
              <p className="mt-1 text-sm text-[#111111]/45">{t.demo.profileLabel}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#111111]/45">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#111111]/30" />
                  {t.demo.sampleData}
                </span>
                {relativeUpdated && (
                  <span>
                    {t.dashboard.updatedRelative} {relativeUpdated}
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center bg-[#4B4B4B] px-5 py-3 text-sm font-medium text-[#ffffff] transition-opacity hover:opacity-85 sm:w-auto sm:px-6"
            >
              {t.demo.cta}
            </Link>
          </div>

          <ExpandableAnalysis
            analysis={analysis}
            loading={false}
            unavailableLabel={t.dashboard.analysisUnavailable}
            sectionLabels={t.dashboard.expandableSections}
            learningMode={learningMode}
            experienceLevel="beginner"
            locale={locale}
          />

          <DemoTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            labels={t.dashboard.tabs}
          />

          <AssetGrid>
            {activeTab === "markets" &&
              data.stocks.map((item: DemoStock) => (
                <AssetCard
                  key={item.symbol}
                  name={item.name}
                  symbol={item.symbol}
                  price={item.price}
                  change={item.changePercent}
                  microInsight={getAssetMicroInsight(analysis, item.symbol)}
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
                  microInsight={getAssetMicroInsight(analysis, item.symbol)}
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

          <div className="mt-12 border border-[#bbbbbb] bg-[#ffffff] p-5 text-center sm:p-6">
            <p className="text-sm leading-relaxed text-[#111111]/55">{t.demo.footer}</p>
            <Link
              href="/login"
              className="mt-4 inline-flex w-full items-center justify-center bg-[#4B4B4B] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85 sm:w-auto"
            >
              {t.demo.cta}
            </Link>
          </div>

          <LegalFooter />
        </main>
      </div>

      <AssetDetailPanel
        detail={assetDetail}
        loading={false}
        error={null}
        onClose={closeAssetDetail}
      />
    </div>
  );
}
