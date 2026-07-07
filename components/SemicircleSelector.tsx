"use client";

import { useMemo, useState } from "react";

export type SemicircleSection = "markets" | "crypto" | "metals" | "macro";

const WIDTH = 560;
const HEIGHT = 300;
const CX = WIDTH / 2;
const CY = 246;
const R_OUT = 190;
const R_IN = 118;

/** Three radials from center: left 120°, up 90°, right 60° */
const RADIAL_ANGLES = [(2 * Math.PI) / 3, Math.PI / 2, Math.PI / 3] as const;

type SectionConfig = {
  id: SemicircleSection;
  label: string;
  labelX: number;
  labelY: number;
  arcStart?: number;
  arcEnd?: number;
};

function buildSections(locale: "en" | "es"): SectionConfig[] {
  const t = (es: string, en: string) => (locale === "es" ? es : en);

  const cryptoPt = pointOnArc(Math.PI, R_OUT);
  const macroPt = pointOnArc(0, R_OUT);
  const metalsPt = pointOnArc(Math.PI / 2, R_OUT);

  return [
    {
      id: "crypto",
      label: "Crypto",
      labelX: cryptoPt.x - 34,
      labelY: cryptoPt.y - 10,
      arcStart: Math.PI,
      arcEnd: (2 * Math.PI) / 3,
    },
    {
      id: "metals",
      label: t("Metales", "Metals"),
      labelX: metalsPt.x,
      labelY: metalsPt.y - 28,
      arcStart: (2 * Math.PI) / 3,
      arcEnd: Math.PI / 3,
    },
    {
      id: "macro",
      label: "Macro",
      labelX: macroPt.x + 34,
      labelY: macroPt.y - 10,
      arcStart: Math.PI / 3,
      arcEnd: 0,
    },
    {
      id: "markets",
      label: t("Mercados", "Markets"),
      labelX: CX,
      labelY: CY - 44,
    },
  ];
}

function pointOnArc(angle: number, radius: number) {
  return {
    x: CX + radius * Math.cos(angle),
    y: CY - radius * Math.sin(angle),
  };
}

function arcPath(start: number, end: number, radius: number) {
  const p1 = pointOnArc(start, radius);
  const p2 = pointOnArc(end, radius);
  // Sweep flag 0 forces the upper semicircle (the lower one was being drawn).
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${radius} ${radius} 0 0 0 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

function sectionRange(
  sections: SectionConfig[],
  id: SemicircleSection,
): { start: number; end: number } | null {
  const s = sections.find((x) => x.id === id);
  if (s?.arcStart === undefined || s?.arcEnd === undefined) return null;
  return { start: s.arcStart, end: s.arcEnd };
}

function angleInRange(angle: number, start: number, end: number) {
  return angle >= end - 0.02 && angle <= start + 0.02;
}

function Sparkle({
  x,
  y,
  size = 1,
}: {
  x: number;
  y: number;
  size?: number;
}) {
  const s = size;
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#sparkle-glow)">
      <circle r={7.5 * s} fill="url(#sparkle-halo)" opacity={0.92} />
      <line
        x1={-9 * s}
        y1={0}
        x2={9 * s}
        y2={0}
        stroke="#ffffff"
        strokeWidth={0.7}
        opacity={0.7}
      />
      <line
        x1={0}
        y1={-9 * s}
        x2={0}
        y2={9 * s}
        stroke="#ffffff"
        strokeWidth={0.7}
        opacity={0.7}
      />
      <line
        x1={-5 * s}
        y1={-5 * s}
        x2={5 * s}
        y2={5 * s}
        stroke="#ffffff"
        strokeWidth={0.45}
        opacity={0.35}
      />
      <line
        x1={5 * s}
        y1={-5 * s}
        x2={-5 * s}
        y2={5 * s}
        stroke="#ffffff"
        strokeWidth={0.45}
        opacity={0.35}
      />
      <circle r={1.6 * s} fill="#ffffff" />
      <circle cx={-0.5 * s} cy={-0.5 * s} r={0.6 * s} fill="#ffffff" opacity={0.9} />
    </g>
  );
}

