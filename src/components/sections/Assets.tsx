"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import type { Dictionary } from "@/i18n/en";
import { media } from "@/content/media";
import { useMedia } from "@/lib/use-media";
import { range, smooth } from "@/lib/motion";

/** Scroll position → panel position, holding still on each panel before moving on. */
const stepped = (n: number) => (p: number) => {
  const seg = p * (n - 1);
  const i = Math.min(n - 2, Math.floor(seg));
  return i + smooth(range(seg - i, 0.22, 0.78));
};
import { AssetCaption } from "./AssetCaption";

/*
  Editorial showcase, not a marketplace: one asset per screen.
  Desktop pins the viewport and scrolls the assets horizontally;
  each photograph is unmasked from its leading edge and settles from a
  slight scale while the caption trails behind it.
*/
export function Assets({ t, dir }: { t: Dictionary; dir: "ltr" | "rtl" }) {
  const wide = useMedia("(min-width: 768px)", true);
  return (
    <section id="assets" tabIndex={-1} aria-labelledby="assets-title" className="relative z-10 bg-basalt outline-none">
      <h2 id="assets-title" className="sr-only">
        {t.assets.heading}
      </h2>
      {wide ? <Horizontal t={t} dir={dir} /> : <Stacked t={t} />}
    </section>
  );
}

function SectionMark({ t }: { t: Dictionary }) {
  return (
    <div className="shell pointer-events-none absolute inset-x-0 top-24 z-10 flex items-baseline justify-between text-paper" aria-hidden>
      <span className="font-display text-[clamp(1.4rem,2vw,2rem)]">{t.assets.heading}</span>
      {t.assets.placeholderNote && <span className="text-sm text-paper/60">{t.assets.placeholderNote}</span>}
    </div>
  );
}

function Horizontal({ t, dir }: { t: Dictionary; dir: "ltr" | "rtl" }) {
  const ref = useRef<HTMLDivElement>(null);
  const n = t.assets.items.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Reading direction: assets arrive from the end edge (right in LTR, left in RTL).
  const sign = dir === "rtl" ? 1 : -1;
  const pos = useTransform(scrollYProgress, stepped(n));

  return (
    <div ref={ref} style={{ height: `${n * 130}vh` }} className="relative">
      <div className="sticky top-0 h-svh overflow-hidden">
        <ul className="relative h-full">
          {t.assets.items.map((a, i) => (
            <Panel key={a.title} t={t} i={i} pos={pos} sign={sign} />
          ))}
        </ul>
        <SectionMark t={t} />
      </div>
    </div>
  );
}

/*
  Panels are stacked. Each incoming photograph is unmasked horizontally
  over the one before it, drifting in from the end edge while the outgoing
  frame recedes and dims, so a full image is always on screen.
*/
function Panel({ t, i, pos, sign }: { t: Dictionary; i: number; pos: MotionValue<number>; sign: number }) {
  const a = t.assets.items[i];
  // -1 while waiting, 0 when settled, +1 once the next panel has covered it.
  const local = useTransform(pos, (p) => Math.max(-1, Math.min(1, p - i)));
  const hidden = useTransform(local, (l) => (l < 0 ? -l * 100 : 0));
  const clipPath = useTransform(hidden, (h) => (sign < 0 ? `inset(0 0 0 ${h}%)` : `inset(0 ${h}% 0 0)`));
  const imgX = useTransform(local, [-1, 0, 1], [`${-sign * 14}%`, "0%", `${sign * 6}%`]);
  const imgScale = useTransform(local, [-1, 0, 1], [1.16, 1, 1.04]);
  const dim = useTransform(local, [0, 1], [0, 0.55]);
  const capX = useTransform(local, [-0.5, 0, 0.6], [`${-sign * 12}vw`, "0vw", `${sign * 6}vw`]);
  const capOpacity = useTransform(local, [-0.45, -0.05, 0.25, 0.55], [0, 1, 1, 0]);

  return (
    <li className="absolute inset-0 overflow-hidden" style={{ zIndex: i }} aria-roledescription="slide">
      <motion.div className="absolute inset-0" style={{ clipPath }}>
        <motion.div className="absolute inset-[0_-8%]" style={{ x: imgX, scale: imgScale }}>
          <Image src={media[a.image].src} alt={a.alt} fill sizes="100vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-linear-to-t from-basalt/65 via-basalt/10 to-transparent" />
        <motion.div className="absolute inset-0 bg-basalt" style={{ opacity: dim }} />
      </motion.div>
      <motion.div className="absolute inset-x-0 bottom-0" style={{ x: capX, opacity: capOpacity }}>
        <AssetCaption t={t} index={i} />
      </motion.div>
    </li>
  );
}

function Stacked({ t }: { t: Dictionary }) {
  return (
    <div className="relative">
      <SectionMark t={t} />
      <ul>
        {t.assets.items.map((a, i) => (
          <StackedPanel key={a.title} t={t} i={i} />
        ))}
      </ul>
    </div>
  );
}

function StackedPanel({ t, i }: { t: Dictionary; i: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const a = t.assets.items[i];
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const inset = useTransform(scrollYProgress, [0, 0.35], [14, 0]);
  const clipPath = useTransform(inset, (v) => `inset(${v}% 0 0 0)`);

  return (
    <li ref={ref} className="relative h-[92svh] overflow-hidden">
      <motion.div className="absolute inset-0" style={i === 0 ? undefined : { clipPath }}>
        <motion.div className="absolute inset-[-10%_0]" style={{ y }}>
          <Image src={media[a.image].src} alt={a.alt} fill sizes="100vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-linear-to-t from-basalt/75 via-basalt/10 to-transparent" />
      </motion.div>
      <div className="absolute inset-x-0 bottom-0">
        <AssetCaption t={t} index={i} />
      </div>
    </li>
  );
}
