"use client";

import { motion, useReducedMotion, useTransform } from "motion/react";
import { useRef } from "react";
import type { Dictionary } from "@/i18n/en";
import { useSceneChapter } from "@/lib/use-scene-chapter";
import { useScrollTo } from "@/components/providers/SmoothScroll";
import { dur, ease } from "@/lib/motion";

/*
  Transparent 3D window, 220vh tall. The viewport sticks while the camera
  orbits the model; the statement hands over to a second line of copy.
*/
export function Hero({ t }: { t: Dictionary }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useSceneChapter(ref, "hero");
  const reduce = useReducedMotion();
  const scrollTo = useScrollTo();

  const leadOpacity = useTransform(progress, [0, 0.38], [1, 0]);
  const leadY = useTransform(progress, [0, 0.38], ["0vh", "-6vh"]);
  const followOpacity = useTransform(progress, [0.46, 0.66, 0.92, 1], [0, 1, 1, 0.2]);
  const followY = useTransform(progress, [0.46, 0.7], ["4vh", "0vh"]);
  const indicator = useTransform(progress, [0, 1], [0, 1]);

  const rise = (i: number) => ({
    initial: reduce ? { opacity: 0 } : { y: "105%" },
    animate: reduce ? { opacity: 1 } : { y: "0%" },
    transition: { delay: 0.35 + i * 0.12, duration: dur.cine, ease: ease.out },
  });

  return (
    <section id="top" ref={ref} tabIndex={-1} className="relative z-10 h-[220vh] outline-none" aria-labelledby="hero-title">
      <div className="sticky top-0 flex h-svh flex-col justify-end overflow-hidden pb-[9vh]">
        <motion.div className="shell relative" style={{ opacity: leadOpacity, y: leadY }}>
          <h1 id="hero-title" className="max-w-[min(100%,64rem)]">
            {/* The mask hides the word until it rises; extra room below (cancelled by the
                negative margin) keeps the Q's descending tail from being clipped. */}
            <span className="-mb-[0.2em] block overflow-hidden pb-[0.26em] text-[clamp(5.5rem,21vw,22rem)] leading-none">

              <motion.span
                className="font-display block text-[clamp(5.5rem,21vw,22rem)] font-normal leading-[0.8] text-basalt"
                {...rise(0)}
              >
                {t.hero.word}
              </motion.span>
            </span>
            <span className="mt-[3vh] block ps-[0.4vw]">
              {t.hero.lines.map((line, i) => (
                <span key={line} className="block overflow-hidden">
                  <motion.span
                    className="font-display block text-[clamp(1.9rem,4.1vw,4rem)] leading-[1.05] text-basalt/90"
                    {...rise(i + 1)}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </span>
          </h1>

          <motion.div
            className="mt-[5vh] flex flex-wrap items-center gap-x-8 gap-y-4 ps-[0.4vw]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: dur.large, ease: ease.out }}
          >
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#about");
              }}
              className="group relative inline-flex h-13 items-center overflow-hidden bg-basalt px-7 text-paper"
            >
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-bronze-deep transition-transform duration-[var(--dur-ui)] ease-[var(--ease-out-quint)] group-hover:scale-y-100" />
              <span className="relative">{t.hero.cta}</span>
            </a>
            <a
              href="#approach"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#approach");
              }}
              className="border-b border-basalt/30 pb-1 text-basalt transition-colors duration-[var(--dur-micro)] hover:border-bronze"
            >
              {t.hero.secondary}
            </a>
          </motion.div>
        </motion.div>

        <motion.p
          className="shell pointer-events-none absolute inset-x-0 bottom-[14vh] max-w-[34rem] text-[clamp(1.25rem,2vw,1.75rem)] leading-[1.45] text-basalt"
          style={{ opacity: followOpacity, y: followY }}
        >
          {t.hero.follow}
        </motion.p>

        {/* Scroll indicator: a single louvre line that fills with the hero */}
        <div className="absolute bottom-[9vh] end-[var(--gutter)] hidden flex-col items-center gap-3 md:flex" aria-hidden>
          <span className="text-xs text-olive [writing-mode:vertical-rl]">{t.hero.scroll}</span>
          <span className="relative h-24 w-px overflow-hidden bg-basalt/15">
            <motion.span className="absolute inset-0 origin-top bg-bronze-deep" style={{ scaleY: indicator }} />
          </span>
        </div>
      </div>
    </section>
  );
}
