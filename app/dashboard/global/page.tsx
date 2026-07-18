"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import GeoGlobe from "@/components/GeoGlobe";
import LanguageToggle from "@/components/LanguageToggle";
import LearningModeToggle from "@/components/LearningModeToggle";
import LegalFooter from "@/components/LegalFooter";
import type { GeoHotspot } from "@/lib/geoHotspots";
import {
  getClientMarketCache,
  setClientMarketCache,
  type CachedMarketResponse,
} from "@/lib/clientMarketCache";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { StructuredAnalysis } from "@/lib/marketAnalysis";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const LEARNING_MODE_KEY = "nextwall-learning-mode";

type GlobalPayload = {
  analysis: StructuredAnalysis | null;
  geoHotspots: GeoHotspot[];
  lastUpdated: string;
};

export default function GlobalDashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GlobalPayload | null>(null);
  const [learningMode, setLearningMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const loadInFlightRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(LEARNING_MODE_KEY);
    if (stored === "true") setLearningMode(true);
  }, []);

  function handleLearningModeChange(enabled: boolean) {
    setLearningMode(enabled);
    localStorage.setItem(LEARNING_MODE_KEY, String(enabled));
  }

  const loadGlobal = useCallback(async () => {
    if (loadInFlightRef.current) return;

    loadInFlightRef.current = true;
    setLoading(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      loadInFlightRef.current = false;
      router.replace("/login");
      return;
    }

    const activeUserId = userId ?? session.user.id;
    const cached = getClientMarketCache(activeUserId);

    if (cached?.geoHotspots?.length) {
      setData({
        analysis: cached.analysis,
        geoHotspots: cached.geoHotspots,
        lastUpdated: cached.lastUpdated,
      });
      setLoading(false);
      loadInFlightRef.current = false;
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

        if (res.status === 429) {
          const retryAfter = res.headers.get("Retry-After") ?? "60";
          if (cached?.geoHotspots) {
            setError(
              t.dashboard.rateLimited.replace("{seconds}", retryAfter),
            );
            return;
          }
          throw new Error(
            t.dashboard.rateLimited.replace("{seconds}", retryAfter),
          );
        }

        throw new Error(body?.error ?? t.dashboard.errors.loadFailed);
      }

      const json = (await res.json()) as GlobalPayload & CachedMarketResponse;
      setData({
        analysis: json.analysis,
        geoHotspots: json.geoHotspots ?? [],
        lastUpdated: json.lastUpdated,
      });
      if (json.stocks && json.crypto) {
        setClientMarketCache(activeUserId, json);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.dashboard.errors.unexpected);
    } finally {
      loadInFlightRef.current = false;
      setLoading(false);
    }
  }, [
    router,
    userId,
    t.dashboard.errors.loadFailed,
    t.dashboard.errors.unexpected,
    t.dashboard.rateLimited,
  ]);

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
        const json = (await res.json()) as { hasProfile?: boolean };

        if (!json.hasProfile) {
          router.replace("/onboarding");
          return;
        }

        setEmail(session.user.email ?? null);
        setUserId(session.user.id);
        setCheckingSession(false);
        loadGlobal();
      } catch {
        router.replace("/onboarding");
      }
    }

    init();
  }, [router, loadGlobal]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#111111]/40">
        {t.dashboard.loading}
      </div>
    );
  }

  const hotspots = data?.geoHotspots ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-[#ffffff] md:flex-row">
      <DashboardSidebar compact onSignOut={handleSignOut} email={email} active="global" />
      <DashboardSidebar onSignOut={handleSignOut} email={email} active="global" />

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
          <div className="mb-8">
            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
              {t.dashboard.globalTitle}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#111111]/55">
              {t.dashboard.globalSubtitle}
            </p>
          </div>

          {error ? (
            <div className="mb-6 border border-[#d93636]/20 bg-[#d93636]/5 p-4 text-sm text-[#d93636]">
              {error}
            </div>
          ) : null}

          {loading && !data ? (
            <div className="mb-8 border border-[#bbbbbb] bg-[#fafafa] px-5 py-4">
              <p className="text-sm font-medium text-[#111111]">
                {t.dashboard.analyzingMarkets}
              </p>
              <p className="mt-1 text-sm text-[#111111]/55">
                {t.dashboard.loadingEta}
              </p>
            </div>
          ) : null}

          <GeoGlobe
            hotspots={hotspots}
            loading={loading && hotspots.length === 0}
            hintLabel={t.dashboard.globalHint}
            selectedLabel={t.dashboard.globalSelected}
          />

          {!loading && hotspots.length === 0 && !error ? (
            <p className="mt-6 text-sm text-[#111111]/45">
              {t.dashboard.globalEmpty}
            </p>
          ) : null}

          <LegalFooter />
        </main>
      </div>
    </div>
  );
}
