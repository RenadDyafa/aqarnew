"use client";

import { motion, useTransform } from "motion/react";
import { useRef } from "react";
import type { Dictionary } from "@/i18n/en";
import { useSceneChapter } from "@/lib/use-scene-chapter";
import { EnquiryDialog, useEnquiryDialog } from "@/components/ui/EnquiryDialog";

/*
  Closing window back onto the model, now in evening light. The page that
  opened on the building ends on it.
*/
export function Contact({ t }: { t: Dictionary }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useSceneChapter(ref, "contact");
  const dialog = useEnquiryDialog();
  const opacity = useTransform(progress, [0.05, 0.35], [0, 1]);
  const y = useTransform(progress, [0.05, 0.4], ["6vh", "0vh"]);

  return (
    <section id="contact" ref={ref} tabIndex={-1} aria-labelledby="contact-title" className="relative z-10 h-[170vh] outline-none">
      <div className="sticky top-0 flex h-svh items-end pb-[8vh] md:items-center md:pb-0">
        <motion.div className="shell w-full" style={{ opacity, y }}>
          <h2 id="contact-title" className="font-display max-w-[14ch] text-[clamp(2.6rem,8vw,8.4rem)] leading-[0.96] text-basalt">
            {t.contact.heading.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h2>
          <p className="mt-6 max-w-[30rem] text-[1.05rem] text-basalt/80 md:mt-10 md:text-[1.15rem]">{t.contact.text}</p>
          <button
            type="button"
            onClick={dialog.open}
            className="group relative mt-8 inline-flex h-14 items-center overflow-hidden bg-basalt px-8 text-paper"
          >
            <span className="absolute inset-0 origin-bottom scale-y-0 bg-bronze-deep transition-transform duration-[var(--dur-ui)] ease-[var(--ease-out-quint)] group-hover:scale-y-100" />
            <span className="relative">{t.contact.cta}</span>
          </button>
        </motion.div>
      </div>
      <EnquiryDialog t={t} control={dialog} />
    </section>
  );
}
