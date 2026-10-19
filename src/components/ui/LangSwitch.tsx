"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { dur, ease } from "@/lib/motion";

/**
 * Language link with a curtain: a basalt panel rises over the page, the other
 * locale loads beneath it, then the panel lifts away as the new path arrives.
 * The layout stays mounted across locales, so the curtain is derived from the
 * path rather than held in state that would outlive the navigation.
 */
export function LangSwitch({ href, lang, className, ariaLabel, children }: { href: string; lang: string; className?: string; ariaLabel?: string; children: ReactNode }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [target, setTarget] = useState<string | null>(null);
  const leaving = target !== null && target !== pathname;
  // Next keeps the previous page alive in a hidden <Activity> for instant Back.
  // Hiding runs effect cleanups, so drop the curtain then; otherwise Back would reveal it.
  useEffect(() => () => setTarget(null), []);
  // Portal to <body>: the nav header is transformed, which would trap a fixed overlay inside it.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <>
      <Link
        href={href}
        hrefLang={lang}
        lang={lang}
        aria-label={ariaLabel}
        className={className}
        onClick={(e) => {
          if (reduce || e.metaKey || e.ctrlKey || e.shiftKey) return;
          e.preventDefault();
          setTarget(href);
          router.prefetch(href);
          setTimeout(() => router.push(href), dur.large * 1000 * 0.8);
        }}
      >
        {children}
      </Link>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {leaving && (
              <motion.div
                aria-hidden
                className="fixed inset-0 z-[70] flex items-center justify-center bg-basalt"
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                animate={{ clipPath: "inset(0% 0 0 0)" }}
                exit={{ clipPath: "inset(0 0 100% 0)", transition: { delay: 0.15, duration: dur.large, ease: ease.inOut } }}
                transition={{ duration: dur.large * 0.8, ease: ease.inOut }}
              >
                <motion.img
                  src="/aqar-mark.svg"
                  alt=""
                  className="h-20 w-auto"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: dur.ui, ease: ease.out }}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
