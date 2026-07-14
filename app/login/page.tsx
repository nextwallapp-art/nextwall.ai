"use client";

import Header from "@/components/Header";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";

function LoginContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function translateAuthError(message: string) {
    if (message === "Email not confirmed") return t.login.errors.emailNotConfirmed;
    if (message === "Invalid login credentials")
      return t.login.errors.invalidCredentials;
    if (message === "User already registered")
      return t.login.errors.alreadyRegistered;
    return message;
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(translateAuthError(signInError.message));
      setLoading(false);
      return;
    }

    router.push("/payment");
  }

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(translateAuthError(signUpError.message));
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/payment");
      return;
    }

    setMessage(t.login.accountCreated);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col text-[#111111]">
      <Header showLoginButton={false} />

      <main className="flex flex-1 flex-col items-center justify-center px-[var(--page-gutter)] pb-[calc(6rem+var(--safe-bottom))] sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center">
            <h1 className="text-2xl font-medium sm:text-3xl">{t.login.title}</h1>
            <p className="mt-3 text-sm text-[#111111]/50 sm:text-base">
              {t.login.subtitle}
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs uppercase tracking-widest text-[#111111]/45"
              >
                {t.login.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.login.emailPlaceholder}
                required
                autoComplete="email"
                className="w-full bg-transparent px-0 py-3 text-[#111111] placeholder:text-[#111111]/30 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs uppercase tracking-widest text-[#111111]/45"
              >
                {t.login.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="current-password"
                className="w-full bg-transparent px-0 py-3 text-[#111111] placeholder:text-[#111111]/30 outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-700">{error}</p>}
            {message && <p className="text-sm text-[#111111]/70">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-[#313131] px-4 py-3.5 text-sm font-medium text-[#ffffff] transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {loading ? t.login.signingIn : t.login.signIn}
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full px-4 py-3.5 text-sm font-medium text-[#111111]/60 transition-opacity hover:opacity-70 disabled:opacity-50"
            >
              {loading ? t.login.creatingAccount : t.login.signUp}
            </button>
          </form>

          <p className="mt-12 text-center text-sm text-[#111111]/45">
            <Link href="/" className="hover:opacity-70">
              {t.login.backHome}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function LoginFallback() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen items-center justify-center text-[#111111]/40">
      {t.dashboard.loading}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
