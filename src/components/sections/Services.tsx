"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/en";
import { media } from "@/content/media";
import { dur, ease } from "@/lib/motion";

// One basalt per discipline: the room changes tone, never colour.
const TONES = ["#232224", "#262521", "#22231f", "#28241f"];

export function Services({ t }: { t: Dictionary }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const uid = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const items = t.services.items;
  const item = items[active];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const rtl = document.documentElement.dir === "rtl";
    const next = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
    let to: number | undefined;
    if (next) to = (i + next + items.length) % items.length;
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = items.length - 1;
    if (to === undefined) return;
    e.preventDefault();
    setActive(to);
    tabs.current[to]?.focus();
  };

  return (
    <motion.section
      id="services"
      tabIndex={-1}
      aria-labelledby="services-title"
      className="relative z-10 overflow-hidden py-[16vh] text-paper outline-none"
      animate={{ backgroundColor: TONES[active] }}
      initial={false}
      transition={{ duration: dur.large, ease: ease.inOut }}
    >
      <div className="shell grid grid-cols-12 gap-x-6 gap-y-16">
        <header className="col-span-12 flex flex-wrap items-baseline justify-between gap-6">
          <h2 id="services-title" className="font-display text-[clamp(1.6rem,2.4vw,2.2rem)] text-sand">
            {t.services.heading}
          </h2>
          <p className="text-sand/70">{t.services.intro}</p>
        </header>

        <div role="tablist" aria-orientation="vertical" aria-label={t.services.heading} className="col-span-12 flex flex-col lg:col-span-6">
          {items.map((s, i) => {
            const selected = i === active;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`${uid}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${uid}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
                className="group relative flex items-baseline gap-6 py-[1.4vh] text-start"
              >
                <span className={`w-8 shrink-0 text-sm tabular-nums transition-colors duration-[var(--dur-micro)] ${selected ? "text-bronze" : "text-sand/75"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`font-display text-[clamp(2rem,3.9vw,4.2rem)] leading-[1.02] transition-colors duration-[var(--dur-ui)] ${
                    selected ? "text-paper" : "text-paper/50 group-hover:text-paper/75"
                  }`}
                >
                  {s.title}
                </span>
                {selected && (
                  <motion.span
                    layoutId="service-rule"
                    className="absolute bottom-0 start-14 h-px w-[min(18rem,40%)] bg-bronze"
                    transition={{ duration: dur.ui, ease: ease.out }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`${uid}-panel`}
          aria-labelledby={`${uid}-tab-${active}`}
          className="col-span-12 grid grid-cols-6 gap-x-6 gap-y-8 lg:col-span-6"
        >
          <div className="relative col-span-6 aspect-[16/11] overflow-hidden bg-basalt-2 sm:col-span-4 lg:col-span-6 xl:col-span-4 xl:aspect-[4/5]">
            <AnimatePresence initial={false}>
              <motion.div
                key={item.id}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)" }}
                animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0)" }}
                exit={{ opacity: 1, transition: { duration: dur.large } }}
                transition={{ duration: dur.large, ease: ease.inOut }}
              >
                <motion.div
                  className="absolute inset-0"
                  initial={reduce ? false : { scale: 1.14 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: dur.cine, ease: ease.out }}
                >
                  <Image src={media[item.image].src} alt={item.alt} fill sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 45vw, 90vw" loading="eager" className="object-cover" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="col-span-6 flex flex-col justify-end sm:col-span-2 lg:col-span-6 xl:col-span-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: dur.ui, ease: ease.out }}
              >
                <p className="text-[1.05rem] leading-[1.6] text-paper/90">{item.text}</p>
                <h3 className="mt-8 text-sm text-sand/75">{t.services.coversLabel}</h3>
                <ul className="mt-3 space-y-2 text-[0.95rem] text-sand">
                  {item.covers.map((c, i) => (
                    <motion.li
                      key={c}
                      initial={{ opacity: 0, x: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.12 + i * 0.06, duration: dur.ui }}
                    >
                      {c}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
