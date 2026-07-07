"use client";

import NextWallLogo from "@/components/NextWallLogo";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function LandingFooter() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)]/70 px-[var(--page-gutter)] py-12 md:py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <NextWallLogo className="h-6 w-auto opacity-80" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            {t.landing.footer.tagline}
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]/80">
          © {year} NextWall. {t.landing.footer.rights}
        </p>
      </div>
    </footer>
  );
}
