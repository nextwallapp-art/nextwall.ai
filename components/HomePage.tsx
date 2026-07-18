"use client";

import Link from "next/link";
import AnimatedTitle from "@/components/AnimatedTitle";
import Header from "@/components/Header";
import IntroAnimation from "@/components/IntroAnimation";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingHeroVisual from "@/components/landing/LandingHeroVisual";
import LandingTicker from "@/components/landing/LandingTicker";
import ScrollReveal from "@/components/landing/ScrollReveal";
import StackedCards from "@/components/StackedCards";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <IntroAnimation>
      <div className="relative text-[var(--foreground)]">
        <div className="fixed inset-x-0 top-0 z-50">
          <Header variant="landing" />
        </div>

        <section className="relative flex min-h-screen flex-col overflow-hidden">
          <main className="relative z-10 flex flex-1 flex-col justify-center px-[var(--page-gutter)] pb-14 pt-[5.5rem] sm:px-[var(--page-gutter-wide)] sm:pb-16 md:pb-24 md:pt-36 lg:pt-40">
            <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-16">
              <div className="flex flex-col items-start text-left">
                <ScrollReveal>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)] sm:text-[0.68rem] sm:tracking-[0.22em]">
                    {t.hero.eyebrow}
                  </p>
                </ScrollReveal>

                <AnimatedTitle
                  text={t.hero.headline}
                  className="mt-4 w-full font-[family-name:var(--font-heading)] text-[clamp(1.65rem,6.2vw,4.5rem)] font-normal leading-[1.14] tracking-[-0.02em] text-[var(--foreground)] sm:mt-5 sm:leading-[1.05]"
                />

                <ScrollReveal delayMs={120}>
                  <p className="mt-5 max-w-prose text-base leading-[1.7] text-[var(--muted)] sm:mt-6 md:max-w-lg md:text-[1.05rem] md:leading-relaxed">
                    {t.hero.subtitle}
                  </p>
                </ScrollReveal>

                <ScrollReveal
                  delayMs={180}
                  className="mt-8 flex w-full flex-col gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center"
                >
                  <Link
                    href="/login"
                    className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[var(--foreground)] px-8 py-3.5 text-base font-medium tracking-wide text-white transition-[transform,opacity] duration-300 hover:opacity-90 sm:w-auto md:px-10 md:py-4"
                  >
                    {t.hero.cta}
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

                  <Link
                    href="/demo"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--border)] bg-white px-7 py-3.5 text-base font-medium text-[var(--foreground)] transition-colors duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)] sm:w-auto"
                  >
                    {t.hero.ctaSecondary}
                  </Link>
                </ScrollReveal>
              </div>

              <ScrollReveal delayMs={140} className="relative hidden sm:block">
                <LandingHeroVisual />
              </ScrollReveal>
            </div>
          </main>

          <div className="relative z-10 flex justify-center pb-8">
            <a
              href="#story"
              aria-label={t.hero.ctaSecondary}
              className="group flex flex-col items-center text-[var(--muted)]"
            >
              <span className="block h-9 w-px overflow-hidden bg-[var(--border)]">
                <span className="block h-full w-full origin-top scale-y-0 bg-[var(--accent)] transition-transform duration-700 group-hover:scale-y-100" />
              </span>
            </a>
          </div>
        </section>

        <LandingTicker />

        <div id="story">
          <StackedCards />
        </div>

        <div id="features">
          <LandingFeatures />
        </div>

        <LandingCTA />
        <LandingFooter />
      </div>
    </IntroAnimation>
  );
}
