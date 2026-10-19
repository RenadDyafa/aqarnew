"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { dur, ease } from "@/lib/motion";

/** Article lead image: opens from a centred band on load, then drifts slightly with scroll. */
export function RevealImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <motion.div
      ref={ref}
      className="relative aspect-[16/9] overflow-hidden bg-sand md:aspect-[21/9]"
      initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 18% 0 18%)" }}
      animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0%)" }}
      transition={{ duration: dur.cine, ease: ease.inOut, delay: 0.15 }}
    >
      <motion.div className="absolute inset-[-6%_0]" style={reduce ? undefined : { y }}>
        <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" />
      </motion.div>
    </motion.div>
  );
}
