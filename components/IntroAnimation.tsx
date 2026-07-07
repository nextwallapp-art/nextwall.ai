"use client";

import NextWallLogo from "@/components/NextWallLogo";
import { useEffect, useState } from "react";

const STORAGE_KEY = "nextwall-intro-seen";
const INTRO_DONE_EVENT = "nextwall:intro-done";

declare global {
  interface Window {
    __nextwallIntroDone?: boolean;
  }
}

function markIntroDone() {
  window.__nextwallIntroDone = true;
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}

type IntroAnimationProps = {
  children: React.ReactNode;
};

export default function IntroAnimation({ children }: IntroAnimationProps) {
  const [ready, setReady] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [textHidden, setTextHidden] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);

    if (seen) {
      const seenTimer = window.setTimeout(() => {
        setContentVisible(true);
        setReady(true);
        markIntroDone();
      }, 0);
      return () => window.clearTimeout(seenTimer);
    }

    const startTimer = window.setTimeout(() => {
      setShowIntro(true);
      setReady(true);
    }, 0);

    const blankTimer = window.setTimeout(() => {
      setTextVisible(true);
    }, 300);

    const holdTimer = window.setTimeout(() => {
      setTextHidden(true);
    }, 300 + 800 + 1000);

    const finishTimer = window.setTimeout(() => {
      setShowIntro(false);
      setContentVisible(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
      markIntroDone();
    }, 300 + 800 + 1000 + 600);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(blankTimer);
      window.clearTimeout(holdTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  if (!ready) {
    return <div className="fixed inset-0 z-[100] bg-[var(--background)]" aria-hidden="true" />;
  }

  return (
    <>
      {showIntro && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]"
          aria-hidden="true"
        >
          <div
            className={`intro-logo ${
              textVisible && !textHidden
                ? "intro-logo-visible"
                : textHidden
                  ? "intro-logo-hidden"
                  : ""
            }`}
          >
            <NextWallLogo className="h-auto w-[min(68vw,540px)]" priority />
          </div>
        </div>
      )}

      <div
        className={`landing-reveal ${contentVisible ? "landing-reveal-visible" : ""}`}
      >
        {children}
      </div>
    </>
  );
}
