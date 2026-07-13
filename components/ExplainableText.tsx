"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ExplainableTerm = {
  word: string;
  beginner: string;
  intermediate: string;
  advanced: string;
};

export type ExperienceLevel = string | null;

function getDefinition(term: ExplainableTerm, level: ExperienceLevel): string {
  if (level === "advanced") return term.advanced;
  if (level === "intermediate") return term.intermediate;
  return term.beginner;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTermMap(terms: ExplainableTerm[]): Map<string, ExplainableTerm> {
  const map = new Map<string, ExplainableTerm>();
  for (const term of terms) {
    map.set(term.word.toLowerCase(), term);
  }
  return map;
}

function splitTextByTerms(
  text: string,
  terms: ExplainableTerm[],
): { type: "text" | "term"; value: string }[] {
  if (!text || terms.length === 0) {
    return [{ type: "text", value: text }];
  }

  const sorted = [...terms].sort((a, b) => b.word.length - a.word.length);
  const pattern = sorted.map((term) => escapeRegex(term.word)).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex).filter((part) => part.length > 0);
  const termMap = buildTermMap(terms);

  return parts.map((part) => {
    const match = termMap.get(part.toLowerCase());
    if (match) {
      return { type: "term" as const, value: part };
    }
    return { type: "text" as const, value: part };
  });
}

function TermSpan({
  display,
  term,
  experienceLevel,
  active,
  onToggle,
}: {
  display: string;
  term: ExplainableTerm;
  experienceLevel: ExperienceLevel;
  active: boolean;
  onToggle: () => void;
}) {
  const definition = getDefinition(term, experienceLevel);

  return (
    <span className="relative inline">
      <button
        type="button"
        onClick={onToggle}
        className={`inline cursor-pointer border-none bg-transparent p-0 text-inherit underline decoration-dotted underline-offset-[3px] transition-colors ${
          active
            ? "text-[#111111] decoration-[#111111]"
            : "text-[#111111]/85 decoration-[#111111]/45 hover:text-[#111111] hover:decoration-[#111111]/70"
        }`}
      >
        {display}
      </button>
      {active && (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 block w-64 border border-[#bbbbbb] bg-[#ffffff] p-4 shadow-sm"
        >
          <span className="block text-xs font-medium uppercase tracking-wide text-[#111111]/45">
            {term.word}
          </span>
          <span className="mt-2 block text-sm leading-relaxed text-[#111111]/75">
            {definition}
          </span>
        </span>
      )}
    </span>
  );
}

function ExplainableParagraph({
  text,
  terms,
  experienceLevel,
  enabled,
  openTermKey,
  onTermToggle,
}: {
  text: string;
  terms: ExplainableTerm[];
  experienceLevel: ExperienceLevel;
  enabled: boolean;
  openTermKey: string | null;
  onTermToggle: (key: string) => void;
}) {
  const segments = useMemo(
    () => (enabled ? splitTextByTerms(text, terms) : [{ type: "text" as const, value: text }]),
    [text, terms, enabled],
  );

  return (
    <p className="text-sm leading-[1.75] text-[#111111]/75">
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={`text-${index}`}>{segment.value}</span>;
        }

        const term = buildTermMap(terms).get(segment.value.toLowerCase());
        if (!term) {
          return <span key={`fallback-${index}`}>{segment.value}</span>;
        }

        const termKey = `${term.word.toLowerCase()}-${index}`;

        return (
          <TermSpan
            key={termKey}
            display={segment.value}
            term={term}
            experienceLevel={experienceLevel}
            active={openTermKey === termKey}
            onToggle={() => onTermToggle(termKey)}
          />
        );
      })}
    </p>
  );
}

export default function ExplainableText({
  text,
  terms,
  experienceLevel = null,
  enabled = false,
  className = "",
}: {
  text: string;
  terms: ExplainableTerm[];
  experienceLevel?: ExperienceLevel;
  enabled?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openTermKey, setOpenTermKey] = useState<string | null>(null);

  useEffect(() => {
    if (!openTermKey) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenTermKey(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openTermKey]);

  useEffect(() => {
    if (!enabled) {
      setOpenTermKey(null);
    }
  }, [enabled]);

  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  function handleTermToggle(key: string) {
    setOpenTermKey((current) => (current === key ? null : key));
  }

  if (!enabled) {
    return (
      <div className={`space-y-6 ${className}`}>
        {paragraphs.map((paragraph, index) => (
          <p
            key={`plain-${index}`}
            className="text-sm leading-[1.75] text-[#111111]/75"
          >
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`space-y-6 ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <ExplainableParagraph
          key={`paragraph-${index}`}
          text={paragraph}
          terms={terms}
          experienceLevel={experienceLevel}
          enabled={enabled}
          openTermKey={openTermKey}
          onTermToggle={handleTermToggle}
        />
      ))}
    </div>
  );
}
