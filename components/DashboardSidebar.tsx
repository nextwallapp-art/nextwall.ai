"use client";

import NextWallLogo from "@/components/NextWallLogo";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Link from "next/link";

type DashboardSidebarProps = {
  onSignOut: () => void;
  email?: string | null;
  compact?: boolean;
};

export default function DashboardSidebar({
  onSignOut,
  email,
  compact = false,
}: DashboardSidebarProps) {
  const { t } = useLanguage();
  const initial = email?.trim().charAt(0).toUpperCase() || "N";

  if (compact) {
    return (
      <div className="flex items-center justify-between bg-[#4B4B4B] px-5 py-4 text-[#ffffff] md:hidden">
        <Link
          href="/"
          className="transition-opacity hover:opacity-75"
        >
          <NextWallLogo className="h-5 w-auto" invert priority />
        </Link>
        <Link href="/dashboard" className="text-sm font-medium text-[#ffffff]/90">
          {t.dashboard.home}
        </Link>
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
          href="/dashboard"
          className="text-[15px] font-medium text-[#ffffff]"
          aria-current="page"
        >
          {t.dashboard.home}
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
