"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";
import { useRef, useState } from "react";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { site } from "@/content/site";
import { CookieSettingsButton } from "@/components/ui/CookieConsent";
import { useLenis } from "lenis/react";
import { dur, ease } from "@/lib/motion";

/*
  The footer closes the site the way the hero opens it: with architecture.
  One orchestrated entrance (a bronze rule draws, columns follow), then the
  wordmark's bronze fill opens through louvre slats as the page reaches its
  end, the same gesture as the 3D-to-photograph transition.
*/
export function Footer({ t, locale }: { t: Dictionary; locale: Locale }) {
  const f = t.footer;
  const home = `/${locale}`;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
    else window.scrollTo({ top: 0 });
    // Move keyboard focus with the view.
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  // Overshoot past 1 so neighbouring slats overlap and no hairline seam remains when fully open.
  const slat = useTransform(scrollYProgress, [0.45, 1], [0, 1.12]);
  const slatVar = useMotionTemplate`${slat}`;
  const markY = useTransform(scrollYProgress, [0.3, 1], ["18%", "0%"]);

  const links = [
    { href: home, label: t.nav.home },
    { href: `${home}#about`, label: t.nav.about },
    { href: `${home}#services`, label: t.nav.services },
    { href: `${home}#approach`, label: t.nav.approach },
    { href: `${home}#vision`, label: t.nav.vision },
    { href: `${home}#assets`, label: t.nav.assets },
    { href: `${home}/insights`, label: t.nav.insights },
    { href: `${home}/contact`, label: t.nav.contact },
  ];
  const services = [
    { href: `${home}/owners`, label: t.owners.title },
    { href: `${home}/corporate`, label: t.corporate.title },
    ...t.services.items.map((s) => ({ href: `${home}#services`, label: s.title })),
  ];
  const contacts = [
    site.phone.display && { label: t.contactPage.phone, value: site.phone.display, href: `tel:${site.phone.tel}` },
    site.customerService.display && { label: t.contactPage.customerService, value: site.customerService.display, href: `tel:${site.customerService.tel}` },
    site.email && { label: t.contactPage.email, value: site.email, href: `mailto:${site.email}` },
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  const column: Variants = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 18 },
    shown: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.25 + i * 0.08, duration: dur.ui, ease: ease.out } }),
  };
  const enter = { initial: "hidden", whileInView: "shown", viewport: { once: true, margin: "0px 0px -15% 0px" } } as const;

  return (
    <footer ref={ref} className="relative z-10 overflow-hidden bg-basalt pt-20 text-sand">
      {/* Bronze rule drawing across the top edge */}
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px origin-[left] bg-linear-to-r from-bronze via-bronze/60 to-transparent rtl:origin-[right] rtl:bg-linear-to-l"
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: dur.cine, ease: ease.inOut }}
      />

      <div className="shell grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12 md:gap-y-14">
        <motion.div className="col-span-2 md:col-span-12 lg:col-span-3" variants={column} custom={0} {...enter}>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aqar-mark.svg" alt="" className="h-12 w-auto" />
            <div>
              <p className="text-paper">{t.brand.name}</p>
              <p className="text-sm text-sand/75">{f.line}</p>
            </div>
          </div>
          <p className="mt-8 max-w-[26rem] text-[0.95rem] leading-relaxed text-sand/85">{f.about}</p>
          <p className="mt-5 inline-flex items-center gap-2 text-sm text-bronze">
            <span className="h-px w-6 bg-bronze" aria-hidden />
            {f.part}
          </p>
          <QuickCall t={f.quickCall} locale={locale} />
        </motion.div>

        <LinkColumn title={f.quickLinks} id="footer-links" items={links} variants={column} index={1} enter={enter} />
        <LinkColumn title={f.services} id="footer-services" items={services} variants={column} index={2} enter={enter} wide />


        {contacts.length > 0 && (
          <motion.div className="order-4 col-span-2 md:order-none md:col-span-3 lg:col-span-2" variants={column} custom={4} {...enter}>
            <h2 className="text-sm text-paper">{f.contactTitle}</h2>
            <dl className="mt-5 space-y-4 text-[0.95rem]">
              {contacts.map((c) => (
                <div key={c.label}>
                  <dt className="text-sm text-sand/75">{c.label}</dt>
                  <dd className="mt-0.5 flex items-center gap-3">
                    <a href={c.href} dir="ltr" className="tabular-nums text-paper transition-colors duration-[var(--dur-micro)] hover:text-bronze">
                      {c.value}
                    </a>
                    <CopyButton value={c.value} label={f.copy} done={f.copied} />
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </div>

      {/* Sign-off wordmark: outline always, bronze fill opening through louvres */}
      <div className="relative mt-20 select-none" aria-hidden>
        <motion.div className="shell relative" style={reduce ? undefined : { y: markY }}>
          <p className={wordmarkClass(locale, "text-transparent [-webkit-text-stroke:1px_rgb(205_154_98/0.35)]")}>{f.wordmark}</p>
          <motion.p
            className={wordmarkClass(locale, "louvre-mask absolute inset-x-[var(--gutter)] top-0 bg-linear-to-b from-bronze to-bronze-deep bg-clip-text text-transparent")}
            style={{ ["--slat" as string]: reduce ? 1.12 : slatVar, ["--pitch" as string]: "clamp(10px,1.4vw,22px)" }}
          >
            {f.wordmark}
          </motion.p>
        </motion.div>
      </div>

      <div className="relative border-t border-sand/15 bg-basalt">
        <div className="shell flex flex-col gap-4 py-6 text-sm text-sand/75 md:flex-row md:items-center md:justify-between">
          <p>© {f.rights}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={`${home}/cookies`} className="hover:text-paper">
              {t.cookies.policy}
            </Link>
            <CookieSettingsButton label={t.cookies.settings} />
            <span>{f.credit}</span>
            <button
              type="button"
              onClick={toTop}
              className="group inline-flex items-center gap-2 border border-sand/25 px-3 py-1.5 text-sand transition-colors duration-[var(--dur-micro)] hover:border-bronze hover:text-paper"
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3 transition-transform duration-[var(--dur-micro)] group-hover:-translate-y-0.5" aria-hidden>
                <path d="M6 10V2M2.5 5.5L6 2l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {f.backToTop}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function wordmarkClass(locale: Locale, extra: string) {
  const size =
    locale === "ar"
      ? "font-[family-name:var(--font-kufi)] text-[clamp(4rem,20.6vw,21rem)] leading-[1.15]"
      : "font-[family-name:var(--font-serif)] text-[clamp(3.6rem,14.9vw,16rem)] leading-[0.9] tracking-[-0.02em]";
  return `whitespace-nowrap ${size} ${extra}`;
}

function LinkColumn({
  title,
  id,
  items,
  variants,
  index,
  enter,
  wide,
}: {
  title: string;
  id: string;
  items: { href: string; label: string }[];
  variants: Variants;
  index: number;
  enter: Record<string, unknown>;
  wide?: boolean;
}) {
  return (
    <motion.nav aria-labelledby={id} className={wide ? "order-3 col-span-2 md:order-none md:col-span-3 lg:col-span-3" : "order-1 col-span-1 md:order-none md:col-span-3 lg:col-span-2"} variants={variants} custom={index} {...enter}>
      <h2 id={id} className="text-sm text-paper">
        {title}
      </h2>
      <ul className="mt-5 space-y-2 text-[0.95rem]">
        {items.map((l) => (
          <li key={`${l.href}-${l.label}`}>
            <Link href={l.href} className="group inline-flex items-center transition-colors duration-[var(--dur-micro)] hover:text-paper">
              <span className="h-px w-0 bg-bronze transition-[width,margin] duration-[var(--dur-micro)] ease-[var(--ease-out-quint)] group-hover:me-2 group-hover:w-3" aria-hidden />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}

// A phone number is all the team needs to call back; it goes through the same enquiry endpoint.
function QuickCall({ t, locale }: { t: Dictionary["footer"]["quickCall"]; locale: Locale }) {
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "invalid">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 7) return setState("invalid");
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, intent: "callback", subject: "Quick call request", locale }),
      });
      setState(res.ok ? "sent" : "error");
      if (res.ok) setPhone("");
    } catch {
      setState("error");
    }
  };

  const note = state === "sent" ? t.sent : state === "error" ? t.error : state === "invalid" ? t.invalid : "";

  return (
    <form onSubmit={submit} className="mt-10 max-w-[28rem]" noValidate>
      <label htmlFor="quick-call" className="block text-[1.05rem] font-medium text-paper">
        {t.title}
      </label>
      <div className="mt-4 flex items-center gap-2 bg-paper p-1.5">
        <input
          id="quick-call"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (state !== "sending") setState("idle");
          }}
          placeholder={t.placeholder}
          aria-invalid={state === "invalid"}
          aria-describedby="quick-call-note"
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-basalt placeholder:text-basalt/45 focus:outline-none rtl:text-right rtl:placeholder:text-right"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="shrink-0 bg-bronze px-6 py-2.5 font-medium text-basalt transition-colors duration-[var(--dur-micro)] hover:bg-bronze-deep hover:text-paper disabled:opacity-60"
        >
          {state === "sending" ? t.sending : t.send}
        </button>
      </div>
      <p id="quick-call-note" aria-live="polite" className={`mt-2 min-h-5 text-sm ${state === "sent" ? "text-bronze" : "text-sand/85"}`}>
        {note}
      </p>
    </form>
  );
}

function CopyButton({ value, label, done }: { value: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        let ok = false;
        try {
          await navigator.clipboard.writeText(value);
          ok = true;
        } catch {
          // Fallback where the async clipboard API is unavailable or blocked.
          const area = document.createElement("textarea");
          area.value = value;
          area.setAttribute("readonly", "");
          area.style.position = "fixed";
          area.style.opacity = "0";
          document.body.appendChild(area);
          area.select();
          ok = document.execCommand("copy");
          area.remove();
        }
        if (!ok) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      aria-label={`${label} ${value}`}
      className="text-xs text-sand/60 underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:text-bronze hover:underline"
    >
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}
