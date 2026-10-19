import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConsultBand } from "@/components/sections/ConsultBand";

export async function generateMetadata({ params }: PageProps<"/[lang]/corporate">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const c = getDictionary(lang).corporate;
  return { title: c.metaTitle, description: c.intro, alternates: { languages: { en: "/en/corporate", ar: "/ar/corporate" } } };
}

/*
  For HR and administration teams housing employees. Text comes only from the
  Aqar Dyafa reference folder (corporate housing persona, pillar, campaign and
  sample posts): each concern is answered on its row, then a proposal request.
*/
export default async function CorporatePage({ params }: PageProps<"/[lang]/corporate">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const c = t.corporate;

  return (
    <>
      <main id="main" tabIndex={-1} className="relative z-10 bg-paper outline-none">
        <PageHeader crumbs={[{ href: `/${lang}`, label: t.nav.home }, { label: c.title }]} title={c.title} intro={c.intro} />

        {/* Highlights */}
        <ul className="shell grid grid-cols-2 gap-x-6 gap-y-8 pb-[14vh] md:grid-cols-4">
          {c.highlights.map((h) => (
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
                <p className="text-sm text-olive">{c.challenges.eyebrow}</p>
                <h2 id="challenges-title" className="font-display mt-3 text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.02] text-basalt">
                  {c.challenges.heading}
                </h2>
                <p className="mt-5 max-w-[30rem] text-olive">{c.challenges.intro}</p>
              </div>
              <div className="col-span-12 md:col-span-6">
                <p className="text-sm text-bronze-deep">{c.solution.eyebrow}</p>
                <h2 className="font-display mt-3 text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.02] text-basalt">{c.solution.heading}</h2>
                <p className="mt-5 max-w-[34rem] text-basalt/85">{c.solution.intro}</p>
              </div>
            </div>

            <ol className="mt-[9vh] divide-y divide-basalt/10 border-y border-basalt/10">
              {c.challenges.items.map((p, i) => {
                const s = c.solution.items[i];
                return (
                  <li key={p.title} className="grid grid-cols-12 gap-x-6 gap-y-5 py-8">
                    <div className="col-span-12 md:col-span-6 md:pe-[4vw]">
                      <p className="text-xs text-olive">{p.tag}</p>
                      <h3 className="mt-2 text-[1.15rem] text-basalt/70">{p.title}</h3>
                      {p.text && <p className="mt-1 text-[0.95rem] text-olive">{p.text}</p>}
                    </div>
                    <div className="col-span-12 border-s-2 border-bronze ps-5 md:col-span-6">
                      <h3 className="font-display text-[clamp(1.5rem,2.2vw,2rem)] leading-[1.1] text-basalt">{s.title}</h3>
                      {s.text && <p className="mt-2 text-basalt/85">{s.text}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

      </main>
      <ConsultBand t={t} locale={lang} copy={c.cta} href={`/${lang}/contact?intent=corporate`} />
    </>
  );
}
