"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import LanguageToggle from "@/components/LanguageToggle";
import RotatingWheelSelector, {
  type WheelSection,
} from "@/components/RotatingWheelSelector";
import {
  CRYPTO_BY_NAME,
  GENERAL_CRYPTO_SYMBOLS,
  GENERAL_ETF_SYMBOLS,
  GENERAL_INDEX_SYMBOLS,
  GENERAL_MARKET_SYMBOLS,
  GENERAL_METAL_SYMBOLS,
  INDEX_FUND_SYMBOLS,
  MACRO_IDS,
  STOCK_BY_NAME,
  type SelectedAssets,
} from "@/lib/profileAssets";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

type Stock = {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
};

type Crypto = {
  symbol: string;
  name: string;
  price: number | null;
  change24h: number | null;
};

type Macro = {
  id: string;
  name: string;
  value: number | null;
  unit: string;
  date: string | null;
};

type MarketData = {
  stocks: Stock[];
  crypto: Crypto[];
  macro: Macro[];
  analysis: string | null;
  marketOpen: boolean;
  lastUpdated: string;
};

type UserProfile = {
  selected_assets: SelectedAssets | null;
};

function SectionBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium uppercase tracking-widest text-[#111111]/40">
          {title}
        </h3>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#111111]/55">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function AssetGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{children}</div>
  );
}

