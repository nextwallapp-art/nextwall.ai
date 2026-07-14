"use client";

import ExplainableText from "@/components/ExplainableText";
import Header from "@/components/Header";
import LanguageToggle from "@/components/LanguageToggle";
import LearningModeToggle from "@/components/LearningModeToggle";
import {
  getDemoMarketData,
  getMicroInsight,
  type DemoCrypto,
  type DemoMacro,
  type DemoStock,
} from "@/lib/demoData";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Link from "next/link";
import { useState } from "react";

type DemoTab = "markets" | "crypto" | "macro";

function formatNumber(value: number, locale: string, decimals = 2) {
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function ChangeBadge({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`text-sm font-medium ${up ? "text-[#0f9d58]" : "text-[#d93636]"}`}
    >
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

function AssetCard({
  name,
  symbol,
  price,
  change,
  microInsight,
  locale,
}: {
  name: string;
  symbol: string;
  price: number;
  change: number;
  microInsight: string | null;
  locale: string;
}) {
  return (
    <div className="flex flex-col gap-3 border border-[#bbbbbb] bg-[#ffffff] p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-[#111111]/55">{name}</span>
        <span className="text-xs text-[#111111]/30">{symbol}</span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xl font-medium tracking-tight sm:text-2xl">
          ${formatNumber(price, locale)}
        </span>
        <ChangeBadge value={change} />
      </div>
      {microInsight ? (
        <p className="text-xs leading-relaxed text-[#111111]/45">{microInsight}</p>
      ) : null}
    </div>
  );
}

function MacroCard({
  name,
  value,
  unit,
  date,
  locale,
}: {
  name: string;
  value: number;
  unit: string;
  date: string;
  locale: string;
}) {
  return (
    <div className="flex flex-col gap-3 border border-[#bbbbbb] bg-[#ffffff] p-4 sm:p-5">
      <span className="text-sm font-medium text-[#111111]/55">{name}</span>
      <span className="text-xl font-medium tracking-tight sm:text-2xl">
        {formatNumber(value, locale, unit === "índice" ? 1 : 2)}
        {unit === "%" ? "%" : unit === "$" ? " $" : ""}
      </span>
      <span className="text-xs text-[#111111]/35">{date}</span>
    </div>
  );
}

export default function DemoPage() {
  const { locale, t } = useLanguage();
  const numberLocale = locale === "es" ? "es-ES" : "en-US";
  const data = getDemoMarketData(locale);
  const analysis = data.analysis;

  const [activeTab, setActiveTab] = useState<DemoTab>("markets");
  const [learningMode, setLearningMode] = useState(true);

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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        </div>

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
    </div>
  );
}
