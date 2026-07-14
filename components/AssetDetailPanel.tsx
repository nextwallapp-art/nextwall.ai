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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#111111]/40 sm:text-[0.65rem] sm:tracking-[0.16em]">
      {children}
    </p>
  );
}

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
  const changeUp = (detail?.changePercent ?? 0) >= 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-stretch sm:justify-end">
      <button
        type="button"
        aria-label={t.assetDetail.close}
        onClick={onClose}
        className="absolute inset-0 bg-[#111111]/40 backdrop-blur-[2px] sm:bg-[#111111]/35 sm:backdrop-blur-[1px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-detail-title"
        className="relative flex h-[min(94dvh,100%)] max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[1.35rem] border border-b-0 border-[#bbbbbb] bg-[#ffffff] shadow-[0_-8px_40px_-12px_rgba(17,17,17,0.28)] sm:h-full sm:max-h-none sm:max-w-lg sm:rounded-none sm:border-b sm:shadow-[0_24px_80px_-24px_rgba(17,17,17,0.35)]"
      >
        <div className="flex shrink-0 justify-center pt-3 sm:hidden">
          <span
            aria-hidden="true"
            className="h-1 w-12 rounded-full bg-[#111111]/12"
          />
        </div>

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#bbbbbb] px-[var(--page-gutter)] py-4 sm:items-center sm:px-5 sm:py-4">
          <div className="min-w-0 flex-1">
            <SectionLabel>{t.assetDetail.badge}</SectionLabel>
            {loading ? (
              <div className="mt-3 h-8 w-48 max-w-full animate-pulse rounded-sm bg-[#111111]/8" />
            ) : detail ? (
              <h2
                id="asset-detail-title"
                className="mt-2 text-2xl font-medium leading-tight tracking-tight text-[#111111] sm:truncate sm:text-xl"
              >
                {detail.name}
              </h2>
            ) : (
              <h2
                id="asset-detail-title"
                className="mt-2 text-2xl font-medium sm:text-xl"
              >
                {t.assetDetail.title}
              </h2>
            )}
            {detail && (
              <p className="mt-1.5 text-sm text-[#111111]/45">{detail.symbol}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#bbbbbb] text-xl leading-none text-[#111111]/50 transition-colors hover:text-[#111111]/80 sm:ml-4 sm:h-auto sm:w-auto sm:rounded-none sm:border-0"
            aria-label={t.assetDetail.close}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-[var(--page-gutter)] py-6 pb-[calc(5.5rem+var(--safe-bottom))] sm:px-5 sm:py-5 sm:pb-5">
          {loading && (
            <div className="space-y-8 sm:space-y-4">
              <div className="h-24 animate-pulse rounded-xl bg-[#111111]/6 sm:rounded-sm" />
              <div className="h-36 animate-pulse rounded-xl bg-[#111111]/6 sm:rounded-sm" />
              <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-lg bg-[#111111]/6 sm:h-16 sm:rounded-sm"
                  />
                ))}
              </div>
            </div>
          )}

          {error && !loading && (
            <p className="text-base leading-relaxed text-[#d93636] sm:text-sm">
              {error}
            </p>
          )}

          {detail && !loading && (
            <div className="space-y-8 sm:space-y-6">
              <section className="rounded-xl border border-[#bbbbbb] bg-[#fafafa] p-5 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                  {priceFormatted && (
                    <p className="text-[2rem] font-medium leading-none tracking-tight sm:text-3xl">
                      ${priceFormatted}
                    </p>
                  )}
                  {changeFormatted && (
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${
                        changeUp
                          ? "bg-[#0f9d58]/10 text-[#0f9d58]"
                          : "bg-[#d93636]/10 text-[#d93636]"
                      }`}
                    >
                      {changeFormatted}
                    </span>
                  )}
                </div>
                {marketCapFormatted && (
                  <p className="mt-4 text-sm leading-relaxed text-[#111111]/55">
                    <span className="block text-xs uppercase tracking-[0.12em] text-[#111111]/40">
                      {t.assetDetail.marketCap}
                    </span>
                    <span className="mt-1 block text-base font-medium text-[#111111]">
                      {marketCapFormatted}
                    </span>
                  </p>
                )}
              </section>

              {detail.whatsHappening && (
                <section className="rounded-xl border border-[#111111]/20 bg-[#fafafa] p-5 sm:rounded-none sm:border sm:border-[#111111] sm:p-4">
                  <SectionLabel>{t.assetDetail.whatsHappening}</SectionLabel>
                  <div className="mt-4 space-y-4 sm:mt-3 sm:space-y-3">
                    {detail.whatsHappening.split(/\n\n+/).map((paragraph, index) => (
                      <p
                        key={`wh-${index}`}
                        className="text-[0.9375rem] leading-[1.75] text-[#111111]/78 sm:text-sm sm:leading-relaxed sm:text-[#111111]/75"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              )}

              {detail.microInsight && !detail.whatsHappening && (
                <section className="rounded-xl border border-[#111111]/12 bg-[#fafafa] p-5 sm:rounded-none sm:p-4">
                  <SectionLabel>{t.assetDetail.todayInsight}</SectionLabel>
                  <p className="mt-4 text-[0.9375rem] leading-[1.75] text-[#111111]/70 sm:mt-2 sm:text-sm sm:leading-relaxed">
                    {detail.microInsight}
                  </p>
                </section>
              )}

              {detail.topProduct && (
                <section className="border-t border-[#bbbbbb] pt-6 sm:border-t-0 sm:pt-0">
                  <SectionLabel>{t.assetDetail.topProduct}</SectionLabel>
                  <p className="mt-3 text-lg font-medium leading-snug text-[#111111] sm:mt-2 sm:text-base">
                    {detail.topProduct}
                  </p>
                </section>
              )}

              {detail.metrics.length > 0 && (
                <section>
                  <SectionLabel>{t.assetDetail.financials}</SectionLabel>
                  <dl className="mt-4 overflow-hidden rounded-xl border border-[#bbbbbb] sm:mt-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:rounded-none sm:border-0">
                    {detail.metrics.map((metric, index) => (
                      <div
                        key={metric.label}
                        className={`flex items-center justify-between gap-4 bg-[#fafafa] px-4 py-4 sm:flex-col sm:items-start sm:border sm:border-[#bbbbbb] sm:px-3.5 sm:py-3 ${
                          index > 0 ? "border-t border-[#bbbbbb] sm:border-t" : ""
                        }`}
                      >
                        <dt className="text-xs uppercase tracking-[0.1em] text-[#111111]/45 sm:text-[0.65rem] sm:tracking-[0.14em] sm:text-[#111111]/40">
                          {metric.label}
                        </dt>
                        <dd className="text-right text-base font-medium text-[#111111] sm:text-left sm:text-sm">
                          {metric.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              {detail.revenueDrivers.length > 0 && (
                <section className="border-t border-[#bbbbbb] pt-6 sm:border-t-0 sm:pt-0">
                  <SectionLabel>{t.assetDetail.revenueDrivers}</SectionLabel>
                  <ul className="mt-4 space-y-4 sm:mt-3 sm:space-y-2">
                    {detail.revenueDrivers.map((driver) => (
                      <li
                        key={driver}
                        className="flex gap-3 text-[0.9375rem] leading-[1.65] text-[#111111]/72 sm:gap-2 sm:text-sm sm:leading-relaxed sm:text-[#111111]/70"
                      >
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#111111]/30 sm:mt-2 sm:h-1 sm:w-1" />
                        <span>{driver}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {detail.description && (
                <section className="border-t border-[#bbbbbb] pt-6 sm:border-t-0 sm:pt-0">
                  <SectionLabel>{t.assetDetail.overview}</SectionLabel>
                  <p className="mt-4 text-[0.9375rem] leading-[1.75] text-[#111111]/68 sm:mt-3 sm:text-sm sm:leading-relaxed sm:text-[#111111]/65">
                    {detail.description}
                  </p>
                </section>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[#bbbbbb] bg-[#ffffff] px-[var(--page-gutter)] py-3 pb-[calc(0.75rem+var(--safe-bottom))] sm:hidden">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-[#bbbbbb] bg-[#fafafa] px-4 py-3.5 text-sm font-medium text-[#111111] transition-opacity hover:opacity-80"
          >
            {t.assetDetail.close}
          </button>
        </div>
      </aside>
    </div>
  );
}
