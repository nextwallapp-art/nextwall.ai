"use client";

import { useEffect } from "react";
import { formatLargeUsd, formatPercent, formatPrice } from "@/lib/formatMarket";
import type { AssetDetail } from "@/lib/marketTypes";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type AssetDetailPanelProps = {
  detail: AssetDetail | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

export default function AssetDetailPanel({
  detail,
  loading,
  error,
  onClose,
}: AssetDetailPanelProps) {
  const { t, locale } = useLanguage();
  const numberLocale = locale === "es" ? "es-ES" : "en-US";
  const open = loading || Boolean(detail) || Boolean(error);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const changeFormatted = formatPercent(detail?.changePercent ?? null, numberLocale);
  const priceFormatted = formatPrice(detail?.price ?? null, numberLocale);
  const marketCapFormatted = formatLargeUsd(
    detail?.marketCap ?? null,
    numberLocale,
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-stretch sm:justify-end">
      <button
        type="button"
        aria-label={t.assetDetail.close}
        onClick={onClose}
        className="absolute inset-0 bg-[#111111]/35 backdrop-blur-[1px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-detail-title"
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden border border-[#bbbbbb] bg-[#ffffff] shadow-[0_24px_80px_-24px_rgba(17,17,17,0.35)] sm:h-full sm:max-h-none sm:rounded-none"
      >
        <div className="flex items-center justify-between border-b border-[#bbbbbb] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#111111]/40">
              {t.assetDetail.badge}
            </p>
            {loading ? (
              <div className="mt-2 h-7 w-40 animate-pulse rounded-sm bg-[#111111]/8" />
            ) : detail ? (
              <h2
                id="asset-detail-title"
                className="truncate text-xl font-medium tracking-tight"
              >
                {detail.name}
              </h2>
            ) : (
              <h2 id="asset-detail-title" className="text-xl font-medium">
                {t.assetDetail.title}
              </h2>
            )}
            {detail && (
              <p className="mt-0.5 text-sm text-[#111111]/45">{detail.symbol}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 shrink-0 text-2xl leading-none text-[#111111]/35 transition-opacity hover:text-[#111111]/70"
            aria-label={t.assetDetail.close}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading && (
            <div className="space-y-4">
              <div className="h-10 w-32 animate-pulse rounded-sm bg-[#111111]/8" />
              <div className="h-28 animate-pulse rounded-sm bg-[#111111]/6" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-sm bg-[#111111]/6"
                  />
                ))}
              </div>
              <div className="h-24 animate-pulse rounded-sm bg-[#111111]/6" />
            </div>
          )}

          {error && !loading && (
            <p className="text-sm leading-relaxed text-[#d93636]">{error}</p>
          )}

          {detail && !loading && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-end gap-3">
                {priceFormatted && (
                  <p className="text-3xl font-medium tracking-tight">
                    ${priceFormatted}
                  </p>
                )}
                {changeFormatted && (
                  <span
                    className={`text-sm font-medium ${
                      (detail.changePercent ?? 0) >= 0
                        ? "text-[#0f9d58]"
                        : "text-[#d93636]"
                    }`}
                  >
                    {changeFormatted}
                  </span>
                )}
                {marketCapFormatted && (
                  <p className="w-full text-sm text-[#111111]/50">
                    {t.assetDetail.marketCap}: {marketCapFormatted}
                  </p>
                )}
              </div>

              {detail.whatsHappening && (
                <div className="border border-[#111111] bg-[#fafafa] px-4 py-4">
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#111111]/40">
                    {t.assetDetail.whatsHappening}
                  </p>
                  <div className="mt-3 space-y-3">
                    {detail.whatsHappening.split(/\n\n+/).map((paragraph, index) => (
                      <p
                        key={`wh-${index}`}
                        className="text-sm leading-relaxed text-[#111111]/75"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {detail.microInsight && !detail.whatsHappening && (
                <div className="border border-[#111111]/12 bg-[#fafafa] px-4 py-3">
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#111111]/40">
                    {t.assetDetail.todayInsight}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#111111]/70">
                    {detail.microInsight}
                  </p>
                </div>
              )}

              {detail.topProduct && (
                <div>
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#111111]/40">
                    {t.assetDetail.topProduct}
                  </p>
                  <p className="mt-2 text-base font-medium text-[#111111]">
                    {detail.topProduct}
                  </p>
                </div>
              )}

              {detail.metrics.length > 0 && (
                <div>
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#111111]/40">
                    {t.assetDetail.financials}
                  </p>
                  <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {detail.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="border border-[#bbbbbb] bg-[#fafafa] px-3.5 py-3"
                      >
                        <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[#111111]/40">
                          {metric.label}
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-[#111111]">
                          {metric.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {detail.revenueDrivers.length > 0 && (
                <div>
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#111111]/40">
                    {t.assetDetail.revenueDrivers}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {detail.revenueDrivers.map((driver) => (
                      <li
                        key={driver}
                        className="flex gap-2 text-sm leading-relaxed text-[#111111]/70"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#111111]/35" />
                        <span>{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detail.description && (
                <div>
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[#111111]/40">
                    {t.assetDetail.overview}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#111111]/65">
                    {detail.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
