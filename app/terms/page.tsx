"use client";

import LegalFooter from "@/components/LegalFooter";
import LanguageToggle from "@/components/LanguageToggle";
import {
  TERMS_SECTIONS_EN,
  TERMS_SECTIONS_ES,
} from "@/lib/legal/termsContent";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Link from "next/link";

export default function TermsPage() {
  const { locale, t } = useLanguage();
  const sections = locale === "es" ? TERMS_SECTIONS_ES : TERMS_SECTIONS_EN;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex justify-end px-[var(--page-gutter)] py-6">
        <LanguageToggle />
      </div>
      <main className="mx-auto max-w-3xl px-[var(--page-gutter)] pb-16">
        <Link
          href="/"
          className="text-sm text-[var(--text-secondary)] hover:opacity-70"
        >
          ← {t.dashboard.backHome}
        </Link>
        <h1 className="mt-8 text-2xl font-medium tracking-tight sm:text-3xl">
          {t.legalFooter.terms}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
          {locale === "es"
            ? "Lea atentamente estos Términos antes de utilizar NextWall. Si no está de acuerdo, no utilice el Servicio."
            : "Please read these Terms carefully before using NextWall. If you do not agree, do not use the Service."}
        </p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-sm leading-relaxed text-[var(--text-secondary)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <LegalFooter />
      </main>
    </div>
  );
}
