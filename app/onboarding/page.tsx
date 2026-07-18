"use client";

import NextWallLogo from "@/components/NextWallLogo";
import LegalFooter from "@/components/LegalFooter";
import { clearOnboardingBannerDismiss } from "@/lib/onboardingBanner";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type CategoryKey = "crypto" | "stocks" | "etfs" | "metals";
type SelectedAssets = Record<CategoryKey, string[]>;
type CustomAssets = Record<CategoryKey, string>;

const EXPERIENCE_LEVELS: {
  key: ExperienceLevel;
  title: string;
  description: string;
}[] = [
  {
    key: "beginner",
    title: "Principiante",
    description: "Entiendo poco, prefiero explicaciones simples",
  },
  {
    key: "intermediate",
    title: "Intermedio",
    description: "Conozco conceptos básicos como inflación o tipos de interés",
  },
  {
    key: "advanced",
    title: "Avanzado",
    description: "Entiendo análisis macroeconómico y términos financieros",
  },
];

const CATEGORIES: {
  key: CategoryKey;
  label: string;
  items: string[];
}[] = [
  {
    key: "crypto",
    label: "Crypto",
    items: ["Bitcoin", "Ethereum", "Solana", "BNB", "XRP"],
  },
  {
    key: "stocks",
    label: "Acciones",
    items: ["Apple", "Nvidia", "Tesla", "Amazon", "Microsoft", "Google"],
  },
  {
    key: "etfs",
    label: "ETFs y Fondos",
    items: ["S&P 500 (SPY)", "Nasdaq (QQQ)", "MSCI World", "S&P Europe 350"],
  },
  {
    key: "metals",
    label: "Metales",
    items: ["Oro", "Plata", "Platino"],
  },
];

const STEP_LABELS = ["Nivel", "Activos", "Contexto"];

const EMPTY_ASSETS: SelectedAssets = {
  crypto: [],
  stocks: [],
  etfs: [],
  metals: [],
};

const EMPTY_CUSTOM: CustomAssets = {
  crypto: "",
  stocks: "",
  etfs: "",
  metals: "",
};

type StoredProfile = {
  experience_level?: string | null;
  selected_assets?: Partial<SelectedAssets> | null;
  custom_assets?: string | Record<string, string> | null;
  free_text?: string | null;
};

function parseCustomAssets(
  value: StoredProfile["custom_assets"],
): CustomAssets {
  if (!value) return { ...EMPTY_CUSTOM };

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as Partial<CustomAssets>;
      return { ...EMPTY_CUSTOM, ...parsed };
    } catch {
      return { ...EMPTY_CUSTOM };
    }
  }

  return { ...EMPTY_CUSTOM, ...value };
}

function deriveActiveCategories(
  assets: SelectedAssets,
  custom: CustomAssets,
): Set<CategoryKey> {
  const active = new Set<CategoryKey>();
  for (const key of Object.keys(EMPTY_ASSETS) as CategoryKey[]) {
    if (assets[key].length > 0 || custom[key].trim().length > 0) {
      active.add(key);
    }
  }
  return active;
}

