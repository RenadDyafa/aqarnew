"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Dictionary } from "@/i18n/en";
import { dur, ease } from "@/lib/motion";

/*
  Five reasons set as type, stepping inward row by row like a terraced
  facade. No cards: the indentation is the structure.
*/
export function Why({ t }: { t: Dictionary }) {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="why-title" className="relative z-10 bg-paper pb-[20vh] pt-[18vh]">
      <div className="shell">
        <h2 id="why-title" className="font-display text-[clamp(1.4rem,2vw,2rem)] text-olive">
          {t.why.heading}
        </h2>
        <ul className="mt-[8vh] space-y-[6vh]">
          {t.why.items.map((item, i) => (
            <li
              key={item.title}
              className="grid grid-cols-12 items-baseline gap-x-6 gap-y-3"
              style={{ ["--step" as string]: i }}
            >
              <div className="col-span-12 overflow-hidden lg:col-span-8 lg:ps-[calc(var(--step)*6%)]">
                <motion.h3
                  className="font-display text-[clamp(2.4rem,6vw,6.2rem)] leading-[1] text-basalt"
                  initial={reduce ? { opacity: 0 } : { y: "100%" }}
                  whileInView={reduce ? { opacity: 1 } : { y: "0%" }}
                  viewport={{ once: true, margin: "0px 0px -12% 0px" }}
                  transition={{ duration: dur.large, ease: ease.out }}
                >
                  {item.title}
                </motion.h3>
              </div>
              <p className="col-span-12 max-w-[24rem] text-olive sm:col-span-8 lg:col-span-4">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
