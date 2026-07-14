"use client";

import { formatPercent, formatPrice } from "@/lib/formatMarket";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-sm bg-[#111111]/8 ${className}`} />
  );
}

function ChangeBadge({
  value,
  loading,
}: {
  value: number | null;
  loading: boolean;
}) {
  if (loading) return <SkeletonBlock className="h-4 w-14" />;
  if (value === null) return <SkeletonBlock className="h-4 w-12" />;
  const up = value >= 0;
  return (
    <span
      className={`text-sm font-medium ${up ? "text-[#0f9d58]" : "text-[#d93636]"}`}
    >
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

type AssetCardProps = {
  name: string;
  symbol: string;
  price: number | null;
  change: number | null;
  microInsight: string | null;
  loadingPrice?: boolean;
  loadingInsight?: boolean;
  priceUnavailable?: boolean;
  locale: string;
  onClick?: () => void;
  tapHint?: string;
};

export default function AssetCard({
  name,
  symbol,
  price,
  change,
  microInsight,
  loadingPrice = false,
  loadingInsight = false,
  priceUnavailable = false,
  locale,
  onClick,
  tapHint = "Tap for details →",
}: AssetCardProps) {
  const formattedPrice = formatPrice(price, locale);
  const showPriceSkeleton = loadingPrice || (priceUnavailable && price === null);
  const interactive = Boolean(onClick);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`flex flex-col gap-3 border border-[#bbbbbb] bg-[#ffffff] p-4 text-left transition-colors sm:p-5 ${
        interactive
          ? "cursor-pointer hover:border-[#111111]/45 hover:shadow-[0_8px_24px_-18px_rgba(17,17,17,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]/30"
          : ""
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-[#111111]/55">{name}</span>
        <span className="text-xs text-[#111111]/30">{symbol}</span>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        {showPriceSkeleton ? (
          <SkeletonBlock className="h-8 w-24" />
        ) : (
          <span className="text-xl font-medium tracking-tight sm:text-2xl">
            {formattedPrice !== null ? `$${formattedPrice}` : "—"}
          </span>
        )}
        <ChangeBadge value={change} loading={showPriceSkeleton} />
      </div>

      {loadingInsight ? (
        <SkeletonBlock className="mt-1 h-3 w-full" />
      ) : microInsight ? (
        <p className="text-xs leading-relaxed text-[#111111]/45">{microInsight}</p>
      ) : interactive ? (
        <p className="text-xs text-[#111111]/35">{tapHint}</p>
      ) : null}
    </div>
  );
}

export function MacroCard({
  name,
  value,
  unit,
  date,
  loading = false,
  unavailable = false,
  locale,
}: {
  name: string;
  value: number | null;
  unit: string;
  date: string | null;
  loading?: boolean;
  unavailable?: boolean;
  locale: string;
}) {
  const showValueSkeleton = loading || (unavailable && value === null);

  return (
    <div className="flex flex-col gap-3 border border-[#bbbbbb] bg-[#ffffff] p-4 sm:p-5">
      <span className="text-sm font-medium text-[#111111]/55">{name}</span>
      {showValueSkeleton ? (
        <SkeletonBlock className="h-8 w-24" />
      ) : (
        <span className="text-xl font-medium tracking-tight sm:text-2xl">
          {value !== null ? (
            `${formatPrice(value, locale, unit === "índice" ? 1 : 2)}${
              unit === "%" ? "%" : unit === "$" ? " $" : ""
            }`
          ) : (
            "—"
          )}
        </span>
      )}
      {showValueSkeleton ? (
        <SkeletonBlock className="h-3 w-16" />
      ) : (
        date && <span className="text-xs text-[#111111]/35">{date}</span>
      )}
    </div>
  );
}

export function AssetGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}

export { ChangeBadge, SkeletonBlock, formatPercent };