function hydrateProfile(
  profile: StoredProfile,
  setExperienceLevel: (level: ExperienceLevel) => void,
  setSelectedAssets: (assets: SelectedAssets) => void,
  setCustomAssets: (custom: CustomAssets) => void,
  setFreeText: (text: string) => void,
  setActiveCategories: (categories: Set<CategoryKey>) => void,
) {
  if (
    profile.experience_level === "beginner" ||
    profile.experience_level === "intermediate" ||
    profile.experience_level === "advanced"
  ) {
    setExperienceLevel(profile.experience_level);
  }

  const assets: SelectedAssets = {
    crypto: profile.selected_assets?.crypto ?? [],
    stocks: profile.selected_assets?.stocks ?? [],
    etfs: profile.selected_assets?.etfs ?? [],
    metals: profile.selected_assets?.metals ?? [],
  };
  const custom = parseCustomAssets(profile.custom_assets);

  setSelectedAssets(assets);
  setCustomAssets(custom);
  setFreeText(profile.free_text ?? "");
  setActiveCategories(deriveActiveCategories(assets, custom));
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<CategoryKey>>(
    new Set(),
  );
  const [selectedAssets, setSelectedAssets] =
    useState<SelectedAssets>(EMPTY_ASSETS);
  const [customAssets, setCustomAssets] =
    useState<CustomAssets>(EMPTY_CUSTOM);
  const [freeText, setFreeText] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function check() {
      console.log("[onboarding] Checking session and existing profile…");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.log("[onboarding] No session → /login");
        router.replace("/login");
        return;
      }

      console.log("[onboarding] Session OK, user:", session.user.id);

      try {
        const res = await fetch("/api/user-profile", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = (await res.json()) as {
          hasProfile?: boolean;
          profile?: StoredProfile | null;
          error?: string;
          hint?: string;
        };

        console.log("[onboarding] Profile check response:", json);

        if (json.hasProfile && json.profile) {
          setIsUpdating(true);
          hydrateProfile(
            json.profile,
            setExperienceLevel,
            setSelectedAssets,
            setCustomAssets,
            setFreeText,
            setActiveCategories,
          );
        }

        if (json.error) {
          console.warn("[onboarding] Profile check error:", json.error, json.hint);
        }
      } catch (err) {
        console.error("[onboarding] Profile check fetch failed:", err);
      }

      setUserId(session.user.id);
      setChecking(false);
    }
    check();
  }, [router]);

  function toggleCategory(key: CategoryKey) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function updateCustomAsset(category: CategoryKey, value: string) {
    setCustomAssets((prev) => ({
      ...prev,
      [category]: value,
    }));
  }

  function toggleAsset(category: CategoryKey, asset: string) {
    setSelectedAssets((prev) => {
      const current = prev[category];
      return {
        ...prev,
        [category]: current.includes(asset)
          ? current.filter((a) => a !== asset)
          : [...current, asset],
      };
    });
  }

  async function handleSubmit() {
    if (!userId) {
      console.error("[onboarding] Submit blocked — no userId");
      return;
    }

    setSaving(true);
    setSaveError(null);

    console.log("[onboarding] Submitting profile for user:", userId);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error("[onboarding] Submit blocked — session lost");
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch("/api/user-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          experience_level: experienceLevel,
          selected_assets: selectedAssets,
          custom_assets: customAssets,
          free_text: freeText || null,
        }),
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        hint?: string;
        profileId?: string;
      };

      console.log("[onboarding] Save response:", { status: res.status, ...json });

      if (!res.ok || !json.success) {
        const message = json.hint
          ? `${json.error ?? "No se pudo guardar el perfil"}. ${json.hint}`
          : (json.error ?? "No se pudo guardar el perfil");
        setSaveError(message);
        console.error("[onboarding] Save failed:", message);
        return;
      }

      console.log("[onboarding] Profile saved, id:", json.profileId, "→ /dashboard");
      clearOnboardingBannerDismiss(userId);
      router.replace("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error inesperado al guardar";
      setSaveError(message);
      console.error("[onboarding] Save exception:", err);
    } finally {
      setSaving(false);
    }
  }

  const canGoNext = step === 1 ? experienceLevel !== null : true;

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#111111]/40">
        Cargando…
      </div>
    );
  }

  // All asset subsections are always visible on step 2
  return (
    <div className="flex min-h-screen flex-col bg-[#ffffff] text-[#111111]">
      {/* Header */}
      <header className="flex items-center justify-between px-[var(--page-gutter)] py-4 sm:py-6">
        <NextWallLogo className="h-5 w-auto opacity-45 sm:h-6" priority />
        <span className="text-xs font-medium text-[#111111]/45 md:hidden">
          Paso {step}/3
        </span>
        <div className="hidden items-center gap-4 md:flex">
          {STEP_LABELS.map((label, i) => (
            <span
              key={label}
              className={`text-xs font-medium transition-colors ${
                i + 1 === step
                  ? "text-[#111111]"
                  : i + 1 < step
                    ? "text-[#111111]/35 line-through"
                    : "text-[#111111]/20"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-px bg-[#111111]/10">
        <div
          className="h-px bg-[#111111] transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Step content */}
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-[var(--page-gutter)] pb-[calc(4rem+var(--safe-bottom))] pt-10 sm:pt-14 md:pt-20">
        <div key={step} className="onboarding-step flex flex-1 flex-col">

          {/* ── STEP 1: Experience level ── */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-[2.5rem]">
                ¿Cuánto sabes de economía e inversiones?
              </h1>
              <p className="mt-3 text-base text-[#111111]/50">
                Adaptamos el lenguaje a tu nivel
              </p>
              <div className="mt-10 flex flex-col gap-3">
                {EXPERIENCE_LEVELS.map((level) => {
                  const active = experienceLevel === level.key;
                  return (
                    <button
                      key={level.key}
                      type="button"
                      onClick={() => setExperienceLevel(level.key)}
                      className={`flex flex-col items-start gap-1.5 border p-5 text-left transition-all duration-150 ${
                        active
                          ? "border-[#111111] bg-[#111111] text-[#ffffff]"
                          : "border-[#bbbbbb] bg-[#ffffff] text-[#111111] hover:border-[#111111]/60"
                      }`}
                    >
                      <span className="text-base font-semibold">
                        {level.title}
                      </span>
                      <span
                        className={`text-sm leading-snug ${
                          active ? "text-[#ffffff]/65" : "text-[#111111]/50"
                        }`}
                      >
                        {level.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── STEP 2: Assets ── */}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-[2.5rem]">
                ¿En qué inviertes?
              </h1>
              <p className="mt-3 text-base text-[#111111]/50">
                Solo verás datos de lo que te interesa
              </p>

              <div className="mt-10 space-y-4">
                {/* Category toggles — highlight interest, do not hide subsections */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {CATEGORIES.map((cat) => {
                    const active = activeCategories.has(cat.key);
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => toggleCategory(cat.key)}
                        className={`border py-3.5 text-center text-sm font-semibold transition-all duration-150 ${
                          active
                            ? "border-[#111111] bg-[#111111] text-[#ffffff]"
                            : "border-[#bbbbbb] bg-[#ffffff] text-[#111111] hover:border-[#111111]/60"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* All subsections always visible with persistent custom inputs */}
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.key}
                    className="border border-[#111111]/12 bg-[#fafafa] p-5"
                  >
                    <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-widest text-[#111111]/35">
                      {cat.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((item) => {
                        const selected =
                          selectedAssets[cat.key].includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleAsset(cat.key, item)}
                            className={`border px-3.5 py-1.5 text-sm transition-all duration-150 ${
                              selected
                                ? "border-[#111111] bg-[#111111] text-[#ffffff]"
                                : "border-[#bbbbbb] bg-[#ffffff] text-[#111111] hover:border-[#111111]/60"
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                    <label className="mt-5 block">
                      <span className="sr-only">
                        Activos personalizados — {cat.label}
                      </span>
                      <input
                        type="text"
                        value={customAssets[cat.key]}
                        onChange={(e) =>
                          updateCustomAsset(cat.key, e.target.value)
                        }
                        placeholder="¿Tienes algo más? Escríbelo aquí"
                        className="w-full border border-[#bbbbbb] bg-[#ffffff] px-3.5 py-2.5 text-sm text-[#111111] placeholder:text-[#111111]/35 focus:border-[#111111] focus:outline-none"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── STEP 3: Free text ── */}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-[2.5rem]">
                ¿Qué quieres entender mejor?
              </h1>
              <p className="mt-3 text-base text-[#111111]/50">
                Opcional — nos ayuda a personalizar tu experiencia
              </p>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={`Ej: Tengo miedo de que suba la inflación y no sé cómo me afecta.\nQuiero entender por qué el Nasdaq baja cuando la Fed sube tipos...`}
                rows={7}
                className="mt-10 w-full resize-none border border-[#bbbbbb] bg-[#ffffff] p-5 text-sm leading-relaxed text-[#111111] placeholder:text-[#111111]/30 focus:border-[#111111] focus:outline-none"
              />
            </>
          )}

          {/* Navigation */}
          {saveError && (
            <p className="mt-8 border border-[#d93636]/20 bg-[#d93636]/5 p-4 text-sm text-[#d93636]">
              {saveError}
            </p>
          )}

          <div className="mt-auto flex flex-col-reverse gap-4 pt-10 sm:flex-row sm:items-center sm:justify-between sm:pt-14">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="text-center text-sm text-[#111111]/40 transition-opacity hover:opacity-70 sm:text-left"
              >
                ← Atrás
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canGoNext}
                className="w-full bg-[#111111] px-8 py-3.5 text-sm font-medium text-[#ffffff] transition-opacity hover:opacity-85 disabled:opacity-30 sm:w-auto sm:py-3"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="w-full bg-[#111111] px-6 py-3.5 text-sm font-medium text-[#ffffff] transition-opacity hover:opacity-85 disabled:opacity-40 sm:w-auto sm:px-8 sm:py-3"
              >
                {saving
                  ? "Guardando…"
                  : isUpdating
                    ? "Guardar cambios →"
                    : "Empezar a invertir con contexto →"}
              </button>
            )}
          </div>
        </div>

        <LegalFooter />
      </main>
    </div>
  );
}
