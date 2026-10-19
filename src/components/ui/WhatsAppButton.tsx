"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/en";
import { site } from "@/content/site";
import { dur, ease } from "@/lib/motion";

/*
  WhatsApp entry point, stacked above the AQAR assistant. The visitor picks
  what the message is about (the four request types the reference folder names
  for the WhatsApp channel) and WhatsApp opens with a ready message listing the
  details the team needs. No number configured, no button.
*/
export function WhatsAppButton({ t }: { t: Dictionary["whatsapp"] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (!site.whatsapp) return null;
  const link = (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

  return (
    <div ref={ref} className="fixed bottom-[5.5rem] end-5 z-[55] flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            id="whatsapp-menu"
            className="mb-3 w-[min(20rem,calc(100vw-2.5rem))] bg-paper text-basalt shadow-[0_20px_50px_-15px_rgb(35_34_36/0.45)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: dur.ui, ease: ease.out }}
          >
            <p className="border-s-2 border-bronze bg-basalt px-5 py-4 text-[0.95rem] leading-relaxed text-paper">{t.greeting}</p>
            <ul className="divide-y divide-basalt/10">
              {t.options.map((o) => (
                <li key={o.label}>
                  <a
                    href={link(o.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 text-[0.95rem] transition-colors duration-[var(--dur-micro)] hover:bg-limestone"
                  >
                    {o.label}
                    <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0 text-bronze-deep rtl:-scale-x-100" aria-hidden>
                      <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="whatsapp-menu"
        aria-label={open ? t.close : t.open}
        // Same square, basalt-and-bronze language as the AQAR assistant launcher below it.
        className="flex h-14 w-14 items-center justify-center bg-bronze text-basalt shadow-[0_10px_30px_-10px_rgb(35_34_36/0.5)] transition-colors duration-[var(--dur-micro)] hover:bg-bronze-deep hover:text-paper"
      >
        {open ? (
          <svg viewBox="0 0 16 16" className="h-5 w-5" aria-hidden>
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        ) : (
          <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden>
            <path d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 7L3 29l6.4-2c2 1.1 4.3 1.7 6.6 1.7 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.4c-2.1 0-4.1-.6-5.9-1.6l-.4-.3-3.8 1.2 1.2-3.7-.3-.4c-1.2-1.8-1.8-3.8-1.8-5.9C5 9.9 9.9 5.1 16 5.1s11 4.8 11 10.7-4.9 10.6-11 10.6zm6-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.8-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.1 1.4 3.3c.2.2 2.3 3.5 5.6 4.9.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
          </svg>
        )}
      </button>
    </div>
  );
}
