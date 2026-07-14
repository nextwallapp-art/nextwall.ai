"use client";

import { useEffect, useRef } from "react";
import HalftoneShape, { type HalftoneShapeKind } from "./HalftoneShape";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const SHAPES: HalftoneShapeKind[] = ["funnel", "circles", "diamond"];

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function FeatureCard({
  shape,
  title,
  text,
  index,
}: {
  shape: HalftoneShapeKind;
  title: string;
  text: string;
  index: number;
}) {
  return (
    <article className="w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_16px_48px_-28px_rgba(17,17,17,0.18)]">
      <div className="relative aspect-[4/3] w-full bg-[var(--surface-muted)] sm:aspect-square">
        <HalftoneShape
          shape={shape}
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="mt-2 font-[family-name:var(--font-heading)] text-xl font-normal leading-tight tracking-tight text-[var(--foreground)] sm:text-[1.35rem]">
          {title}
        </h3>
        <p className="mt-3 text-base leading-[1.65] text-[var(--muted)] sm:text-sm sm:leading-relaxed">
          {text}
        </p>
      </div>
    </article>
  );
}

export default function StackedCards() {
  const { t } = useLanguage();
  const cards = t.cards.items.map((item, i) => ({
    ...item,
    shape: SHAPES[i],
  }));

  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) return;

    const n = cards.length;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      let progress = total > 0 ? -rect.top / total : 0;
      progress = clamp(progress, 0, 1);

      const f = progress * (n + 1.15) - 0.35;
      const enterDist = vh * 0.92;
      const stackGapY = 14;
      const scaleStep = 0.035;
      const maxStack = 3;

      if (headlineRef.current) {
        const headlineFade = clamp(1 - f * 0.22, 0.18, 1);
        const headlineLift = clamp(f * 6, 0, 18);
        headlineRef.current.style.opacity = headlineFade.toFixed(3);
        headlineRef.current.style.transform = `translateY(-${headlineLift.toFixed(1)}px)`;
      }

      cardRefs.current.forEach((el, i) => {
        if (!el) return;

        const d = f - i;
        let y: number;
        let scale: number;
        let opacity: number;

        if (d < -0.05) {
          y = enterDist;
          scale = 0.94;
          opacity = 0;
        } else if (d < 1) {
          const local = clamp(d, 0, 1);
          const eased = easeOutCubic(local);
          y = (1 - eased) * enterDist;
          scale = 0.94 + 0.06 * eased;
          opacity = clamp(local * 2.2, 0, 1);
        } else {
          const stackPos = d - 1;
          const easedStack = easeInOutCubic(clamp(stackPos, 0, 1));
          const k = Math.min(stackPos, maxStack);
          y = -(k * stackGapY + easedStack * 4);
          scale = 1 - k * scaleStep;
          opacity = 1;
        }

        el.style.transform = `translate3d(-50%, -50%, 0) translate3d(0, ${y.toFixed(
          1,
        )}px, 0) scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const onBreakpoint = () => {
      if (!mq.matches) return;
      update();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    mq.addEventListener("change", onBreakpoint);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mq.removeEventListener("change", onBreakpoint);
    };
  }, [cards.length]);

  return (
    <>
      <section className="bg-[var(--background)] px-[var(--page-gutter)] py-14 sm:py-16 md:hidden">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
          {t.cards.sectionEyebrow}
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-heading)] text-[clamp(1.75rem,7vw,2.25rem)] font-normal leading-[1.12] tracking-tight text-[var(--foreground)]">
          {t.cards.sectionTitle}
        </h2>
        <p className="mt-4 max-w-prose text-base leading-[1.7] text-[var(--muted)]">
          {t.cards.sectionSubtitle}
        </p>
        <div className="mt-10 flex flex-col gap-8">
          {cards.map((card, i) => (
            <FeatureCard
              key={`${card.shape}-mobile-${i}`}
              shape={card.shape}
              title={card.title}
              text={card.text}
              index={i}
            />
          ))}
        </div>
      </section>

      <section
        ref={sectionRef}
        className="relative hidden bg-[var(--background)] md:block"
        style={{ height: `${(cards.length + 2.2) * 100}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          <div
            ref={headlineRef}
            className="pointer-events-none absolute inset-0 z-0"
          >
            <div className="grid h-full grid-cols-[minmax(0,1fr)_min(360px,38vw)_minmax(0,1fr)] items-center gap-6 px-[var(--page-gutter-wide)]">
              <div className="text-left font-[family-name:var(--font-heading)] text-[clamp(2.5rem,4.5vw,4.75rem)] font-normal leading-[0.95] tracking-tight text-[var(--foreground)]">
                <span className="block">{t.cards.bgLeft1}</span>
                <span className="mt-3 block">{t.cards.bgLeft2}</span>
              </div>
              <div aria-hidden="true" />
              <div className="text-right font-[family-name:var(--font-heading)] text-[clamp(2.5rem,4.5vw,4.75rem)] font-normal leading-[0.95] tracking-tight text-[var(--foreground)]">
                <span className="block">{t.cards.bgRight1}</span>
                <span className="mt-3 block">{t.cards.bgRight2}</span>
              </div>
            </div>
          </div>

          {cards.map((card, i) => (
            <article
              key={`${card.shape}-${i}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              style={{
                zIndex: 10 + i,
                opacity: 0,
                willChange: "transform, opacity",
              }}
              className="absolute left-1/2 top-1/2 w-[300px] overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_24px_70px_-32px_rgba(17,17,17,0.16)] lg:w-[340px]"
            >
              <div className="relative aspect-square w-full bg-[var(--surface-muted)]">
                <HalftoneShape
                  shape={card.shape}
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              <div className="p-6">
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-normal tracking-tight text-[var(--foreground)]">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {card.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