type SemicircleSelectorProps = {
  locale: "en" | "es";
  selected: SemicircleSection | null;
  onSelect: (section: SemicircleSection) => void;
};

export default function SemicircleSelector({
  locale,
  selected,
  onSelect,
}: SemicircleSelectorProps) {
  const sections = useMemo(() => buildSections(locale), [locale]);
  const [hovered, setHovered] = useState<SemicircleSection | null>(null);
  const active = selected ?? hovered;

  const lineOpacity = (angle: number) => {
    if (!active) return 0.28;
    const range = sectionRange(sections, active);
    if (!range) return 0.28;
    if (angleInRange(angle, range.start, range.end)) return 0.5;
    if (
      Math.abs(angle - range.start) < 0.06 ||
      Math.abs(angle - range.end) < 0.06
    )
      return 0.42;
    return 0.28;
  };

  function pillClass(id: SemicircleSection) {
    const isSelected = selected === id;
    const isHovered = hovered === id;
    return [
      "rounded-[8px] border px-[18px] py-[7px] text-[13px] tracking-[0.01em]",
      "font-[family-name:var(--font-heading)] text-[#111111]",
      "shadow-[0_2px_12px_rgba(17,17,17,0.06)]",
      "transition-all duration-200",
      isSelected
        ? "border-[#111111]/30 bg-[#ffffff] shadow-[0_4px_18px_rgba(17,17,17,0.1)]"
        : isHovered
          ? "border-[#111111]/18 bg-[#ffffff] shadow-[0_4px_18px_rgba(17,17,17,0.1)]"
          : "border-[#111111]/10 bg-[#ffffff]",
    ].join(" ");
  }

  return (
    <div className="flex flex-col items-center py-8">
      <div
        className="relative mx-auto max-w-full"
        style={{ width: WIDTH, height: HEIGHT }}
      >
        <svg
          width={WIDTH}
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <filter id="sparkle-glow" x="-180%" y="-180%" width="460%" height="460%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="sparkle-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="48%" stopColor="#f6f6f6" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#d9d9d9" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer arc — uniform thin line */}
          <path
            d={arcPath(Math.PI, 0, R_OUT)}
            fill="none"
            stroke="#2b2b2b"
            strokeWidth={1}
            strokeLinecap="round"
            opacity={active ? 0.5 : 0.42}
          />

          {/* Inner arc — uniform thin line */}
          <path
            d={arcPath(Math.PI, 0, R_IN)}
            fill="none"
            stroke="#2b2b2b"
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.28}
          />

          {/* Radials: center → outer arc */}
          {RADIAL_ANGLES.map((angle) => {
            const outer = pointOnArc(angle, R_OUT);
            return (
              <line
                key={`radial-${angle}`}
                x1={CX}
                y1={CY}
                x2={outer.x}
                y2={outer.y}
                stroke="#2b2b2b"
                strokeWidth={1}
                opacity={lineOpacity(angle)}
              />
            );
          })}

          {/* Brillitos — reference positions */}
          <Sparkle
            {...pointOnArc(Math.PI / 2, R_IN)}
            size={active === "metals" ? 1.15 : 1}
          />
          <Sparkle
            {...pointOnArc((2 * Math.PI) / 3, R_OUT)}
            size={
              active === "crypto" || active === "metals" ? 1.1 : 1
            }
          />
          <Sparkle
            {...pointOnArc(Math.PI / 3, R_OUT)}
            size={active === "macro" || active === "metals" ? 1.1 : 1}
          />
        </svg>

        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`absolute -translate-x-1/2 -translate-y-1/2 ${pillClass(section.id)}`}
            style={{ left: section.labelX, top: section.labelY }}
            onMouseEnter={() => setHovered(section.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}
