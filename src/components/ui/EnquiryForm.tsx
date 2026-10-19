"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Dictionary } from "@/i18n/en";
import { dur, ease } from "@/lib/motion";

type Status = "idle" | "sending" | "sent" | "error" | "invalid";

/**
 * The enquiry form, shared by the home-page dialog and the Contact page.
 * `intent` (owner, corporate, resident, other) is sent with the message so it
 * can be routed; owners also get property fields.
 */
export function EnquiryForm({ t, intent = "owner", autoFocus = false, onSent }: { t: Dictionary; intent?: string; autoFocus?: boolean; onSent?: () => void }) {
  const f = t.contact.form;
  const [status, setStatus] = useState<Status>("idle");
  const owner = intent === "owner";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const email = data.email?.trim();
    const phone = data.phone?.trim();
    const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!data.name?.trim() || (!email && !phone) || !emailOk) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, intent, locale: document.documentElement.lang }),
      });
      setStatus(res.ok ? "sent" : "error");
      if (res.ok) {
        form.reset();
        onSent?.();
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent")
    return (
      <p role="status" className="text-[1.15rem]">
        {f.sent}
      </p>
    );

  const field = "mt-2 block w-full border-0 border-b border-basalt/25 bg-transparent px-0 py-2 text-basalt focus:border-bronze focus:outline-none focus:ring-0";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 sm:grid-cols-2">
      <label className="text-sm text-olive">
        {f.name}
        <input name="name" autoComplete="name" required autoFocus={autoFocus} className={field} />
      </label>
      <label className="text-sm text-olive">
        {f.email}
        <input name="email" type="email" autoComplete="email" dir="ltr" className={`${field} rtl:text-end`} />
      </label>
      <label className="text-sm text-olive">
        {f.phone}
        <input name="phone" type="tel" autoComplete="tel" inputMode="tel" dir="ltr" className={`${field} rtl:text-end`} />
      </label>
      <label className="text-sm text-olive">
        {f.subject}
        <input name="subject" className={field} />
      </label>

      <AnimatePresence initial={false}>
        {owner && (
          <motion.div
            key="property"
            className="grid gap-6 overflow-hidden sm:col-span-2 sm:grid-cols-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: dur.ui, ease: ease.out }}
          >
            <label className="text-sm text-olive">
              {f.propertyType}
              <select name="propertyType" className={field} defaultValue={f.propertyTypes[0]}>
                {f.propertyTypes.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-olive">
              {f.location}
              <input name="location" autoComplete="address-level2" className={field} />
            </label>
            <label className="text-sm text-olive">
              {f.units}
              <input name="units" inputMode="numeric" className={field} />
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      <label className="text-sm text-olive sm:col-span-2">
        {f.message}
        <textarea name="message" rows={4} className={`${field} resize-none`} />
      </label>

      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-13 items-center bg-basalt px-7 text-paper transition-colors duration-[var(--dur-micro)] hover:bg-bronze-deep disabled:opacity-60"
        >
          {status === "sending" ? f.sending : f.submit}
        </button>
        <p role="alert" className="text-sm text-[#8a3b2a]">
          {status === "invalid" && f.required}
          {status === "error" && f.error}
        </p>
      </div>
    </form>
  );
}
