"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import type { Dictionary } from "@/i18n/en";

/*
  Saudi Vision 2030 alignment. The year is set as architecture: each numeral
  rises into place in turn, its outline fills with bronze from the ground up
  as the section scrolls into view (each digit a step behind the last), and a
  band of light keeps travelling across the filled digits. Text only; the
  official Vision 2030 logo is a protected mark and is not used here.
*/
const DIGITS = ["2", "0", "3", "0"];
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const NUMERALS = "font-[family-name:var(--font-serif)] text-[clamp(7rem,24vw,22rem)] leading-[0.8] tracking-[-0.03em]";

function Digit({ d, i, progress, reduce }: { d: string; i: number; progress: MotionValue<number>; reduce: boolean | null }) {
  const start = i * 0.08;
  const clipPath = useTransform(progress, [start, start + 0.76], ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]);

  return (
    <motion.span
      className="relative block"
      initial={reduce ? false : { y: "35%", opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1.1, ease: EASE_OUT, delay: i * 0.14 }}
    >
      <span className={`${NUMERALS} block text-transparent [-webkit-text-stroke:1px_rgb(201_202_188/0.45)]`}>{d}</span>
      <motion.span
        className={`${NUMERALS} absolute inset-0 block bg-linear-to-b from-bronze to-bronze-deep bg-clip-text text-transparent`}
        style={reduce ? undefined : { clipPath }}
      >
        {d}
        <span className={`${NUMERALS} vision-sheen absolute inset-0 block`} style={{ animationDelay: `${i * 0.18}s` }}>
          {d}
        </span>
      </motion.span>
    </motion.span>
  );
}

export function Vision({ t }: { t: Dictionary }) {
  const v = t.vision;
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "center 45%"] });

  return (
    <section id="vision" ref={ref} aria-labelledby="vision-title" className="relative z-10 overflow-hidden bg-basalt py-[18vh] text-paper">
      <div className="shell grid grid-cols-12 items-end gap-x-6 gap-y-12">
        <div className="relative col-span-12 flex select-none lg:col-span-7" aria-hidden dir="ltr">
          {DIGITS.map((d, i) => (
            <Digit key={i} d={d} i={i} progress={scrollYProgress} reduce={reduce} />
          ))}
        </div>

        <div className="col-span-12 lg:col-span-5 lg:pb-[2vw]">
          <h2 id="vision-title" className="font-display text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.05]">
            {v.heading}
          </h2>
          <p className="mt-6 max-w-[32rem] text-[1.05rem] leading-[1.7] text-sand">{v.intro}</p>
        </div>

        <ul className="col-span-12 mt-[6vh] grid gap-x-6 gap-y-12 md:grid-cols-3">
          {v.pillars.map((p) => (
            <li key={p.theme} className="border-t border-bronze/60 pt-6">
              <h3 className="font-display text-[clamp(1.6rem,2.4vw,2.2rem)] leading-[1.1]">{p.theme}</h3>
              <p className="mt-4 max-w-[26rem] text-[0.98rem] leading-[1.7] text-sand">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
