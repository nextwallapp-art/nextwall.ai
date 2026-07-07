"use client";

import LanguageToggle from "@/components/LanguageToggle";
import NextWallLogo from "@/components/NextWallLogo";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeaderProps = {
  showLoginButton?: boolean;
  variant?: "default" | "landing";
};

export default function Header({
  showLoginButton = true,
  variant = "default",
}: HeaderProps) {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (variant !== "landing") return;

    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const shellClass =
    variant === "landing"
      ? scrolled
        ? "landing-glass border-b border-[var(--border)]/60 shadow-[0_10px_40px_-30px_rgba(20,17,15,0.25)]"
        : "bg-transparent"
      : "";

  return (
    <header
      className={`animate-fade-down relative z-10 flex items-center justify-between px-[var(--page-gutter)] py-5 transition-[background,border,box-shadow] duration-500 md:py-6 ${shellClass}`}
    >
      <Link
        href="/"
        className="group relative inline-flex transition-opacity hover:opacity-70"
      >
        <NextWallLogo priority />
      </Link>

      <div className="flex items-center gap-5 sm:gap-7">
        <LanguageToggle />

        {showLoginButton && (
          <Link
            href="/login"
            className={`animate-fade-down delay-100 text-sm font-medium transition-all duration-300 sm:text-base ${
              variant === "landing"
                ? "rounded-full border border-[var(--border)] bg-white px-5 py-2.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                : "text-[var(--foreground)] hover:opacity-60"
            }`}
          >
            {t.header.login}
          </Link>
        )}
      </div>
    </header>
  );
}
