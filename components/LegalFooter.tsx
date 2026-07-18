"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Link from "next/link";

export default function LegalFooter() {
  const { t } = useLanguage();

  return (
    <footer className="legal-footer">
      <p>
        <strong>{t.legalFooter.disclaimerLabel}</strong> {t.legalFooter.disclaimer}
      </p>
      <p className="legal-footer-meta">
        © {new Date().getFullYear()} NextWall. {t.legalFooter.rights}{" "}
        <Link href="/privacy">{t.legalFooter.privacy}</Link>
        {" | "}
        <Link href="/terms">{t.legalFooter.terms}</Link>
      </p>
    </footer>
  );
}
