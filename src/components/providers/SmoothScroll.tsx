"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { Suspense, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useMedia } from "@/lib/use-media";

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useMedia("(prefers-reduced-motion: reduce)");

  if (reduced)
    return (
      <>
        <Suspense fallback={null}>
          <HashOnArrival />
        </Suspense>
        {children}
      </>
    );
  return (
    <ReactLenis root options={{ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4, anchors: false }}>
      <Suspense fallback={null}>
          <HashOnArrival />
        </Suspense>
      {children}
    </ReactLenis>
  );
}

/** Scroll to an in-page anchor through Lenis when present, natively otherwise. */
export function useScrollTo() {
  const lenis = useLenis();
  return (hash: string) => {
    const el = document.querySelector<HTMLElement>(hash);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: "auto" });
    el.focus({ preventScroll: true });
  };
}

/** Arriving from another page at /en#approach: jump to the section once it exists. */
function HashOnArrival() {
  const pathname = usePathname();
  const lenis = useLenis();
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>(hash);
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { immediate: true, force: true });
      else el.scrollIntoView();
    }, 120);
    return () => window.clearTimeout(id);
  }, [pathname, lenis]);
  return null;
}
