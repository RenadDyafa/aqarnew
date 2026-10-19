"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { clearReopened, consentReopened, getConsent, reopenConsent, setConsent, subscribeConsent, type Consent } from "@/lib/consent";
import { dur, ease } from "@/lib/motion";

// Snapshot: should the banner show? Only on the client, and only before a choice or after "Cookie settings".
const shouldShow = () => getConsent() === null || consentReopened();

export function CookieConsent({ t, locale }: { t: Dictionary; locale: Locale }) {
  const visible = useSyncExternalStore(subscribeConsent, shouldShow, () => false);

  const choose = (c: Consent) => {
    clearReopened();
    setConsent(c);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          role="region"
          aria-label={t.cookies.label}
          className="fixed inset-x-0 bottom-0 z-[65] bg-basalt text-paper"
          initial={{ y: "100%" }}
          animate={{ y: "0%", transition: { duration: dur.ui, ease: ease.out, delay: 0.6 } }}
          exit={{ y: "100%", transition: { duration: dur.micro + 0.1, ease: ease.inOut } }}
        >
          <div className="shell flex flex-col gap-5 py-5 md:flex-row md:items-center md:justify-between md:gap-10">
            <p className="max-w-[46rem] text-[0.95rem] leading-relaxed text-paper/90">
              {t.cookies.banner}{" "}
              <Link href={`/${locale}/cookies`} className="whitespace-nowrap underline decoration-bronze underline-offset-4 hover:text-paper">
                {t.cookies.policy}
              </Link>
            </p>
            <div className="flex shrink-0 flex-wrap gap-3">
              <button
                type="button"
                onClick={() => choose("essential")}
                className="inline-flex h-11 items-center border border-paper/30 px-5 text-[0.95rem] transition-colors duration-[var(--dur-micro)] hover:border-paper"
              >
                {t.cookies.essential}
              </button>
              <button
                type="button"
                onClick={() => choose("all")}
                className="inline-flex h-11 items-center bg-bronze px-5 text-[0.95rem] text-basalt transition-colors duration-[var(--dur-micro)] hover:bg-sand"
              >
                {t.cookies.allow}
              </button>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={reopenConsent}
      className="underline-offset-4 hover:text-paper hover:underline"
    >
      {label}
    </button>
  );
}
