"use client";

import NextWallLogo from "@/components/NextWallLogo";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Link from "next/link";

type DashboardSidebarProps = {
  onSignOut: () => void;
  email?: string | null;
  compact?: boolean;
  active?: "home" | "global";
  variant?: "app" | "demo";
};

export default function DashboardSidebar({
  onSignOut,
  email,
  compact = false,
  active = "home",
  variant = "app",
}: DashboardSidebarProps) {
  const { t } = useLanguage();
  const initial = email?.trim().charAt(0).toUpperCase() || "N";
  const homeHref = variant === "demo" ? "/demo" : "/dashboard";
  const globalHref = variant === "demo" ? "/login" : "/dashboard/global";

  const navLinkClass = (section: "home" | "global") =>
    section === active
      ? "text-[15px] font-medium text-[#ffffff]"
      : "text-[15px] text-[#ffffff]/55 transition-opacity hover:text-[#ffffff]";

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 bg-[#4B4B4B] px-4 py-3.5 text-[#ffffff] md:hidden">
        <Link
          href="/"
          className="shrink-0 transition-opacity hover:opacity-75"
        >
          <NextWallLogo className="h-5 w-auto" invert priority />
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          <Link href={homeHref} className={navLinkClass("home")}>
            {t.dashboard.home}
          </Link>
          <Link href={globalHref} className={navLinkClass("global")}>
            {t.dashboard.global}
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            className="shrink-0 text-xs text-[#ffffff]/60 transition-opacity hover:text-[#ffffff]"
          >
            {t.dashboard.signOut}
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col bg-[#4B4B4B] px-6 py-8 text-[#ffffff] md:flex">
      <Link
        href="/"
        className="transition-opacity hover:opacity-75"
      >
        <NextWallLogo className="h-6 w-auto" invert priority />
      </Link>

      <nav className="mt-12 flex flex-col gap-5">
        <Link
          href={homeHref}
          className={navLinkClass("home")}
          aria-current={active === "home" ? "page" : undefined}
        >
          {t.dashboard.home}
        </Link>
        <Link
          href={globalHref}
          className={navLinkClass("global")}
          aria-current={active === "global" ? "page" : undefined}
        >
          {t.dashboard.global}
        </Link>
      </nav>

      <div className="mt-auto flex items-center justify-between gap-4 pt-10">
        <button
          type="button"
          onClick={onSignOut}
          className="text-left text-sm text-[#ffffff]/70 transition-opacity hover:text-[#ffffff]"
        >
          {t.dashboard.signOut}
        </button>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffffff]/12 text-sm font-medium text-[#ffffff]"
          aria-hidden
        >
          {initial}
        </div>
      </div>
    </aside>
  );
}
