"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/translations";

const OPTIONS: { id: Locale; label: string }[] = [
  { id: "es", label: "ES" },
  { id: "en", label: "EN" },
];

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className="flex items-center gap-3 text-sm font-medium tracking-wide"
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map((option) => {
        const active = locale === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setLocale(option.id)}
            aria-pressed={active}
            className={`transition-opacity ${
              active
                ? "text-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]/70"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
