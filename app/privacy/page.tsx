"use client";

import LegalFooter from "@/components/LegalFooter";
import LanguageToggle from "@/components/LanguageToggle";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex justify-end px-[var(--page-gutter)] py-6">
        <LanguageToggle />
      </div>
      <main className="mx-auto max-w-2xl px-[var(--page-gutter)] pb-16">
        <Link href="/" className="text-sm text-[var(--text-secondary)] hover:opacity-70">
          ← {t.dashboard.backHome}
        </Link>
        <h1 className="mt-8 text-2xl font-medium tracking-tight">
          {t.legalFooter.privacy}
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          {t.legal.privacyBody}
        </p>
        <LegalFooter />
      </main>
    </div>
  );
}
