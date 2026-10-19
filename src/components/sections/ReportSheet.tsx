"use client";

import { motion, useReducedMotion } from "motion/react";
import { dur, ease } from "@/lib/motion";

/* A mock owner report: the categories every period covers, set as a document's contents page. */
export function ReportSheet({ title, items }: { title: string; items: { title: string; text: string }[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="bg-paper p-[clamp(1.5rem,3.5vw,2.75rem)] text-basalt shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)]">
      <div className="flex items-center justify-between gap-4 border-b border-basalt/15 pb-5">
        <p className="font-display text-[1.6rem]">{title}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/aqar-mark.svg" alt="" className="h-9 w-auto" />
      </div>
      <ol className="mt-2">
        {items.map((it, i) => (
          <motion.li
            key={it.title}
            className="grid grid-cols-[2.25rem_1fr] gap-x-3 border-b border-dashed border-basalt/15 py-4 last:border-b-0"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ delay: i * 0.08, duration: dur.ui, ease: ease.out }}
          >
            <span className="pt-0.5 text-sm tabular-nums text-bronze-deep">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="block text-[1.05rem] font-medium">{it.title}</span>
              <span className="mt-1 block text-[0.95rem] text-olive">{it.text}</span>
            </span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
