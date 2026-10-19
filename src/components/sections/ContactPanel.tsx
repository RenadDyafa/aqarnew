"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/en";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { dur, ease } from "@/lib/motion";

const noSubscribe = () => () => {};
const readIntentParam = () => new URLSearchParams(window.location.search).get("intent");

/*
  Routes the visitor by intent first (owner, tenant, corporate, resident,
  developer), as the brand reference asks of the website, then takes the
  enquiry. The chosen intent travels with the form.
*/
export function ContactPanel({ t }: { t: Dictionary }) {
  const c = t.contactPage;
  // Audience pages link here with ?intent=… (e.g. corporate) to preselect the route;
  // read on the client only so the page stays statically rendered.
  const wanted = useSyncExternalStore(noSubscribe, readIntentParam, () => null);
  const [picked, setIntent] = useState<string | null>(null);
  const intent = picked ?? c.intents.find((i) => i.id === wanted)?.id ?? c.intents[0].id;
  const uid = useId();
  const current = c.intents.find((i) => i.id === intent) ?? c.intents[0];

  return (
    <div>
      <fieldset>
        <legend className="text-sm text-olive">{c.intentLabel}</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {c.intents.map((i) => {
            const checked = i.id === intent;
            return (
              <label
                key={i.id}
                className={`relative inline-flex h-11 cursor-pointer items-center px-5 text-[0.95rem] transition-colors duration-[var(--dur-micro)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-bronze ${
                  checked ? "text-paper" : "border border-basalt/20 text-basalt hover:border-basalt/50"
                }`}
              >
                {checked && (
                  <motion.span layoutId={`${uid}-intent`} className="absolute inset-0 bg-basalt" transition={{ duration: dur.ui, ease: ease.out }} />
                )}
                <input type="radio" name="intent" value={i.id} checked={checked} onChange={() => setIntent(i.id)} className="sr-only" />
                <span className="relative">{i.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 min-h-[1.75rem]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={current.id}
            className="font-display text-[clamp(1.4rem,2.2vw,1.9rem)] text-basalt"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: dur.micro + 0.1, ease: ease.out }}
          >
            {current.hint}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-12">
        <EnquiryForm t={t} intent={intent} />
      </div>
    </div>
  );
}
