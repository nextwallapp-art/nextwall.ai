"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { displayPath } from "@/lib/site";

const ASSETS = [
  { symbol: "AAPL", name: "Apple", price: "$214.20", change: "+1.2%" },
  { symbol: "NVDA", name: "Nvidia", price: "$142.80", change: "+2.4%" },
  { symbol: "BTC", name: "Bitcoin", price: "$67,420", change: "+3.1%" },
  { symbol: "SPY", name: "S&P 500", price: "$548.10", change: "+0.6%" },
];

export default function LandingHeroVisual() {
  const { locale, t } = useLanguage();
  const isEs = locale === "es";

  const sections = [
    {
      icon: "🌍",
      title: t.dashboard.expandableSections.whatHappened,
      open: true,
    },
    {
      icon: "📊",
      title: t.dashboard.expandableSections.whatPriceSays,
      open: false,
    },
    {
      icon: "🧠",
      title: t.dashboard.expandableSections.whatExpertsThink,
      open: false,
    },
  ];

  const headline = isEs
    ? "La Fed mantiene tipos y el mercado crypto reacciona con fuerza."
    : "The Fed holds rates and crypto markets react sharply.";

  const analysisSnippet = isEs
    ? "Bitcoin lidera el apetito por riesgo mientras el dólar se debilita. Tus ETFs y tech siguen el mismo tono."
    : "Bitcoin leads risk-on sentiment as the dollar weakens. Your ETFs and tech names follow the same tone.";

  return (
    <div className="relative mx-auto w-full max-w-[440px]">
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_50%_50%,rgba(75,75,75,0.08),transparent_70%)]"
      />

      <div className="animate-float-soft relative overflow-hidden rounded-[1.5rem] border border-[#E5E5E5] bg-white shadow-[0_32px_80px_-40px_rgba(17,17,17,0.18)]">
        <div className="flex items-center gap-2 border-b border-[#EFEFEF] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E5E5E5]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E5E5E5]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E5E5E5]" />
          <span className="ml-2 text-[0.65rem] font-medium tracking-wide text-[#999999]">
            {displayPath("dashboard")}
          </span>
        </div>

        <div className="flex min-h-[380px]">
          <aside className="hidden w-[72px] shrink-0 flex-col bg-[#4B4B4B] px-3 py-5 text-white sm:flex">
            <div className="text-[0.55rem] font-semibold tracking-[0.12em] text-white/90">
              NW
            </div>
            <nav className="mt-8 space-y-3 text-[0.62rem]">
              <p className="font-medium text-white">{t.dashboard.home}</p>
              <p className="text-white/45">{t.dashboard.global}</p>
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.7rem] font-medium text-[#111111]">
                {t.dashboard.title}
              </p>
              <span className="inline-flex items-center gap-1 text-[0.55rem] text-[#111111]/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0f9d58]" />
                {t.dashboard.realtime}
              </span>
            </div>

            <h3 className="mt-2 font-[family-name:var(--font-heading)] text-[0.95rem] font-semibold leading-snug text-[#111111]">
              {headline}
            </h3>

            <div className="mt-3 space-y-1">
              {sections.map((section) => (
                <div
                  key={section.title}
                  className="rounded border border-[#E5E5E5] bg-[#FAFAFA]"
                >
                  <div className="flex items-center justify-between px-2.5 py-2 text-[0.62rem] font-medium text-[#111111]">
                    <span>
                      {section.icon} {section.title}
                    </span>
                    <span className="text-[#111111]/35">
                      {section.open ? "▼" : "▶"}
                    </span>
                  </div>
                  {section.open ? (
                    <p className="border-t border-[#EFEFEF] px-2.5 py-2 text-[0.58rem] leading-relaxed text-[#111111]/70">
                      {analysisSnippet}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-3 border-b border-[#E5E5E5] pb-1 text-[0.58rem]">
              <span className="border-b border-[#111111] pb-1 font-medium text-[#111111]">
                {t.dashboard.tabs.markets}
              </span>
              <span className="pb-1 text-[#111111]/35">
                {t.dashboard.tabs.crypto}
              </span>
              <span className="pb-1 text-[#111111]/35">
                {t.dashboard.tabs.macro}
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {ASSETS.map((asset) => (
                <div
                  key={asset.symbol}
                  className="border border-[#E5E5E5] bg-white px-2 py-2"
                >
                  <p className="text-[0.58rem] font-medium text-[#111111]">
                    {asset.name}
                  </p>
                  <p className="mt-1 text-[0.72rem] font-medium tabular-nums text-[#111111]">
                    {asset.price}
                  </p>
                  <p className="mt-0.5 text-[0.55rem] text-[#0f9d58]">
                    {asset.change}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
