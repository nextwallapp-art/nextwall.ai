"use client";

import { gsap } from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type WheelSection =
  | "etfs"
  | "indexFunds"
  | "stocks"
  | "crypto"
  | "metals"
  | "macro";

const SIZE = 720;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUT = 228;
const R_IN = 138;
const R_MID = 182;
const COUNT = 6;
const STEP = 360 / COUNT;
const FOCUS = 90;
const PILL_R = R_MID;
const WHEEL_GRAY = "#4B4B4B";

type SectionItem = {
  id: WheelSection;
  label: string;
};

function buildItems(locale: "en" | "es"): SectionItem[] {
  const t = (es: string, en: string) => (locale === "es" ? es : en);
  return [
    { id: "crypto", label: "Crypto" },
    { id: "stocks", label: t("Acciones", "Stocks") },
    { id: "metals", label: t("Metales", "Metals") },
    { id: "etfs", label: "ETFs" },
    { id: "indexFunds", label: t("Fondos indexados", "Index funds") },
    { id: "macro", label: "Macro" },
  ];
}

function pointOnCircle(deg: number, radius: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

function normalizeDeg(deg: number) {
  return ((deg % 360) + 360) % 360;
}

function angularDistance(a: number, b: number) {
  const diff = Math.abs(normalizeDeg(a) - normalizeDeg(b));
  return Math.min(diff, 360 - diff);
}

function rotationForIndex(index: number, current = 0) {
  const base = -index * STEP;
  return [base, base + 360, base - 360].reduce((best, candidate) =>
    Math.abs(candidate - current) < Math.abs(best - current) ? candidate : best,
  );
}

function focusBlend(dist: number) {
  const x = Math.max(0, Math.min(1, 1 - dist / (STEP * 0.9)));
  return x * x * (3 - 2 * x);
}

function Sparkle({
  x,
  y,
  intensity,
}: {
  x: number;
  y: number;
  intensity: number;
}) {
  const s = 0.88 + intensity * 0.32;
  const alpha = 0.4 + intensity * 0.58;
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#wheel-glow)" opacity={alpha}>
      <circle r={8 * s} fill="url(#wheel-shine)" />
      <line
        x1={-10 * s}
        y1={0}
        x2={10 * s}
        y2={0}
        stroke="#fff"
        strokeWidth={0.75}
        opacity={0.75}
      />
      <line
        x1={0}
        y1={-10 * s}
        x2={0}
        y2={10 * s}
        stroke="#fff"
        strokeWidth={0.75}
        opacity={0.75}
      />
      <line
        x1={-6 * s}
        y1={-6 * s}
        x2={6 * s}
        y2={6 * s}
        stroke="#fff"
        strokeWidth={0.5}
        opacity={0.38}
      />
      <line
        x1={6 * s}
        y1={-6 * s}
        x2={-6 * s}
        y2={6 * s}
        stroke="#fff"
        strokeWidth={0.5}
        opacity={0.38}
      />
      <circle r={1.8 * s} fill="#ffffff" />
    </g>
  );
}

type RotatingWheelSelectorProps = {
  locale: "en" | "es";
  selected: WheelSection | null;
  onSelect: (section: WheelSection) => void;
};

