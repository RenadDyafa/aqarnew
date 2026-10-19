"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useId, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/en";
import { MARK, MARK_VIEWBOX } from "@/content/mark";
import { dur, ease } from "@/lib/motion";

/*
  Four stages, one drawing. As the reader moves through the stages the
  AQAR mark is set out, built and completed: the plan is surveyed
  (Understand), the base is laid (Manage), the first tower rises (Enhance),
  the second tower completes the asset (Grow).
*/
export function Approach({ t }: { t: Dictionary }) {
  const ref = useRef<HTMLElement>(null);
  const uid = useId().replace(/:/g, "");
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [stage, setStage] = useState(0);
  const stages = t.approach.stages;

  useMotionValueEvent(p, "change", (v) => setStage(Math.min(stages.length - 1, Math.floor(v * stages.length))));

  const [vx, vy, vw, vh] = MARK_VIEWBOX.split(" ").map(Number);
  const bottom = vy + vh;

  const outline = useTransform(p, [0.02, 0.22], [0, 1]);
  const baseFill = useTransform(p, [0.25, 0.42], [0, 1]);
  const finsTop = useTransform(p, [0.5, 0.68], [bottom, vy]);
  const towerTop = useTransform(p, [0.75, 0.94], [bottom, vy]);
  const finsH = useTransform(finsTop, (y) => bottom - y);
  const towerH = useTransform(towerTop, (y) => bottom - y);
  const guide = useTransform(p, [0, 0.2, 0.9, 1], [0, 0.5, 0.5, 0]);

  return (
    <section id="approach" ref={ref} tabIndex={-1} aria-labelledby="approach-title" className="relative z-10 h-[440vh] bg-paper outline-none">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <div className="shell grid w-full grid-cols-12 items-center gap-x-6 gap-y-10">
          <div className="order-2 col-span-12 md:order-1 md:col-span-7">
            <h2 id="approach-title" className="font-display text-[clamp(1.4rem,2vw,2rem)] text-olive">
              {t.approach.heading}
            </h2>

            <ol className="mt-5 flex gap-5 text-sm tabular-nums md:mt-8" aria-hidden>
              {stages.map((s, i) => (
                <li key={s.title} className="flex items-center gap-3">
                  <span className={`transition-colors duration-[var(--dur-ui)] ${i === stage ? "text-basalt" : "text-olive"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {i < stages.length - 1 && <span className={`h-px w-8 transition-colors duration-[var(--dur-ui)] ${i < stage ? "bg-bronze-deep" : "bg-basalt/15"}`} />}
                </li>
              ))}
            </ol>

            <div className="relative mt-[4vh] min-h-[34vh] md:mt-[6vh] md:min-h-[40vh]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: "18%" }}
                  animate={{ opacity: 1, y: "0%" }}
                  exit={{ opacity: 0, y: "-14%" }}
                  transition={{ duration: dur.large, ease: ease.out }}
                >
                  <p className="font-display text-[clamp(3.6rem,15vw,15rem)] leading-[0.82] text-basalt">{stages[stage].title}</p>
                  <p className="mt-6 max-w-[28rem] text-[1.05rem] leading-[1.6] text-olive md:mt-8 md:text-[1.15rem]">{stages[stage].text}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Full list for assistive tech and no-JS readers */}
            <ol className="sr-only">
              {stages.map((s, i) => (
                <li key={s.title}>
                  {i + 1}. {s.title}: {s.text}
                </li>
              ))}
            </ol>
          </div>

          <div className="order-1 col-span-12 flex justify-center md:order-2 md:col-span-5" aria-hidden>
            <svg viewBox={MARK_VIEWBOX} className="h-[24vh] w-auto overflow-visible md:h-[64vh]">
              <defs>
                <linearGradient id={`${uid}-g`} gradientUnits="userSpaceOnUse" x1="0" y1="109" x2="0" y2="400">
                  <stop offset="0" stopColor="#cd9a62" />
                  <stop offset="0.6" stopColor="#c69661" />
                  <stop offset="1" stopColor="#786554" />
                </linearGradient>
                <clipPath id={`${uid}-fins`}>
                  <motion.rect x={vx} width={vw} y={finsTop} height={finsH} />
                </clipPath>
                <clipPath id={`${uid}-tower`}>
                  <motion.rect x={vx} width={vw} y={towerTop} height={towerH} />
                </clipPath>
              </defs>

              {/* Setting-out lines */}
              <motion.g stroke="#858270" strokeWidth="0.6" strokeDasharray="3 5" style={{ opacity: guide }}>
                <line x1={vx - 40} x2={vx + vw + 40} y1={bottom - 4} y2={bottom - 4} />
                <line x1={vx + vw / 2} x2={vx + vw / 2} y1={vy - 20} y2={bottom + 20} />
              </motion.g>

              {MARK.base.map((d) => (
                <g key={d}>
                  <motion.path d={d} fill="none" stroke="#6d6d61" strokeWidth="1.2" style={{ pathLength: outline }} />
                  <motion.path d={d} fill={`url(#${uid}-g)`} style={{ opacity: baseFill }} />
                </g>
              ))}
              <g clipPath={`url(#${uid}-fins)`}>
                {MARK.fins.map((d) => (
                  <path key={d} d={d} fill={`url(#${uid}-g)`} />
                ))}
              </g>
              <g clipPath={`url(#${uid}-tower)`}>
                <path d={MARK.tower} fill={`url(#${uid}-g)`} />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
