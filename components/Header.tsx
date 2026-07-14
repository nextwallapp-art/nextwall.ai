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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (variant !== "landing") return;

    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const shellClass =
    variant === "landing"
      ? scrolled
        ? "landing-glass border-b border-[var(--border)]/60 shadow-[0_10px_40px_-30px_rgba(20,17,15,0.25)]"
        : "bg-transparent"
      : "";

  return (
    <header
      className={`animate-fade-down relative z-10 flex items-center justify-between px-[var(--page-gutter)] py-4 transition-[background,border,box-shadow] duration-500 sm:py-5 md:py-6 ${shellClass}`}
    >
      <Link
        href="/"
        className="group relative inline-flex shrink-0 transition-opacity hover:opacity-70"
        onClick={() => setMenuOpen(false)}
      >
        <NextWallLogo className="h-6 w-auto sm:h-7 md:h-8" priority />
      </Link>

      <div className="hidden shrink-0 items-center gap-3 sm:flex sm:gap-5 md:gap-7">
        <LanguageToggle />
        {showLoginButton && (
          <Link
            href="/login"
            className={`animate-fade-down delay-100 min-h-12 inline-flex items-center text-sm font-medium transition-all duration-300 md:text-base ${
              variant === "landing"
                ? "rounded-full border border-[var(--border)] bg-white px-5 py-2.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                : "text-[var(--foreground)] hover:opacity-60"
            }`}
          >
            {t.header.login}
          </Link>
        )}
      </div>

      <button
        type="button"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] sm:hidden"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? t.header.menuClose : t.header.menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="sr-only">
          {menuOpen ? t.header.menuClose : t.header.menuOpen}
        </span>
        {menuOpen ? (
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <button
            type="button"
            aria-label={t.header.menuClose}
            className="absolute inset-0 bg-[#111111]/30"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="absolute right-[var(--page-gutter)] top-[calc(4.5rem+var(--safe-bottom,0px))] w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-[var(--border)] bg-white p-3 shadow-[0_20px_60px_-24px_rgba(17,17,17,0.35)]">
            <div className="flex min-h-12 items-center justify-between border-b border-[var(--border)] px-3 py-2">
              <span className="text-sm font-medium text-[var(--muted)]">
                {t.header.menuLabel}
              </span>
              <LanguageToggle />
            </div>
            {showLoginButton && (
              <Link
                href="/login"
                className="mt-2 flex min-h-12 items-center justify-center rounded-xl bg-[var(--foreground)] px-4 text-base font-medium text-white"
                onClick={() => setMenuOpen(false)}
              >
                {t.header.login}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
