"use client";

import Header from "@/components/Header";
import PaymentMethodIcons from "@/components/PaymentMethodIcons";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled") === "true";
  const { t } = useLanguage();

  const [email, setEmail] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setEmail(session.user.email ?? null);
      setCheckingSession(false);
    }

    checkSession();
  }, [router]);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? t.payment.errors.checkoutFailed);
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error(t.payment.errors.noUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.payment.errors.generic,
      );
      setLoading(false);
    }
  }

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

  return (
    <div className="flex min-h-screen flex-col text-[#111111]">
      <Header showLoginButton={false} />

      <main className="flex flex-1 flex-col items-center justify-center px-[var(--page-gutter)] pb-[calc(6rem+var(--safe-bottom))] sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#111111]/45">
              {t.payment.label}
            </p>
            <h1 className="mt-4 text-2xl font-medium sm:text-3xl">
              {t.payment.title}
            </h1>
            <p className="mt-4 inline-block border border-[#111111]/15 bg-[#fafafa] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[#111111]/65">
              {t.payment.trialBadge}
            </p>
            <p className="mt-6 text-4xl font-medium tracking-tight">
              {t.payment.price}
            </p>
            <p className="mt-1 text-sm text-[#111111]/45">{t.payment.perMonth}</p>
            <p className="mt-4 text-sm leading-relaxed text-[#111111]/55">
              {t.payment.trialNote}
            </p>
          </div>

          <ul className="mb-10 space-y-4 text-sm leading-relaxed text-[#111111]/55">
            {t.payment.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          {cancelled && (
            <p className="mb-6 text-sm text-[#111111]/55">{t.payment.cancelled}</p>
          )}

          {error && <p className="mb-6 text-sm text-red-700">{error}</p>}

          {email && (
            <p className="mb-8 text-center text-xs text-[#111111]/40">
              {t.payment.session}: {email}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-[#313131] px-4 py-3.5 text-sm font-medium text-[#ffffff] transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {loading ? t.payment.redirecting : t.payment.subscribe}
          </button>

          <p className="mt-4 text-center text-xs leading-relaxed text-[#111111]/40">
            {t.payment.promoHint}
          </p>

          <PaymentMethodIcons />

          <div className="mt-12 flex flex-col items-center gap-4 text-sm text-[#111111]/45">
            <button
              type="button"
              onClick={handleSignOut}
              className="transition-opacity hover:opacity-70"
            >
              {t.payment.signOut}
            </button>
            <Link href="/" className="hover:opacity-70">
              {t.payment.backHome}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-[#111111]/40">
          Loading…
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
