"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function LandingTicker() {
  const { t } = useLanguage();
  const items = [...t.landing.ticker, ...t.landing.ticker];

  return (
    <div className="relative overflow-hidden border-y border-[var(--border)] bg-white py-3.5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24" />

      <div className="landing-marquee-track flex w-max items-center gap-10 whitespace-nowrap px-6">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-10 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[var(--muted)]"
          >
            <span>{item}</span>
            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-[var(--border)]"
            />
          </span>
        ))}
      </div>
    </div>
  );
}