export default function RotatingWheelSelector({
  locale,
  selected,
  onSelect,
}: RotatingWheelSelectorProps) {
  const items = useMemo(() => buildItems(locale), [locale]);
  const rotatorRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rotationRef = useRef(0);
  const focusIndexRef = useRef(0);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const [focusIndex, setFocusIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);

  const setVisuals = useCallback((rotation: number) => {
    pillRefs.current.forEach((pill, index) => {
      if (!pill) return;
      const itemAngle = FOCUS + index * STEP + rotation;
      const dist = angularDistance(itemAngle, FOCUS);
      const t = focusBlend(dist);
      gsap.set(pill, {
        rotate: -rotation,
        scale: 0.88 + t * 0.2,
        opacity: 0.34 + t * 0.66,
      });
    });
  }, []);

  const moveInstant = useCallback(
    (rotation: number) => {
      rotationRef.current = rotation;
      if (rotatorRef.current) {
        gsap.set(rotatorRef.current, { rotate: rotation, force3D: true });
      }
      setVisuals(rotation);
    },
    [setVisuals],
  );

  const animateToIndex = useCallback(
    (index: number, notify = true) => {
      const normalized = ((index % COUNT) + COUNT) % COUNT;
      const target = rotationForIndex(normalized, rotationRef.current);

      tweenRef.current?.kill();
      setFocusIndex(normalized);
      focusIndexRef.current = normalized;

      if (!rotatorRef.current) {
        moveInstant(target);
        if (notify) onSelect(items[normalized].id);
        return;
      }

      const distance = Math.abs(target - rotationRef.current);
      const duration = 0.95 + Math.min(0.45, distance / STEP) * 0.22;

      tweenRef.current = gsap.to(rotatorRef.current, {
        rotate: target,
        duration,
        ease: "power3.out",
        overwrite: true,
        force3D: true,
        onUpdate: () => {
          const deg = gsap.getProperty(rotatorRef.current!, "rotate") as number;
          rotationRef.current = deg;
          setVisuals(deg);
        },
        onComplete: () => {
          rotationRef.current = target;
          setVisuals(target);
          if (notify) onSelect(items[normalized].id);
        },
      });
    },
    [items, moveInstant, onSelect, setVisuals],
  );

  useEffect(() => {
    function updateScale() {
      setScale(Math.min(1, (window.innerWidth * 0.94) / SIZE));
    }

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    focusIndexRef.current = focusIndex;
  }, [focusIndex]);

  useEffect(() => {
    moveInstant(rotationRef.current);
    return () => {
      tweenRef.current?.kill();
    };
  }, [moveInstant]);

  useEffect(() => {
    if (selected === null) return;
    const idx = items.findIndex((item) => item.id === selected);
    if (idx < 0 || idx === focusIndexRef.current) return;
    animateToIndex(idx, false);
  }, [animateToIndex, items, selected]);

  function pillClass(index: number) {
    const atFocus = focusIndex === index;
    const hovered = hoverIndex === index;
    return [
      "rounded-[8px] border px-3 py-1.5 text-[12px] tracking-[0.01em]",
      "font-[family-name:var(--font-heading)] text-[#4B4B4B] whitespace-nowrap",
      "shadow-[0_3px_16px_rgba(17,17,17,0.07)]",
      "transition-[border-color,box-shadow] duration-300 ease-out",
      atFocus
        ? "border-[#4B4B4B]/32 bg-[#ffffff] shadow-[0_8px_28px_rgba(17,17,17,0.14)]"
        : hovered
          ? "border-[#4B4B4B]/20 bg-[#ffffff] shadow-[0_6px_22px_rgba(17,17,17,0.1)]"
          : "border-[#4B4B4B]/10 bg-[#ffffff]/95",
    ].join(" ");
  }

  const highlighted = new Set([
    focusIndex,
    (focusIndex + 1) % COUNT,
    (focusIndex + COUNT - 1) % COUNT,
  ]);

  return (
    <div className="flex w-full flex-col items-center py-6 sm:py-10">
      <div className="relative" style={{ width: SIZE * scale, height: SIZE * scale }}>
        <div
          className="relative select-none"
          style={{
            width: SIZE,
            height: SIZE,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            ref={rotatorRef}
            className="absolute inset-0 will-change-transform"
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          >
            <svg
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="absolute inset-0"
              aria-hidden
            >
              <defs>
                <filter id="wheel-glow" x="-180%" y="-180%" width="460%" height="460%">
                  <feGaussianBlur stdDeviation="3.4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="wheel-shine" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="45%" stopColor="#f7f7f7" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#dcdcdc" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle
                cx={CX}
                cy={CY}
                r={R_OUT + 6}
                fill="none"
                stroke={WHEEL_GRAY}
                strokeWidth={0.5}
                opacity={0.12}
              />
              <circle
                cx={CX}
                cy={CY}
                r={R_OUT}
                fill="none"
                stroke={WHEEL_GRAY}
                strokeWidth={1}
                opacity={0.44}
              />
              <circle
                cx={CX}
                cy={CY}
                r={R_MID}
                fill="none"
                stroke={WHEEL_GRAY}
                strokeWidth={0.5}
                opacity={0.16}
                strokeDasharray="2 6"
              />
              <circle
                cx={CX}
                cy={CY}
                r={R_IN}
                fill="none"
                stroke={WHEEL_GRAY}
                strokeWidth={1}
                opacity={0.3}
              />

              {Array.from({ length: COUNT }).map((_, i) => {
                const deg = FOCUS + i * STEP;
                const inner = pointOnCircle(deg, R_IN);
                const isLit = highlighted.has(i);
                return (
                  <g key={`spoke-${i}`}>
                    <Sparkle x={inner.x} y={inner.y} intensity={isLit ? 1 : 0.35} />
                  </g>
                );
              })}
            </svg>

            {items.map((item, index) => {
              const pt = pointOnCircle(FOCUS + index * STEP, PILL_R);
              return (
                <div
                  key={item.id}
                  className="absolute"
                  style={{
                    left: pt.x,
                    top: pt.y,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <button
                    ref={(el) => {
                      pillRefs.current[index] = el;
                    }}
                    type="button"
                    className={pillClass(index)}
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                    onClick={() => animateToIndex(index)}
                  >
                    {item.label}
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <p className="mt-4 text-xs text-[#4B4B4B]/60 sm:text-sm">
        {locale === "es" ? "Haz clic en una opción" : "Click an option"}
      </p>
    </div>
  );
}
