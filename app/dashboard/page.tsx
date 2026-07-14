"use client";

import AssetCard, { AssetGrid, MacroCard, SkeletonBlock } from "@/components/AssetCard";
import AssetDetailPanel from "@/components/AssetDetailPanel";
import DashboardSidebar from "@/components/DashboardSidebar";
import ExplainableText from "@/components/ExplainableText";
import LanguageToggle from "@/components/LanguageToggle";
import LearningModeToggle from "@/components/LearningModeToggle";
import {
  dismissOnboardingBanner,
  shouldShowOnboardingBanner,
} from "@/lib/onboardingBanner";
import { formatRelativeUpdated } from "@/lib/formatRelativeTime";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { AssetDetail } from "@/lib/marketTypes";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

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

type StructuredAnalysis = {
  headline: string;
  asset_insights: {
    symbol: string;
    name: string;
    micro_insight: string;
  }[];
  analysis: {
    paragraph_1: string;
    paragraph_2: string;
    paragraph_3: string;
  };
  terms: {
    word: string;
    beginner: string;
    intermediate: string;
    advanced: string;
  }[];
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
};

type UserProfile = {
  experience_level: string | null;
  last_onboarding_date: string | null;
};

function getMicroInsight(
  analysis: StructuredAnalysis | null,
  symbol: string,
): string | null {
  if (!analysis) return null;
  const match = analysis.asset_insights.find(
    (item) => item.symbol.toUpperCase() === symbol.toUpperCase(),
  );
  return match?.micro_insight ?? null;
}

function HeadlineSection({
  headline,
  loading,
}: {
  headline: string | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="mb-10 space-y-3">
        <SkeletonBlock className="h-8 w-full max-w-xl" />
        <SkeletonBlock className="h-8 w-full max-w-lg" />
      </div>
    );
  }

  if (!headline) return null;

  return (
    <h2 className="mb-8 text-xl font-medium leading-tight tracking-tight text-[#111111] sm:mb-10 sm:text-2xl md:text-[2rem]">
      {headline}
    </h2>
  );
}

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
    <div className="-mx-4 mb-8 flex gap-4 overflow-x-auto border-b border-[#bbbbbb] px-4 scrollbar-none sm:mx-0 sm:gap-6 sm:px-0">
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

function DeepAnalysisSection({
  analysis,
  loading,
  title,
  unavailableLabel,
  learningMode,
  experienceLevel,
}: {
  analysis: StructuredAnalysis | null;
  loading: boolean;
  title: string;
  unavailableLabel: string;
  learningMode: boolean;
  experienceLevel: string | null;
}) {
  const markdown = analysis
    ? [
        analysis.analysis.paragraph_1,
        analysis.analysis.paragraph_2,
        analysis.analysis.paragraph_3,
      ].join("\n\n")
    : "";

  return (
    <section className="mt-10 max-w-2xl border-t border-[#bbbbbb] pt-8 sm:mt-14 sm:pt-10">
      <h3 className="text-lg font-medium tracking-tight">{title}</h3>

      {loading ? (
        <div className="mt-6 space-y-6">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-11/12" />
          <SkeletonBlock className="mt-4 h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-10/12" />
          <SkeletonBlock className="mt-4 h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-9/12" />
        </div>
      ) : analysis ? (
        <div className="mt-6">
          <ExplainableText
            text={markdown}
            terms={analysis.terms}
            experienceLevel={experienceLevel}
            enabled={learningMode}
          />
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#111111]/45">{unavailableLabel}</p>
      )}
    </section>
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
        <SkeletonBlock className="h-8 w-full max-w-xl" />
        <SkeletonBlock className="h-8 w-full max-w-lg" />
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

      <div className="mt-14 border-t border-[#bbbbbb] pt-10">
        <SkeletonBlock className="h-5 w-40" />
        <div className="mt-6 space-y-4">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-11/12" />
        </div>
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
        const body = (await res.json().catch(() => null)) as {
          error?: string;
          redirect?: string;
        } | null;

        if (res.status === 403 && body?.redirect) {
          router.replace(body.redirect);
          return;
        }

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
  const analysisLoading = loading;
  const marketLoading = loading && !data;
  const sourceErrors = data?.sourceErrors ?? [];

  const openAssetDetail = useCallback(
    async (type: "stock" | "crypto", symbol: string, name: string) => {
      setDetailLoading(true);
      setDetailError(null);
      setAssetDetail(null);

      const microInsight = getMicroInsight(analysis, symbol);

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
        setAssetDetail({
          ...json,
          microInsight: json.microInsight ?? microInsight,
        });
      } catch (err) {
        setDetailError(
          err instanceof Error ? err.message : t.assetDetail.unavailable,
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [analysis, locale, router, t.assetDetail.unavailable],
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
      <DashboardSidebar compact onSignOut={handleSignOut} email={email} />
      <DashboardSidebar onSignOut={handleSignOut} email={email} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-6 sm:px-10 sm:py-6">
          <LearningModeToggle
            enabled={learningMode}
            onChange={handleLearningModeChange}
            label={t.dashboard.learningMode}
          />
          <LanguageToggle />
        </div>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-[calc(6rem+var(--safe-bottom))] sm:px-6 md:px-10">
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
              <button
                type="button"
                onClick={loadAnalysis}
                disabled={loading}
                className="inline-flex w-full items-center justify-center bg-[#4B4B4B] px-5 py-3 text-sm font-medium text-[#ffffff] transition-opacity hover:opacity-85 disabled:opacity-40 sm:w-auto sm:px-6"
              >
                {loading ? t.dashboard.refreshing : t.dashboard.refresh}
              </button>
            </div>
          </div>

          {error && !data ? (
            <div className="border border-[#d93636]/20 bg-[#d93636]/5 p-6 text-sm text-[#d93636]">
              {error}
            </div>
          ) : marketLoading ? (
            <DashboardPageSkeleton />
          ) : (
            <>
              {sourceErrorMessage && (
                <SourceErrorBanner message={sourceErrorMessage} />
              )}

              {error && (
                <div className="mb-6 border border-[#d93636]/20 bg-[#d93636]/5 p-4 text-sm text-[#d93636]">
                  {error}
                </div>
              )}
              <HeadlineSection
                headline={analysis?.headline ?? null}
                loading={analysisLoading}
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
                          microInsight={getMicroInsight(
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
                          microInsight={getMicroInsight(
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

              <DeepAnalysisSection
                analysis={analysis}
                loading={analysisLoading}
                title={t.dashboard.analysisTitle}
                unavailableLabel={t.dashboard.analysisUnavailable}
                learningMode={learningMode}
                experienceLevel={profile?.experience_level ?? null}
              />
            </>
          )}
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
