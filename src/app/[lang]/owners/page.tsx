import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConsultBand } from "@/components/sections/ConsultBand";
import { ReportSheet } from "@/components/sections/ReportSheet";

export async function generateMetadata({ params }: PageProps<"/[lang]/owners">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const o = getDictionary(lang).owners;
  return { title: o.metaTitle, description: o.intro, alternates: { languages: { en: "/en/owners", ar: "/ar/owners" } } };
}

/*
  For owners and investors. Challenges and what changes are set side by side,
  row for row, so each problem is answered where it is stated.
*/
export default async function OwnersPage({ params }: PageProps<"/[lang]/owners">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const o = t.owners;
  const contact = `/${lang}/contact`;

  return (
    <>
      <main id="main" tabIndex={-1} className="relative z-10 bg-paper outline-none">
        <PageHeader crumbs={[{ href: `/${lang}`, label: t.nav.home }, { label: o.title }]} title={o.title} intro={o.intro} />

        {/* Highlights */}
        <ul className="shell grid grid-cols-2 gap-x-6 gap-y-8 pb-[14vh] md:grid-cols-4">
          {o.highlights.map((h) => (
            <li key={h} className="border-t border-bronze/70 pt-4 font-display text-[clamp(1.4rem,2vw,1.9rem)] leading-[1.15] text-basalt">
              {h}
            </li>
          ))}
        </ul>

        {/* Challenges → what changes */}
        <section aria-labelledby="challenges-title" className="bg-limestone py-[16vh]">
          <div className="shell">
            <div className="grid grid-cols-12 gap-x-6 gap-y-10">
              <div className="col-span-12 md:col-span-6">
                <p className="text-sm text-olive">{o.challenges.eyebrow}</p>
                <h2 id="challenges-title" className="font-display mt-3 text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.02] text-basalt">
                  {o.challenges.heading}
                </h2>
                <p className="mt-5 max-w-[30rem] text-olive">{o.challenges.intro}</p>
              </div>
              <div className="col-span-12 md:col-span-6">
                <p className="text-sm text-bronze-deep">{o.solution.eyebrow}</p>
                <h2 className="font-display mt-3 text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.02] text-basalt">{o.solution.heading}</h2>
                <p className="mt-5 max-w-[34rem] text-basalt/85">{o.solution.intro}</p>
              </div>
            </div>

            <ol className="mt-[9vh] divide-y divide-basalt/10 border-y border-basalt/10">
              {o.challenges.items.map((c, i) => {
                const s = o.solution.items[i];
                return (
                  <li key={c.tag} className="grid grid-cols-12 gap-x-6 gap-y-5 py-8">
                    <div className="col-span-12 md:col-span-6 md:pe-[4vw]">
                      <p className="text-xs text-olive">{c.tag}</p>
                      <h3 className="mt-2 text-[1.15rem] text-basalt/70">{c.title}</h3>
                      <p className="mt-1 text-[0.95rem] text-olive">{c.text}</p>
                    </div>
                    <div className="col-span-12 border-s-2 border-bronze ps-5 md:col-span-6">
                      <h3 className="font-display text-[clamp(1.5rem,2.2vw,2rem)] leading-[1.1] text-basalt">{s.title}</h3>
                      <p className="mt-2 text-basalt/85">{s.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Reports */}
        <section aria-labelledby="reports-title" className="bg-basalt py-[16vh] text-paper">
          <div className="shell grid grid-cols-12 items-center gap-x-6 gap-y-14">
            <div className="col-span-12 lg:col-span-5">
              <p className="text-sm text-sand">{o.reports.eyebrow}</p>
              <h2 id="reports-title" className="font-display mt-3 text-[clamp(2.2rem,4vw,3.8rem)] leading-[1.02]">
                {o.reports.heading}
              </h2>
              <p className="mt-6 max-w-[28rem] text-sand">{o.reports.intro}</p>
            </div>
            <div className="col-span-12 lg:col-span-6 lg:col-start-7">
              <ReportSheet title={o.reports.sheetTitle} items={o.reports.items} />
            </div>
          </div>
        </section>

        {/* Not only brokers */}
        <section aria-labelledby="broker-title" className="py-[16vh]">
          <div className="shell grid grid-cols-12 gap-x-6 gap-y-10">
            <p className="col-span-12 text-sm text-olive">{o.broker.eyebrow}</p>
            <h2 id="broker-title" className="font-display col-span-12 text-[clamp(2.8rem,7vw,6.6rem)] leading-[0.98] text-basalt lg:col-span-7">
              {o.broker.question}
            </h2>
            <div className="col-span-12 lg:col-span-5 lg:pt-4">
              <p className="text-[1.15rem] leading-[1.7] text-basalt">{o.broker.answer}</p>
              <p className="mt-8 text-olive">{o.broker.ctaText}</p>
              <Link href={contact} className="group relative mt-6 inline-flex h-14 items-center overflow-hidden bg-basalt px-8 text-paper">
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-bronze-deep transition-transform duration-[var(--dur-ui)] ease-[var(--ease-out-quint)] group-hover:scale-y-100" />
                <span className="relative">{o.broker.cta}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Diagnosis */}
        <section aria-labelledby="diagnosis-title" className="border-t border-basalt/10 pb-[18vh] pt-[14vh]">
          <div className="shell">
            <p className="text-sm text-olive">{o.diagnosis.eyebrow}</p>
            <h2 id="diagnosis-title" className="font-display mt-3 text-[clamp(2.2rem,4.4vw,4rem)] leading-[1.02] text-basalt">
              {o.diagnosis.heading}
            </h2>
            <p className="mt-6 max-w-[42rem] text-[1.05rem] leading-[1.7] text-basalt/85">{o.diagnosis.intro}</p>
            <ol className="mt-[8vh] grid gap-x-6 gap-y-10 md:grid-cols-3">
              {o.diagnosis.steps.map((s, i) => (
                <li key={s.title} className="relative border-t border-basalt/20 pt-6">
                  <span className="absolute -top-px start-0 h-px w-16 bg-bronze" aria-hidden />
                  <p className="text-sm tabular-nums text-bronze-deep">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-display mt-3 text-[clamp(1.8rem,2.6vw,2.4rem)] text-basalt">{s.title}</h3>
                  <p className="mt-3 max-w-[22rem] text-olive">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <ConsultBand t={t} locale={lang} />
    </>
  );
}
