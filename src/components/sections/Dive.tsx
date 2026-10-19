"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValueEvent, useTransform } from "motion/react";
import { useRef } from "react";
import type { Dictionary } from "@/i18n/en";
import { media } from "@/content/media";
import { scene } from "@/lib/scene-store";
import { useSceneChapter } from "@/lib/use-scene-chapter";
import { AssetCaption } from "./AssetCaption";

/*
  Signature transition. The camera flies to the louvred tower until its
  facade fills the screen; the louvres then open, slat by slat, onto the
  photograph of the first managed asset, whose details settle in.
  The next section begins on the same frame, so the hand-off is seamless.
*/
export function Dive({ t }: { t: Dictionary }) {
  const ref = useRef<HTMLElement>(null);
  const mask = useRef<HTMLDivElement>(null);
  const progress = useSceneChapter(ref, "dive");

  const slat = useTransform(progress, [0.6, 0.86], [0, 1]);
  const scale = useTransform(progress, [0.6, 1], [1.08, 1]);
  const captionOpacity = useTransform(progress, [0.08, 0.2, 0.42, 0.52], [0, 1, 1, 0]);
  const infoOpacity = useTransform(progress, [0.84, 0.95], [0, 1]);
  const infoY = useTransform(progress, [0.84, 0.98], [28, 0]);
  const slatVar = useMotionTemplate`${slat}`;

  // The louvre pitch on screen depends on viewport aspect; the 3D rig
  // computes it, the mask follows so CSS slats line up with real ones.
  useMotionValueEvent(progress, "change", () => {
    mask.current?.style.setProperty("--pitch", `${scene.pitchVh}vh`);
  });

  const first = t.assets.items[0];

  return (
    <section ref={ref} aria-label={t.dive.caption} className="relative z-10 h-[340vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.p
          className="shell absolute inset-x-0 top-[16vh] font-display text-[clamp(1.8rem,3.6vw,3.4rem)] text-basalt"
          style={{ opacity: captionOpacity }}
        >
          {t.dive.caption}
        </motion.p>

        <motion.div ref={mask} className="louvre-mask absolute inset-0" style={{ ["--slat" as string]: slatVar }}>
          <motion.div className="absolute inset-0" style={{ scale }}>
            <Image src={media[first.image].src} alt={first.alt} fill sizes="100vw" className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-linear-to-t from-basalt/65 via-basalt/10 to-transparent" />
        </motion.div>

        <motion.div className="absolute inset-x-0 bottom-0" style={{ opacity: infoOpacity, y: infoY }}>
          <AssetCaption t={t} index={0} />
        </motion.div>
      </div>
    </section>
  );
}
