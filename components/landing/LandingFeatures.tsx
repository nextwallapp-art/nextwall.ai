"use client";

import ScrollReveal from "@/components/landing/ScrollReveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function LandingFeatures() {
  const { t } = useLanguage();
  const { features } = t.landing;

  return (
    <section className="relative px-[var(--page-gutter-wide)] py-24 md:py-32">
      <ScrollReveal className="mx-auto max-w-3xl text-center">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
          {features.eyebrow}
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.25rem)] font-normal leading-[1.06] tracking-tight text-[var(--foreground)]">
          {features.title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] md:text-lg">
          {features.subtitle}
        </p>
      </ScrollReveal>

      <div className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-12">
        {features.items.map((item, index) => {
          const span =
            index === 0
              ? "lg:col-span-7"
              : index === 1
                ? "lg:col-span-5"
                : index === 2
                  ? "lg:col-span-5"
                  : "lg:col-span-7";

          return (
            <ScrollReveal
              key={item.tag}
              delayMs={index * 90}
              className={`${span} group rounded-2xl border border-[var(--border)] bg-white p-5 transition-[border-color,transform] duration-400 hover:-translate-y-0.5 hover:border-[var(--accent)]/40 sm:p-7 md:p-8`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-xs text-[var(--muted)]">
                  {item.tag}
                </span>
                <span
                  aria-hidden="true"
                  className="mt-1 h-px w-8 bg-[var(--border)] transition-all duration-400 group-hover:w-12 group-hover:bg-[var(--accent)]"
                />
              </div>
              <h3 className="mt-5 font-[family-name:var(--font-heading)] text-xl font-normal tracking-tight text-[var(--foreground)] sm:text-[1.65rem]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-[0.95rem]">
                {item.text}
              </p>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
