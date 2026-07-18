"use client";

import AssetCard, { AssetGrid, MacroCard, SkeletonBlock } from "@/components/AssetCard";
import AssetDetailPanel from "@/components/AssetDetailPanel";
import DashboardSidebar from "@/components/DashboardSidebar";
import LanguageToggle from "@/components/LanguageToggle";
import LearningModeToggle from "@/components/LearningModeToggle";
import ExpandableAnalysis from "@/components/ExpandableAnalysis";
import LegalFooter from "@/components/LegalFooter";
import {
  dismissOnboardingBanner,
  shouldShowOnboardingBanner,
} from "@/lib/onboardingBanner";
import { getClientMarketCache, isClientCacheFresh, setClientMarketCache } from "@/lib/clientMarketCache";
import { formatRelativeUpdated } from "@/lib/formatRelativeTime";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getAssetMicroInsight, type StructuredAnalysis } from "@/lib/marketAnalysis";
import type { AssetDetail } from "@/lib/marketTypes";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

const LEARNING_MODE_KEY = "nextwall-learning-mode";

type DashboardTab = "markets" | "crypto" | "macro";

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

type UserProfile = {
  experience_level: string | null;
  last_onboarding_date: string | null;
};

type DataSource = "finnhub" | "coingecko" | "fred";

type MarketData = {
  stocks: Stock[];
  crypto: Crypto[];
  macro: Macro[];
  marketOpen: boolean;
  lastUpdated: string;
  analysis: StructuredAnalysis | null;
  sourceErrors?: DataSource[];
  refreshQuota?: {
    used: number;
    limit: number;
    remaining: number;
    retryAfter: number;
  };
  analysisReused?: boolean;
  claudeQuota?: {
    used: number;
    limit: number;
    remaining: number;
  };
};

