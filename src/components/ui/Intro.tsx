"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { INTRO_KEY } from "@/lib/intro";

/*
  Opening screen, once per browser session: "Welcome to" settles in, the
  AQAR wordmark is drawn as an outline and fills with bronze from the ground
  up (the same gesture as the Vision 2030 numerals), then the screen lifts
  away. It is pure CSS so it plays from the first paint, before hydration;
  the inline script in the root layout hides it for visitors who have
  already seen it this session. Clicking skips it; reduced motion never shows it.
*/
const KEY = INTRO_KEY;
const TOTAL_MS = 3400;

export function Intro({ t, locale }: { t: Dictionary["intro"]; locale: Locale }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Read the class the inline script set before paint, not storage: storage is written
    // below, and a second effect run (React dev) would otherwise see its own write.
    const seen = document.documentElement.classList.contains("intro-seen");
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      // Storage blocked: the intro simply plays each visit.
    }
    // Already hidden by CSS for returning visitors; drop it from the page either way.
    const id = setTimeout(() => setGone(true), seen ? 0 : TOTAL_MS);
    return () => clearTimeout(id);
  }, []);

  if (gone) return null;

  const word =
    locale === "ar"
      ? "font-[family-name:var(--font-kufi)] text-[clamp(6rem,26vw,20rem)] leading-[1.1]"
      : "font-[family-name:var(--font-serif)] text-[clamp(5rem,22vw,18rem)] leading-[0.85] tracking-[-0.02em]";

  return (
    <div className="aqar-intro fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-basalt text-paper" aria-hidden onClick={() => setGone(true)}>
        <p className="aqar-intro-lead text-[clamp(0.9rem,1.6vw,1.25rem)] uppercase tracking-[0.5em] text-sand rtl:tracking-normal">{t.welcome}</p>
        <div className="relative mt-4" dir="ltr">
          <span className={`${word} block text-transparent [-webkit-text-stroke:1px_rgb(205_154_98/0.6)]`}>{t.word}</span>
          <span className={`${word} aqar-intro-fill absolute inset-0 block bg-linear-to-b from-bronze to-bronze-deep bg-clip-text text-transparent`}>
            {t.word}
            <span className={`${word} vision-sheen absolute inset-0 block`}>{t.word}</span>
          </span>
        </div>
        <span className="aqar-intro-rule mt-16 block h-px w-40 origin-center bg-bronze/70" />
    </div>
  );
}
