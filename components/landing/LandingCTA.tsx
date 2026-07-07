"use client";

import Link from "next/link";
import ScrollReveal from "@/components/landing/ScrollReveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function LandingCTA() {
  const { t } = useLanguage();

  return (
    <section className="px-[var(--page-gutter-wide)] pb-8 pt-8 md:pb-12">
      <ScrollReveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--foreground)] px-8 py-14 text-white md:px-14 md:py-16">
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.85rem,4vw,2.85rem)] font-normal leading-[1.08] tracking-tight">
              {t.landing.cta.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 md:text-lg">
              {t.landing.cta.subtitle}
            </p>
            <Link
              href="/login"
              className="group mt-8 inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-medium tracking-wide text-[var(--foreground)] transition-transform duration-300 hover:scale-[1.02] md:text-base"
            >
              {t.landing.cta.button}
              <svg
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
