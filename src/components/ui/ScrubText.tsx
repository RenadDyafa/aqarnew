"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

/**
 * A heading whose words darken as the reader scrolls through it.
 * Text is always present in the DOM at full contrast for assistive tech;
 * only the painted opacity is scrubbed.
 */
export function ScrubText({
  lines,
  className,
  as: Tag = "h2",
  id,
}: {
  lines: string[];
  className?: string;
  as?: "h2" | "h3" | "p";
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "start 30%"] });
  const words = lines.flatMap((line, li) => line.split(" ").map((w, wi) => ({ w, li, key: `${li}-${wi}` })));
  const total = words.length;

  return (
    <Tag ref={ref as never} id={id} className={className}>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {words
            .filter((x) => x.li === li)
            .map((x) => {
              const i = words.indexOf(x);
              return <Word key={x.key} progress={scrollYProgress} start={i / total} end={(i + 1.6) / total} text={x.w} />;
            })}
        </span>
      ))}
    </Tag>
  );
}

function Word({ progress, start, end, text }: { progress: MotionValue<number>; start: number; end: number; text: string }) {
  const opacity = useTransform(progress, [start, Math.min(1, end)], [0.5, 1]);
  return (
    <>
      <motion.span style={{ opacity }} className="inline-block">
        {text}
      </motion.span>{" "}
    </>
  );
}
