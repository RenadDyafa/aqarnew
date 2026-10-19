"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { Dictionary } from "@/i18n/en";
import { media } from "@/content/media";
import { ScrubText } from "@/components/ui/ScrubText";

/*
  Editorial pause after the 3D hero. The photograph opens like a doorway:
  a narrow vertical slot widening as it scrolls into view.
*/
export function About({ t }: { t: Dictionary }) {
  const figure = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: figure, offset: ["start end", "end start"] });
  const inset = useTransform(scrollYProgress, [0.05, 0.5], [38, 0]);
  const clipPath = useTransform(inset, (v) => `inset(0 ${v}% 0 ${v}%)`);
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="about" tabIndex={-1} className="relative z-10 bg-paper pb-[18vh] pt-[22vh] outline-none" aria-labelledby="about-title">
      <div className="shell grid grid-cols-12 gap-x-6">
        <ScrubText
          id="about-title"
          lines={t.about.heading}
          className="font-display col-span-12 text-[clamp(2.8rem,8.4vw,8.5rem)] leading-[0.98] lg:col-span-11"
        />

        <div className="col-span-12 mt-[12vh] grid grid-cols-12 gap-x-6 gap-y-14">
          <div ref={figure} className="col-span-12 md:col-span-7">
            <motion.div className="relative aspect-[4/5] overflow-hidden bg-sand md:aspect-[5/6]" style={{ clipPath }}>
              <motion.div className="absolute inset-[-8%_0]" style={{ y: imgY }}>
                <Image
                  src={media.riyadhTwinTowers.src}
                  alt={t.about.imageAlt}
                  fill
                  sizes="(min-width: 768px) 58vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
            </motion.div>
          </div>

          <div className="col-span-12 flex flex-col justify-end md:col-span-5 md:ps-[4vw]">
            <p className="max-w-[30rem] text-[1.2rem] leading-[1.65] text-basalt">{t.about.body}</p>
            <p className="mt-6 max-w-[30rem] text-olive">{t.about.focus}</p>
            <dl className="mt-14 grid max-w-[30rem] gap-10">
              {[t.about.owner, t.about.resident].map((b) => (
                <div key={b.title}>
                  <dt className="font-display text-[1.6rem] text-basalt">{b.title}</dt>
                  <dd className="mt-2 text-olive">{b.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
