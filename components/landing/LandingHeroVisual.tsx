"use client";

import { displayPath } from "@/lib/site";

const WHEEL_GRAY = "#4B4B4B";
const COUNT = 6;
const STEP = 360 / COUNT;

function pillPosition(index: number, radius: number) {
  const deg = index * STEP + 90;
  const rad = (deg * Math.PI) / 180;
  return {
    x: 160 + radius * Math.cos(rad),
    y: 160 + radius * Math.sin(rad),
    deg,
  };
}

export default function LandingHeroVisual() {
  const { locale } = useLanguage();
  const labels =
    locale === "es"
      ? ["Crypto", "Acciones", "Metales", "ETFs", "Fondos", "Macro"]
      : ["Crypto", "Stocks", "Metals", "ETFs", "Funds", "Macro"];

  const focusIndex = 0;

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_50%_50%,rgba(75,75,75,0.08),transparent_70%)]"
      />

      <div className="animate-float-soft relative overflow-hidden rounded-[1.5rem] border border-[#E5E5E5] bg-white shadow-[0_32px_80px_-40px_rgba(17,17,17,0.18)]">
        <div className="flex items-center gap-2 border-b border-[#EFEFEF] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E5E5E5]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E5E5E5]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E5E5E5]" />
          <span className="ml-2 text-[0.65rem] font-medium tracking-wide text-[#999999]">
            {displayPath("dashboard")}
          </span>
        </div>

        <div className="flex min-h-[380px]">
          <div className="w-14 shrink-0 bg-[#4B4B4B]" />

          <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
            <svg
              viewBox="0 0 320 320"
              className="h-[min(58vw,260px)] w-[min(58vw,260px)] max-w-full"
              aria-hidden="true"
            >
              <circle
                cx="160"
                cy="160"
                r="118"
                fill="none"
                stroke={WHEEL_GRAY}
                strokeWidth="1"
                opacity="0.35"
              />
              <circle
                cx="160"
                cy="160"
                r="76"
                fill="none"
                stroke={WHEEL_GRAY}
                strokeWidth="1"
                opacity="0.35"
              />
              <circle
                cx="160"
                cy="160"
                r="97"
                fill="none"
                stroke={WHEEL_GRAY}
                strokeWidth="1"
                opacity="0.2"
              />

              {labels.map((label, index) => {
                const { x, y } = pillPosition(index, 97);
                const focused = index === focusIndex;
                const w = label.length * 6.8 + 28;

                return (
                  <g key={label}>
                    <rect
                      x={x - w / 2}
                      y={y - 14}
                      width={w}
                      height={28}
                      rx="14"
                      fill={focused ? WHEEL_GRAY : "white"}
                      stroke={WHEEL_GRAY}
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill={focused ? "white" : WHEEL_GRAY}
                      fontSize="10"
                      fontFamily="var(--font-body), sans-serif"
                      fontWeight="500"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="mt-2 w-full max-w-[240px] space-y-3 text-left">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[#999999]">
                {locale === "es" ? "¿Qué está pasando?" : "What's going on?"}
              </p>
              <p className="text-[0.82rem] leading-relaxed text-[#333333]">
                {locale === "es"
                  ? "Bitcoin sube con apetito por riesgo — el dólar se debilita y entra flujo a activos digitales."
                  : "Bitcoin rises on risk appetite — a weaker dollar is pushing flows into digital assets."}
              </p>
              <div className="flex gap-2">
                <span className="rounded-full border border-[#E5E5E5] px-2.5 py-1 text-[0.62rem] text-[#666666]">
                  BTC +3.1%
                </span>
                <span className="rounded-full border border-[#E5E5E5] px-2.5 py-1 text-[0.62rem] text-[#666666]">
                  {locale === "es" ? "Macro risk-on" : "Macro risk-on"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
