"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { useScrollTo } from "@/components/providers/SmoothScroll";
import { LangSwitch } from "./LangSwitch";
import { dur, ease } from "@/lib/motion";

// Home sections are anchors; Insights and Contact are their own pages.
const ITEMS = [
  { id: "about", page: false },
  { id: "owners", page: true },
  { id: "corporate", page: true },
  { id: "assets", page: false },
  { id: "approach", page: false },
  { id: "insights", page: true },
  { id: "contact", page: true },
] as const;
type Item = (typeof ITEMS)[number];

export function Nav({ t, locale }: { t: Dictionary; locale: Locale }) {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollTo = useScrollTo();
  const lenis = useLenis();
  const other = locale === "en" ? "ar" : "en";
  const pathname = usePathname();
  const home = `/${locale}`;
  const onHome = pathname === home;
  // Switch language on the same page: /en/insights/x → /ar/insights/x
  const otherHref = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${other}`);
  const hrefOf = (it: Item) => (it.page ? `${home}/${it.id}` : onHome ? `#${it.id}` : `${home}#${it.id}`);
  // Signed-in state comes from /api/session so pages stay statically rendered.
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    let live = true;
    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { signedIn: boolean }) => live && setSignedIn(d.signedIn))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [pathname]);
  const accountHref = signedIn ? `${home}/account` : `${home}/login`;
  const isCurrent = (it: Item) => it.page && (pathname === `${home}/${it.id}` || pathname.startsWith(`${home}/${it.id}/`));

  // The header stays in place while scrolling; it only gains a background once the page moves.
  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 40));

  // Freeze the page behind the open menu; Escape closes it.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  // In-page anchors scroll smoothly on the home page; everything else is a normal link.
  const go = (it: Item | { id: "top"; page: false }) => (e: React.MouseEvent) => {
    setOpen(false);
    if (it.page || !onHome) return;
    e.preventDefault();
    // Let the menu release the scroll lock before travelling.
    requestAnimationFrame(() => scrollTo(`#${it.id}`));
  };

  return (
    <>
      <a href="#main" className="fixed start-4 top-4 z-[60] -translate-y-24 bg-basalt px-4 py-2 text-paper focus:translate-y-0">
        {t.nav.skip}
      </a>
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          className="shell flex h-18 items-center justify-between transition-colors"
          style={{
            transitionDuration: "var(--dur-ui)",
            backgroundColor: solid || open || !onHome ? "var(--color-paper)" : "transparent",
            boxShadow: solid && !open ? "0 1px 0 rgb(35 34 36 / 0.08)" : "none",
          }}
        >
          <Link href={onHome ? "#top" : home} onClick={go({ id: "top", page: false })} className="flex items-center gap-3" aria-label={t.brand.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aqar-mark.svg" alt="" className="h-9 w-auto" />
            <span className="whitespace-nowrap text-[0.95rem] font-medium tracking-[0.01em]">{t.brand.name}</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-6 whitespace-nowrap xl:flex 2xl:gap-9">
            {ITEMS.map((it) => (
              <Link
                key={it.id}
                href={hrefOf(it)}
                onClick={go(it)}
                aria-current={isCurrent(it) ? "page" : undefined}
                className="group relative text-[0.95rem] text-basalt/80 hover:text-basalt aria-[current=page]:text-basalt"
              >
                {it.id === "owners" ? t.owners.nav : it.id === "corporate" ? t.corporate.nav : t.nav[it.id]}
                <span
                  className={`absolute inset-x-0 -bottom-1 h-px origin-[left] bg-bronze transition-transform duration-[var(--dur-micro)] group-hover:scale-x-100 rtl:origin-[right] ${
                    isCurrent(it) ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            ))}
            <LangSwitch
              href={otherHref}
              lang={other}
              ariaLabel={t.nav.switchAria}
              className="border-s border-basalt/15 ps-6 text-[0.95rem] text-basalt/80 hover:text-basalt 2xl:ps-9"
            >
              {t.nav.switchLabel}
            </LangSwitch>
            <Link
              href={accountHref}
              aria-label={signedIn ? t.nav.account : t.nav.signInAria}
              aria-current={pathname.startsWith(accountHref) ? "page" : undefined}
              className="inline-flex h-10 items-center border border-basalt/25 px-4 text-[0.95rem] text-basalt transition-colors duration-[var(--dur-micro)] hover:border-basalt hover:bg-basalt hover:text-paper"
            >
              {signedIn ? t.nav.account : t.nav.signIn}
            </Link>
          </nav>

          <button
            type="button"
            className="relative h-10 w-10 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.close : t.nav.menu}
            onClick={() => setOpen((o) => !o)}
          >
            <span
              className="absolute inset-x-2 top-[15px] h-px bg-basalt transition-transform duration-[var(--dur-micro)]"
              style={{ transform: open ? "translateY(4.5px) rotate(45deg)" : "none" }}
            />
            <span
              className="absolute inset-x-2 top-[24px] h-px bg-basalt transition-transform duration-[var(--dur-micro)]"
              style={{ transform: open ? "translateY(-4.5px) rotate(-45deg)" : "none" }}
            />
          </button>
        </div>

        {/* Tablets and small laptops: the links stay visible in a strip under the bar
            (scrolls sideways if it runs out of room); phones keep the ☰ menu only. */}
        {!open && (
          <nav aria-label="Sections" className="hidden border-t border-basalt/10 bg-paper md:block xl:hidden" style={{ boxShadow: "0 1px 0 rgb(35 34 36 / 0.08)" }}>
            <div className="shell flex h-11 items-center gap-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
              {ITEMS.map((it) => (
                <Link
                  key={it.id}
                  href={hrefOf(it)}
                  onClick={go(it)}
                  aria-current={isCurrent(it) ? "page" : undefined}
                  className="shrink-0 text-[0.9rem] text-basalt/75 hover:text-basalt aria-[current=page]:text-bronze-deep"
                >
                  {it.id === "owners" ? t.owners.nav : it.id === "corporate" ? t.corporate.nav : t.nav[it.id]}
                </Link>
              ))}
              <LangSwitch
                href={otherHref}
                lang={other}
                ariaLabel={t.nav.switchAria}
                className="shrink-0 border-s border-basalt/15 ps-6 text-[0.9rem] text-basalt/75 hover:text-basalt"
              >
                {t.nav.switchLabel}
              </LangSwitch>
            </div>
          </nav>
        )}
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-end bg-paper px-[var(--gutter)] pb-12 pt-24 xl:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: dur.ui, ease: ease.inOut }}
          >
            <nav aria-label="Mobile" className="flex flex-col gap-2">
              {ITEMS.map((it, i) => (
                <motion.div
                  key={it.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.05, duration: dur.ui, ease: ease.out }}
                >
                  <Link
                    href={hrefOf(it)}
                    onClick={go(it)}
                    aria-current={isCurrent(it) ? "page" : undefined}
                    className="font-display text-[2.4rem] aria-[current=page]:text-bronze-deep"
                  >
                    {it.id === "owners" ? t.owners.nav : it.id === "corporate" ? t.corporate.nav : t.nav[it.id]}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-10 flex items-center justify-between gap-6">
              <LangSwitch href={otherHref} lang={other} ariaLabel={t.nav.switchAria} className="text-lg text-olive">
                {t.nav.switchLabel}
              </LangSwitch>
              <Link href={accountHref} onClick={() => setOpen(false)} className="inline-flex h-11 items-center border border-basalt/30 px-5 text-basalt">
                {signedIn ? t.nav.account : t.nav.signIn}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