function formatNumber(value: number | null, locale: string, decimals = 2) {
  if (value === null) return "—";
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function ChangeBadge({
  value,
  noDataLabel,
  suffix = "%",
}: {
  value: number | null;
  noDataLabel: string;
  suffix?: string;
}) {
  if (value === null) {
    return <span className="text-sm text-[#111111]/30">{noDataLabel}</span>;
  }
  const up = value >= 0;
  return (
    <span
      className={`text-sm font-medium ${up ? "text-[#0f9d58]" : "text-[#d93636]"}`}
    >
      {up ? "+" : ""}
      {value.toFixed(2)}
      {suffix}
    </span>
  );
}

function PriceCard({
  name,
  symbol,
  price,
  prefix = "$",
  change,
  locale,
  noDataLabel,
}: {
  name: string;
  symbol: string;
  price: number | null;
  prefix?: string;
  change: number | null;
  locale: string;
  noDataLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2 border border-[#bbbbbb] bg-[#ffffff] p-5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-[#111111]/55">{name}</span>
        <span className="text-xs text-[#111111]/30">{symbol}</span>
      </div>
      <span className="text-2xl font-medium tracking-tight">
        {price !== null ? `${prefix}${formatNumber(price, locale)}` : "—"}
      </span>
      <ChangeBadge value={change} noDataLabel={noDataLabel} />
    </div>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-[#111111]/8 ${className}`} />;
}

function MacroCard({
  name,
  value,
  unit,
  date,
  locale,
}: {
  name: string;
  value: number | null;
  unit: string;
  date: string | null;
  locale: string;
}) {
  return (
    <div className="flex flex-col gap-2 border border-[#bbbbbb] bg-[#ffffff] p-5">
      <span className="text-sm font-medium text-[#111111]/55">{name}</span>
      <span className="text-2xl font-medium tracking-tight">
        {value !== null
          ? `${formatNumber(value, locale, unit === "índice" ? 1 : 2)}${
              unit === "%" ? "%" : unit === "$" ? " $" : ""
            }`
          : "—"}
      </span>
      {date && (
        <span className="text-xs text-[#111111]/35">{date}</span>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="w-full">
      <div className="mx-auto mb-8 h-[720px] w-[720px] max-w-[94vw] animate-pulse rounded-full bg-[#111111]/8" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 border border-[#bbbbbb] bg-[#ffffff] p-5"
          >
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-7 w-24" />
            <SkeletonBlock className="h-4 w-14" />
          </div>
        ))}
      </div>
      <div className="mt-12 flex flex-col gap-3">
        <SkeletonBlock className="h-5 w-48" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("success") === "true";
  const { locale, t } = useLanguage();
  const numberLocale = locale === "es" ? "es-ES" : "en-US";

  const [email, setEmail] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState<WheelSection | null>(null);

  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch("/api/market-analysis", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? t.dashboard.errors.loadFailed);
      }

      const json = (await res.json()) as MarketData;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.dashboard.errors.unexpected);
    } finally {
      setLoading(false);
    }
  }, [router, t.dashboard.errors.loadFailed, t.dashboard.errors.unexpected]);

  useEffect(() => {
    async function init() {
      console.log("[dashboard] Init — checking session and profile…");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.log("[dashboard] No session → /login");
        router.replace("/login");
        return;
      }

      console.log("[dashboard] Session OK, user:", session.user.id);

      try {
        const res = await fetch("/api/user-profile", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = (await res.json()) as {
          hasProfile?: boolean;
          profile?: UserProfile | null;
          error?: string;
          hint?: string;
        };

        console.log("[dashboard] Profile check response:", json);

        if (!json.hasProfile) {
          console.log("[dashboard] No profile → /onboarding");
          router.replace("/onboarding");
          return;
        }

        console.log("[dashboard] Profile found → loading dashboard");
        setProfile(json.profile ?? null);
        setEmail(session.user.email ?? null);
        setCheckingSession(false);
        loadAnalysis();
      } catch (err) {
        console.error("[dashboard] Profile check failed:", err);
        router.replace("/onboarding");
      }
    }

    init();
  }, [router, loadAnalysis]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <DashboardSidebar compact onSignOut={handleSignOut} />
        <DashboardSidebar onSignOut={handleSignOut} />
        <div className="flex flex-1 items-center justify-center text-[#111111]/40">
          {t.dashboard.loading}
        </div>
      </div>
    );
  }

  const lastUpdatedLabel = data
    ? new Date(data.lastUpdated).toLocaleTimeString(numberLocale, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const selected = profile?.selected_assets ?? {};
  const userStockSymbols = new Set(
    (selected.stocks ?? [])
      .map((n) => STOCK_BY_NAME[n]?.symbol)
      .filter((s): s is string => !!s),
  );
  const userEtfSymbols = new Set(
    (selected.etfs ?? [])
      .map((n) => STOCK_BY_NAME[n]?.symbol)
      .filter((s): s is string => !!s),
  );
  const userMetalSymbols = new Set(
    (selected.metals ?? [])
      .map((n) => STOCK_BY_NAME[n]?.symbol)
      .filter((s): s is string => !!s),
  );
  const userCryptoSymbols = new Set(
    (selected.crypto ?? [])
      .map((n) => CRYPTO_BY_NAME[n]?.symbol)
      .filter((s): s is string => !!s),
  );

  const generalEtfStocks =
    data?.stocks.filter((s) => GENERAL_ETF_SYMBOLS.includes(s.symbol)) ?? [];
  const generalIndexStocks =
    data?.stocks.filter((s) => GENERAL_INDEX_SYMBOLS.includes(s.symbol)) ?? [];
  const generalMarketStocks =
    data?.stocks.filter((s) => GENERAL_MARKET_SYMBOLS.includes(s.symbol)) ??
    [];
  const userStocks =
    data?.stocks.filter((s) => userStockSymbols.has(s.symbol)) ?? [];
  const allUserEtfs =
    data?.stocks.filter((s) => userEtfSymbols.has(s.symbol)) ?? [];
  const userIndexFunds = allUserEtfs.filter((s) =>
    INDEX_FUND_SYMBOLS.includes(s.symbol),
  );
  const userEtfs = allUserEtfs.filter(
    (s) => !INDEX_FUND_SYMBOLS.includes(s.symbol),
  );
  const generalMetalStocks =
    data?.stocks.filter((s) => GENERAL_METAL_SYMBOLS.includes(s.symbol)) ??
    [];
  const userMetals =
    data?.stocks.filter((s) => userMetalSymbols.has(s.symbol)) ?? [];
  const generalCrypto =
    data?.crypto.filter((c) => GENERAL_CRYPTO_SYMBOLS.includes(c.symbol)) ??
    [];
  const userCrypto =
    data?.crypto.filter((c) => userCryptoSymbols.has(c.symbol)) ?? [];
  const macroItems =
    data?.macro.filter((m) => MACRO_IDS.includes(m.id)) ?? [];

  const hasUserEtfs = userEtfs.length > 0;
  const hasUserIndexFunds = userIndexFunds.length > 0;
  const hasUserStocks = userStocks.length > 0;
  const hasUserCrypto = userCrypto.length > 0;
  const hasUserMetals = userMetals.length > 0;

  return (
    <div className="flex min-h-screen flex-col text-[#111111] md:flex-row">
      <DashboardSidebar compact onSignOut={handleSignOut} email={email} />
      <DashboardSidebar onSignOut={handleSignOut} email={email} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-end px-8 py-6 sm:px-10">
          <LanguageToggle />
        </div>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pb-24 sm:px-10">
        {showSuccess && (
          <p className="animate-fade-up mb-8 text-lg font-medium">
            {t.dashboard.success}
          </p>
        )}

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
              {t.dashboard.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#111111]/45">
              {data && (
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      data.marketOpen ? "bg-[#0f9d58]" : "bg-[#111111]/30"
                    }`}
                  />
                  {data.marketOpen
                    ? t.dashboard.realtime
                    : t.dashboard.lastClose}
                </span>
              )}
              {lastUpdatedLabel && (
                <span>
                  {t.dashboard.updatedAt} {lastUpdatedLabel}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={loadAnalysis}
            disabled={loading}
            className="inline-flex bg-[#4B4B4B] px-6 py-3 text-sm font-medium text-[#ffffff] transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {loading ? t.dashboard.refreshing : t.dashboard.refresh}
          </button>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="border border-[#d93636]/20 bg-[#d93636]/5 p-6 text-sm text-[#d93636]">
            {error}
          </div>
        ) : data ? (
          <>
            <RotatingWheelSelector
              locale={locale}
              selected={activeSection}
              onSelect={setActiveSection}
            />

            {activeSection === "etfs" && (
              <div key="etfs" className="animate-fade-up mt-10 space-y-10">
                <SectionBlock
                  title={t.dashboard.sectionGeneral}
                  description={t.dashboard.generalEtfs}
                >
                  <AssetGrid>
                    {generalEtfStocks.map((s) => (
                      <PriceCard
                        key={s.symbol}
                        name={s.name}
                        symbol={s.symbol}
                        price={s.price}
                        change={s.changePercent}
                        locale={numberLocale}
                        noDataLabel={t.dashboard.noData}
                      />
                    ))}
                  </AssetGrid>
                </SectionBlock>

                {hasUserEtfs ? (
                  <SectionBlock title={t.dashboard.yourAssets}>
                    <AssetGrid>
                      {userEtfs.map((s) => (
                        <PriceCard
                          key={s.symbol}
                          name={s.name}
                          symbol={s.symbol}
                          price={s.price}
                          change={s.changePercent}
                          locale={numberLocale}
                          noDataLabel={t.dashboard.noData}
                        />
                      ))}
                    </AssetGrid>
                  </SectionBlock>
                ) : (
                  <p className="text-sm text-[#111111]/40">
                    {t.dashboard.noAssetsInSection}
                  </p>
                )}
              </div>
            )}

            {activeSection === "indexFunds" && (
              <div key="indexFunds" className="animate-fade-up mt-10 space-y-10">
                <SectionBlock
                  title={t.dashboard.sectionGeneral}
                  description={t.dashboard.generalIndex}
                >
                  <AssetGrid>
                    {generalIndexStocks.map((s) => (
                      <PriceCard
                        key={s.symbol}
                        name={s.name}
                        symbol={s.symbol}
                        price={s.price}
                        change={s.changePercent}
                        locale={numberLocale}
                        noDataLabel={t.dashboard.noData}
                      />
                    ))}
                  </AssetGrid>
                </SectionBlock>

                {hasUserIndexFunds ? (
                  <SectionBlock title={t.dashboard.yourAssets}>
                    <AssetGrid>
                      {userIndexFunds.map((s) => (
                        <PriceCard
                          key={s.symbol}
                          name={s.name}
                          symbol={s.symbol}
                          price={s.price}
                          change={s.changePercent}
                          locale={numberLocale}
                          noDataLabel={t.dashboard.noData}
                        />
                      ))}
                    </AssetGrid>
                  </SectionBlock>
                ) : (
                  <p className="text-sm text-[#111111]/40">
                    {t.dashboard.noAssetsInSection}
                  </p>
                )}
              </div>
            )}

            {activeSection === "stocks" && (
              <div key="stocks" className="animate-fade-up mt-10 space-y-10">
                <SectionBlock
                  title={t.dashboard.sectionGeneral}
                  description={t.dashboard.generalStocks}
                >
                  <AssetGrid>
                    {generalMarketStocks.map((s) => (
                      <PriceCard
                        key={s.symbol}
                        name={s.name}
                        symbol={s.symbol}
                        price={s.price}
                        change={s.changePercent}
                        locale={numberLocale}
                        noDataLabel={t.dashboard.noData}
                      />
                    ))}
                  </AssetGrid>
                </SectionBlock>

                {hasUserStocks ? (
                  <SectionBlock title={t.dashboard.yourAssets}>
                    <AssetGrid>
                      {userStocks.map((s) => (
                        <PriceCard
                          key={s.symbol}
                          name={s.name}
                          symbol={s.symbol}
                          price={s.price}
                          change={s.changePercent}
                          locale={numberLocale}
                          noDataLabel={t.dashboard.noData}
                        />
                      ))}
                    </AssetGrid>
                  </SectionBlock>
                ) : (
                  <p className="text-sm text-[#111111]/40">
                    {t.dashboard.noAssetsInSection}
                  </p>
                )}
              </div>
            )}

            {activeSection === "crypto" && (
              <div key="crypto" className="animate-fade-up mt-10 space-y-10">
                <SectionBlock
                  title={t.dashboard.sectionGeneral}
                  description={t.dashboard.generalCrypto}
                >
                  <AssetGrid>
                    {generalCrypto.map((c) => (
                      <PriceCard
                        key={c.symbol}
                        name={c.name}
                        symbol={c.symbol}
                        price={c.price}
                        change={c.change24h}
                        locale={numberLocale}
                        noDataLabel={t.dashboard.noData}
                      />
                    ))}
                  </AssetGrid>
                </SectionBlock>

                {hasUserCrypto ? (
                  <SectionBlock title={t.dashboard.yourAssets}>
                    <AssetGrid>
                      {userCrypto.map((c) => (
                        <PriceCard
                          key={c.symbol}
                          name={c.name}
                          symbol={c.symbol}
                          price={c.price}
                          change={c.change24h}
                          locale={numberLocale}
                          noDataLabel={t.dashboard.noData}
                        />
                      ))}
                    </AssetGrid>
                  </SectionBlock>
                ) : (
                  <p className="text-sm text-[#111111]/40">
                    {t.dashboard.noAssetsInSection}
                  </p>
                )}
              </div>
            )}

            {activeSection === "metals" && (
              <div key="metals" className="animate-fade-up mt-10 space-y-10">
                <SectionBlock
                  title={t.dashboard.sectionGeneral}
                  description={t.dashboard.generalMetals}
                >
                  <AssetGrid>
                    {generalMetalStocks.map((s) => (
                      <PriceCard
                        key={s.symbol}
                        name={s.name}
                        symbol={s.symbol}
                        price={s.price}
                        change={s.changePercent}
                        locale={numberLocale}
                        noDataLabel={t.dashboard.noData}
                      />
                    ))}
                  </AssetGrid>
                </SectionBlock>

                {hasUserMetals ? (
                  <SectionBlock title={t.dashboard.yourAssets}>
                    <AssetGrid>
                      {userMetals.map((s) => (
                        <PriceCard
                          key={s.symbol}
                          name={s.name}
                          symbol={s.symbol}
                          price={s.price}
                          change={s.changePercent}
                          locale={numberLocale}
                          noDataLabel={t.dashboard.noData}
                        />
                      ))}
                    </AssetGrid>
                  </SectionBlock>
                ) : (
                  <p className="text-sm text-[#111111]/40">
                    {t.dashboard.noAssetsInSection}
                  </p>
                )}
              </div>
            )}

            {activeSection === "macro" && (
              <div key="macro" className="animate-fade-up mt-10 space-y-10">
                <SectionBlock
                  title={t.dashboard.sectionGeneral}
                  description={t.dashboard.generalMacro}
                >
                  <AssetGrid>
                    {macroItems.map((m) => (
                      <MacroCard
                        key={m.id}
                        name={m.name}
                        value={m.value}
                        unit={m.unit}
                        date={m.date}
                        locale={numberLocale}
                      />
                    ))}
                  </AssetGrid>
                </SectionBlock>
              </div>
            )}

            {activeSection && (
            <section className="mt-12 max-w-2xl">
              <h2 className="text-lg font-medium tracking-tight">
                {t.dashboard.analysisTitle}
              </h2>
              {data.analysis ? (
                <div className="mt-5 text-[#111111]/75">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2
                          style={{
                            fontSize: 16,
                            fontWeight: 500,
                            marginBottom: 8,
                            marginTop: 16,
                          }}
                        >
                          {children}
                        </h2>
                      ),
                      p: ({ children }) => (
                        <p
                          style={{
                            fontSize: 14,
                            lineHeight: 1.7,
                            marginBottom: 12,
                          }}
                        >
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong style={{ fontWeight: 500 }}>{children}</strong>
                      ),
                    }}
                  >
                    {data.analysis}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#111111]/45">
                  {t.dashboard.analysisUnavailable}
                </p>
              )}
            </section>
            )}
          </>
        ) : null}
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-[#111111]/40">
          Loading…
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