function DashboardTabs({
  activeTab,
  onChange,
  labels,
}: {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
  labels: { markets: string; crypto: string; macro: string };
}) {
  const tabs: { id: DashboardTab; label: string }[] = [
    { id: "markets", label: labels.markets },
    { id: "crypto", label: labels.crypto },
    { id: "macro", label: labels.macro },
  ];

  return (
    <div className="-mx-[var(--page-gutter)] mb-8 flex gap-5 overflow-x-auto border-b border-[#bbbbbb] px-[var(--page-gutter)] pb-1 scrollbar-none sm:mx-0 sm:gap-6 sm:px-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`-mb-px shrink-0 pb-3 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "border-b-2 border-[#111111] text-[#111111]"
              : "text-[#111111]/40 hover:text-[#111111]/65"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function LoadingBanner({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8 border border-[#bbbbbb] bg-[#fafafa] px-5 py-4">
      <p className="text-sm font-medium text-[#111111]">{title}</p>
      <p className="mt-1 text-sm text-[#111111]/55">{subtitle}</p>
    </div>
  );
}

function SourceErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-6 border border-[#bbbbbb] bg-[#fafafa] px-4 py-3 text-sm leading-relaxed text-[#111111]/65 sm:px-5">
      {message}
    </div>
  );
}

function OnboardingReminderBanner({
  message,
  actionLabel,
  onDismiss,
}: {
  message: string;
  actionLabel: string;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4 border border-[#bbbbbb] bg-[#fafafa] px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed text-[#111111]/65">{message}</p>
        <Link
          href="/onboarding"
          className="mt-2 inline-block text-sm font-medium text-[#111111] underline decoration-[#111111]/30 underline-offset-2 transition-opacity hover:opacity-70"
        >
          {actionLabel}
        </Link>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar"
        className="shrink-0 text-lg leading-none text-[#111111]/35 transition-opacity hover:text-[#111111]/65"
      >
        ×
      </button>
    </div>
  );
}

function DashboardPageSkeleton() {
  return (
    <div className="w-full">
      <div className="mb-10 space-y-3">
        <SkeletonBlock className="h-9 w-full max-w-xl" />
      </div>

      <div className="mb-8 flex gap-6 border-b border-[#bbbbbb] pb-3">
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-16" />
        <SkeletonBlock className="h-4 w-14" />
      </div>

      <AssetGrid>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 border border-[#bbbbbb] bg-[#ffffff] p-5"
          >
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-8 w-28" />
            <SkeletonBlock className="h-3 w-full" />
          </div>
        ))}
      </AssetGrid>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 border border-[#bbbbbb] bg-[#ffffff] p-5"
          >
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-10/12" />
          </div>
        ))}
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
  const [activeTab, setActiveTab] = useState<DashboardTab>("markets");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [learningMode, setLearningMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);
  const [relativeUpdated, setRelativeUpdated] = useState("");
  const [assetDetail, setAssetDetail] = useState<AssetDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [refreshQuota, setRefreshQuota] = useState<MarketData["refreshQuota"]>(undefined);
  const [analysisReused, setAnalysisReused] = useState(false);
  const loadInFlightRef = useRef(false);

  useEffect(() => {
    if (!data?.lastUpdated) {
      setRelativeUpdated("");
      return;
    }

    const update = () => {
      setRelativeUpdated(formatRelativeUpdated(data.lastUpdated, locale));
    };

    update();
    const intervalId = window.setInterval(update, 30_000);
    return () => window.clearInterval(intervalId);
  }, [data?.lastUpdated, locale]);

  useEffect(() => {
    const stored = localStorage.getItem(LEARNING_MODE_KEY);
    if (stored === "true") {
      setLearningMode(true);
    }
  }, []);

  function handleLearningModeChange(enabled: boolean) {
    setLearningMode(enabled);
    localStorage.setItem(LEARNING_MODE_KEY, String(enabled));
  }

  const fetchRefreshQuota = useCallback(async (accessToken: string) => {
    try {
      const res = await fetch("/api/market-analysis?quota=1", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return;
      const json = (await res.json()) as { refreshQuota?: MarketData["refreshQuota"] };
      if (json.refreshQuota) {
        setRefreshQuota(json.refreshQuota);
      }
    } catch {
      // quota is non-critical
    }
  }, []);

  const loadAnalysis = useCallback(
    async (options?: { force?: boolean }) => {
      if (loadInFlightRef.current && !options?.force) return;

      loadInFlightRef.current = true;
      setLoading(true);
      if (options?.force) {
        setError(null);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        loadInFlightRef.current = false;
        router.replace("/login");
        return;
      }

      const activeUserId = userId ?? session.user.id;

      if (!options?.force && isClientCacheFresh(activeUserId)) {
        const cached = getClientMarketCache(activeUserId);
        if (cached) {
          setData(cached as MarketData);
          if (cached.refreshQuota) {
            setRefreshQuota(cached.refreshQuota);
          } else {
            void fetchRefreshQuota(session.access_token);
          }
          setLoading(false);
          loadInFlightRef.current = false;
          return;
        }
      }

      if (!options?.force) {
        const cached = getClientMarketCache(activeUserId);
        if (cached) {
          setData(cached as MarketData);
          if (cached.refreshQuota) {
            setRefreshQuota(cached.refreshQuota);
          }
        }
      }

      const url = options?.force
        ? "/api/market-analysis?force=1"
        : "/api/market-analysis";

      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            error?: string;
            redirect?: string;
            refreshQuota?: MarketData["refreshQuota"];
          } | null;

          if (res.status === 403 && body?.redirect) {
            router.replace(body.redirect);
            return;
          }

          if (body?.refreshQuota) {
            setRefreshQuota(body.refreshQuota);
          }

          if (res.status === 429) {
            if (body?.refreshQuota?.remaining === 0) {
              const hours = Math.max(
                1,
                Math.ceil((body.refreshQuota.retryAfter ?? 3600) / 3600),
              );
              throw new Error(
                t.dashboard.dailyRefreshLimited
                  .replace("{limit}", String(body.refreshQuota.limit))
                  .replace("{hours}", String(hours)),
              );
            }

            const retryAfter = res.headers.get("Retry-After") ?? "60";
            throw new Error(
              t.dashboard.rateLimited.replace("{seconds}", retryAfter),
            );
          }

          throw new Error(body?.error ?? t.dashboard.errors.loadFailed);
        }

        const json = (await res.json()) as MarketData;
        setData(json);
        if (json.refreshQuota) {
          setRefreshQuota(json.refreshQuota);
        }
        setAnalysisReused(json.analysisReused === true);
        setClientMarketCache(activeUserId, json);
      } catch (err) {
        setError(err instanceof Error ? err.message : t.dashboard.errors.unexpected);
      } finally {
        loadInFlightRef.current = false;
        setLoading(false);
      }
    },
    [
      router,
      userId,
      fetchRefreshQuota,
      t.dashboard.errors.loadFailed,
      t.dashboard.errors.unexpected,
      t.dashboard.rateLimited,
      t.dashboard.dailyRefreshLimited,
    ],
  );

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch("/api/user-profile", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = (await res.json()) as {
          hasProfile?: boolean;
          profile?: UserProfile | null;
        };

        if (!json.hasProfile) {
          router.replace("/onboarding");
          return;
        }

        setProfile(json.profile ?? null);
        setUserId(session.user.id);
        setEmail(session.user.email ?? null);
        setShowOnboardingBanner(
          shouldShowOnboardingBanner(
            json.profile?.last_onboarding_date,
            session.user.id,
          ),
        );
        setCheckingSession(false);
        loadAnalysis();
      } catch {
        router.replace("/onboarding");
      }
    }

    init();
  }, [router, loadAnalysis]);

  function handleDismissOnboardingBanner() {
    if (userId) {
      dismissOnboardingBanner(userId);
    }
    setShowOnboardingBanner(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const analysis = data?.analysis ?? null;
  const analysisLoading = loading && !analysis;
  const marketLoading = loading && !data;
  const sourceErrors = data?.sourceErrors ?? [];

  const openAssetDetail = useCallback(
    async (type: "stock" | "crypto", symbol: string, name: string) => {
      setDetailLoading(true);
      setDetailError(null);
      setAssetDetail(null);

      const microInsight = getAssetMicroInsight(analysis, symbol);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      try {
        const params = new URLSearchParams({
          type,
          symbol,
          name,
          locale,
        });

        if (microInsight) {
          params.set("microInsight", microInsight);
        }

        if (profile?.experience_level) {
          params.set("experienceLevel", profile.experience_level);
        }

        const res = await fetch(`/api/asset-detail?${params.toString()}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            error?: string;
            redirect?: string;
          } | null;

          if (res.status === 403 && body?.redirect) {
            router.replace(body.redirect);
            return;
          }

          throw new Error(body?.error ?? t.assetDetail.unavailable);
        }

        const json = (await res.json()) as AssetDetail;
        setAssetDetail(json);
      } catch (err) {
        setDetailError(
          err instanceof Error ? err.message : t.assetDetail.unavailable,
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [analysis, locale, profile?.experience_level, router, t.assetDetail.unavailable],
  );

  function closeAssetDetail() {
    setAssetDetail(null);
    setDetailError(null);
    setDetailLoading(false);
  }

  const sourceErrorMessage = useMemo(() => {
    if (sourceErrors.length === 0) return null;
    const names = sourceErrors.map((source) => t.dashboard.sources[source]).join(", ");
    return t.dashboard.sourceErrorPartial.replace("{sources}", names);
  }, [sourceErrors, t.dashboard.sourceErrorPartial, t.dashboard.sources]);

  const finnhubUnavailable = sourceErrors.includes("finnhub");
  const coingeckoUnavailable = sourceErrors.includes("coingecko");
  const fredUnavailable = sourceErrors.includes("fred");

  const tabAssets = useMemo(() => {
    if (!data) {
      return { markets: [], crypto: [], macro: [] };
    }
    return {
      markets: data.stocks,
      crypto: data.crypto,
      macro: data.macro,
    };
  }, [data]);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen flex-col text-[#111111] md:flex-row">
        <DashboardSidebar compact onSignOut={handleSignOut} />
        <DashboardSidebar onSignOut={handleSignOut} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-end gap-4 px-6 py-6 sm:gap-6 sm:px-10">
            <SkeletonBlock className="h-6 w-32" />
            <SkeletonBlock className="h-6 w-20" />
          </div>
          <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-24 sm:px-10">
            <DashboardPageSkeleton />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col text-[#111111] md:flex-row">
      <DashboardSidebar compact onSignOut={handleSignOut} email={email} active="home" />
      <DashboardSidebar onSignOut={handleSignOut} email={email} active="home" />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-6 sm:px-10 sm:py-6">
          <LearningModeToggle
            enabled={learningMode}
            onChange={handleLearningModeChange}
            label={t.dashboard.learningMode}
          />
          <LanguageToggle />
        </div>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-[var(--page-gutter)] pb-[calc(6rem+var(--safe-bottom))] sm:px-6 md:px-10">
          {showSuccess && (
            <p className="animate-fade-up mb-8 text-lg font-medium">
              {t.dashboard.success}
            </p>
          )}

          {showOnboardingBanner && (
            <OnboardingReminderBanner
              message={t.dashboard.onboardingBanner}
              actionLabel={t.dashboard.onboardingBannerAction}
              onDismiss={handleDismissOnboardingBanner}
            />
          )}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
                {t.dashboard.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#111111]/45">
                {data ? (
                  <>
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
                    {relativeUpdated && (
                      <span>
                        {t.dashboard.updatedRelative} {relativeUpdated}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <SkeletonBlock className="h-3 w-24" />
                    <SkeletonBlock className="h-3 w-36" />
                  </>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/onboarding"
                className="inline-flex w-full items-center justify-center border border-[#bbbbbb] bg-[#ffffff] px-4 py-3 text-sm font-medium text-[#111111] transition-opacity hover:opacity-70 sm:w-auto"
              >
                {t.dashboard.editProfile}
              </Link>
              <div className="flex w-full flex-col gap-1.5 sm:w-auto">
                <button
                  type="button"
                  onClick={() => loadAnalysis({ force: true })}
                  disabled={
                    loading ||
                    (refreshQuota != null && refreshQuota.remaining <= 0)
                  }
                  className="inline-flex w-full items-center justify-center bg-[#4B4B4B] px-5 py-3 text-sm font-medium text-[#ffffff] transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-6"
                >
                  {loading ? t.dashboard.refreshing : t.dashboard.refresh}
                </button>
                {refreshQuota && (
                  <p className="text-center text-xs text-[#111111]/45 sm:text-right">
                    {refreshQuota.remaining > 0
                      ? t.dashboard.refreshQuota
                          .replace("{remaining}", String(refreshQuota.remaining))
                          .replace("{limit}", String(refreshQuota.limit))
                      : t.dashboard.refreshQuotaNone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && !data ? (
            <div className="border border-[#d93636]/20 bg-[#d93636]/5 p-6 text-sm text-[#d93636]">
              {error}
            </div>
          ) : loading && !data ? (
            <>
              <LoadingBanner
                title={t.dashboard.analyzingMarkets}
                subtitle={t.dashboard.loadingEta}
              />
              <DashboardPageSkeleton />
            </>
          ) : (
            <>
              {error && (
                <div className="mb-6 border border-[#d93636]/20 bg-[#d93636]/5 p-4 text-sm text-[#d93636]">
                  {error}
                </div>
              )}
              {loading ? (
                <LoadingBanner
                  title={t.dashboard.analyzingMarkets}
                  subtitle={t.dashboard.loadingEta}
                />
              ) : null}
              {sourceErrorMessage && (
                <SourceErrorBanner message={sourceErrorMessage} />
              )}
              {analysisReused && (
                <div className="mb-6 border border-[#bbbbbb]/60 bg-[#f7f7f7] p-4 text-sm text-[#111111]/70">
                  {t.dashboard.analysisReused}
                </div>
              )}

              {error && (
                <div className="mb-6 border border-[#d93636]/20 bg-[#d93636]/5 p-4 text-sm text-[#d93636]">
                  {error}
                </div>
              )}

              <ExpandableAnalysis
                analysis={analysis}
                loading={analysisLoading}
                unavailableLabel={t.dashboard.analysisUnavailable}
                sectionLabels={t.dashboard.expandableSections}
                learningMode={learningMode}
                experienceLevel={profile?.experience_level ?? null}
                locale={locale}
              />

              <DashboardTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                labels={t.dashboard.tabs}
              />

              {activeTab === "markets" && (
                <AssetGrid>
                  {(marketLoading ? Array.from({ length: 8 }) : tabAssets.markets).map(
                    (item, index) =>
                      marketLoading ? (
                        <div
                          key={`skeleton-market-${index}`}
                          className="flex flex-col gap-3 border border-[#bbbbbb] bg-[#ffffff] p-5"
                        >
                          <SkeletonBlock className="h-4 w-24" />
                          <SkeletonBlock className="h-8 w-28" />
                          <SkeletonBlock className="h-3 w-full" />
                        </div>
                      ) : (
                        <AssetCard
                          key={(item as Stock).symbol}
                          name={(item as Stock).name}
                          symbol={(item as Stock).symbol}
                          price={(item as Stock).price}
                          change={(item as Stock).changePercent}
                          microInsight={getAssetMicroInsight(
                            analysis,
                            (item as Stock).symbol,
                          )}
                          loadingPrice={marketLoading}
                          loadingInsight={analysisLoading}
                          priceUnavailable={finnhubUnavailable}
                          locale={numberLocale}
                          tapHint={t.assetDetail.tapHint}
                          onClick={() =>
                            openAssetDetail(
                              "stock",
                              (item as Stock).symbol,
                              (item as Stock).name,
                            )
                          }
                        />
                      ),
                  )}
                </AssetGrid>
              )}

              {activeTab === "crypto" && (
                <AssetGrid>
                  {(marketLoading ? Array.from({ length: 6 }) : tabAssets.crypto).map(
                    (item, index) =>
                      marketLoading ? (
                        <div
                          key={`skeleton-crypto-${index}`}
                          className="flex flex-col gap-3 border border-[#bbbbbb] bg-[#ffffff] p-5"
                        >
                          <SkeletonBlock className="h-4 w-24" />
                          <SkeletonBlock className="h-8 w-28" />
                          <SkeletonBlock className="h-3 w-full" />
                        </div>
                      ) : (
                        <AssetCard
                          key={(item as Crypto).symbol}
                          name={(item as Crypto).name}
                          symbol={(item as Crypto).symbol}
                          price={(item as Crypto).price}
                          change={(item as Crypto).change24h}
                          microInsight={getAssetMicroInsight(
                            analysis,
                            (item as Crypto).symbol,
                          )}
                          loadingPrice={marketLoading}
                          loadingInsight={analysisLoading}
                          priceUnavailable={coingeckoUnavailable}
                          locale={numberLocale}
                          tapHint={t.assetDetail.tapHint}
                          onClick={() =>
                            openAssetDetail(
                              "crypto",
                              (item as Crypto).symbol,
                              (item as Crypto).name,
                            )
                          }
                        />
                      ),
                  )}
                </AssetGrid>
              )}

              {activeTab === "macro" && (
                <AssetGrid>
                  {(marketLoading ? Array.from({ length: 6 }) : tabAssets.macro).map(
                    (item, index) =>
                      marketLoading ? (
                        <div
                          key={`skeleton-macro-${index}`}
                          className="flex flex-col gap-3 border border-[#bbbbbb] bg-[#ffffff] p-5"
                        >
                          <SkeletonBlock className="h-4 w-28" />
                          <SkeletonBlock className="h-8 w-24" />
                          <SkeletonBlock className="h-3 w-16" />
                        </div>
                      ) : (
                        <MacroCard
                          key={(item as Macro).id}
                          name={(item as Macro).name}
                          value={(item as Macro).value}
                          unit={(item as Macro).unit}
                          date={(item as Macro).date}
                          loading={marketLoading}
                          unavailable={fredUnavailable}
                          locale={numberLocale}
                        />
                      ),
                  )}
                </AssetGrid>
              )}

            </>
          )}

          <LegalFooter />
        </main>
      </div>

      <AssetDetailPanel
        detail={assetDetail}
        loading={detailLoading}
        error={detailError}
        onClose={closeAssetDetail}
      />
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
