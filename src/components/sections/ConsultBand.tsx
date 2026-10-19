import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";

type Copy = Dictionary["consult"];

/**
 * Closing invitation on inner pages: a basalt band that leads to the Contact page.
 * Audience pages pass their own copy and an intent-specific link.
 */
export function ConsultBand({ t, locale, copy, href }: { t: Dictionary; locale: Locale; copy?: Copy; href?: string }) {
  const c = copy ?? t.consult;
  return (
    <section aria-labelledby="consult-title" className="relative z-10 bg-basalt-2 py-[14vh] text-paper">
      <div className="shell grid grid-cols-12 items-end gap-x-6 gap-y-10">
        <div className="col-span-12 lg:col-span-8">
          <p className="text-sand">{c.eyebrow}</p>
          <h2 id="consult-title" className="font-display mt-5 text-[clamp(2.4rem,6vw,5.6rem)] leading-[0.98]">
            {c.heading}
          </h2>
          <p className="mt-8 max-w-[34rem] text-[1.05rem] text-sand">{c.text}</p>
        </div>
        <div className="col-span-12 lg:col-span-4 lg:justify-self-end">
          <Link
            href={href ?? `/${locale}/contact`}
            className="group relative inline-flex h-14 items-center overflow-hidden bg-bronze px-8 text-basalt"
          >
            <span className="absolute inset-0 origin-bottom scale-y-0 bg-sand transition-transform duration-[var(--dur-ui)] ease-[var(--ease-out-quint)] group-hover:scale-y-100" />
            <span className="relative">{c.cta}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
