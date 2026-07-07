"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

const INTRO_DONE_EVENT = "nextwall:intro-done";

type AnimatedTitleProps = {
  text: string;
  className?: string;
};

export default function AnimatedTitle({ text, className }: AnimatedTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const words = Array.from(
      container.querySelectorAll<HTMLElement>("[data-word]"),
    );
    if (words.length === 0) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      gsap.set(words, { y: 0, opacity: 1 });
      return;
    }

    gsap.set(words, { y: 24, opacity: 0 });

    let started = false;

    const runAnimation = () => {
      if (started) return;
      started = true;
      gsap.to(words, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.08,
      });
    };

    const onIntroDone = () => runAnimation();

    if (typeof window !== "undefined" && window.__nextwallIntroDone) {
      runAnimation();
    } else {
      window.addEventListener(INTRO_DONE_EVENT, onIntroDone);
    }

    return () => {
      window.removeEventListener(INTRO_DONE_EVENT, onIntroDone);
      gsap.killTweensOf(words);
    };
  }, [text]);

  const words = text.split(" ");

  return (
    <h1 ref={containerRef} className={className}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          data-word
          className="inline-block"
          style={{ willChange: "transform, opacity" }}
        >
          {word}
          {index < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </h1>
  );
}
