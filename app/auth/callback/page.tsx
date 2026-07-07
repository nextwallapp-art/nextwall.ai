"use client";

import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completando inicio de sesión…");

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      const next = searchParams.get("next") ?? "/payment";
      const oauthError =
        searchParams.get("error_description") ?? searchParams.get("error");

      if (oauthError) {
        router.replace(`/login?error=oauth`);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setMessage("No se pudo completar el inicio de sesión.");
          router.replace("/login?error=oauth");
          return;
        }

        router.replace(next.startsWith("/") ? next : "/payment");
        return;
      }

      // Fallback: implicit flow returns tokens in the URL hash.
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          router.replace("/login?error=oauth");
          return;
        }

        router.replace(next.startsWith("/") ? next : "/payment");
        return;
      }

      router.replace("/login?error=oauth");
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center text-[#111111]/40">
      {message}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-[#111111]/40">
          Cargando…
        </div>
      }
    >
      <OAuthCallback />
    </Suspense>
  );
}
