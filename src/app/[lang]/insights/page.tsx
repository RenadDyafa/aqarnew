import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { articles } from "@/content/insights";
import { media } from "@/content/media";
import { ConsultBand } from "@/components/sections/ConsultBand";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArticleMeta } from "@/components/ui/ArticleMeta";

export async function generateMetadata({ params }: PageProps<"/[lang]/insights">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.insights.metaTitle,
    description: t.insights.intro,
    alternates: { languages: { en: "/en/insights", ar: "/ar/insights" } },
  };
}

/*
  Editorial index, not a card grid: the latest article leads at full width,
  the rest follow as rows of image, title and excerpt.
*/
export default async function Insights({ params }: PageProps<"/[lang]/insights">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const [lead, ...rest] = [...articles].sort((a, b) => b.date.localeCompare(a.date));
  const href = (slug: string) => `/${lang}/insights/${slug}`;

  return (
    <>
      <main id="main" tabIndex={-1} className="relative z-10 min-h-svh bg-paper pb-[16vh] outline-none">
        <PageHeader crumbs={[{ href: `/${lang}`, label: t.nav.home }, { label: t.insights.title }]} title={t.insights.title} intro={t.insights.intro} />

        <div className="shell">
          <article className="group grid grid-cols-12 gap-x-6 gap-y-8">
            <Link href={href(lead.slug)} className="relative col-span-12 block aspect-[16/10] overflow-hidden bg-sand lg:col-span-8" tabIndex={-1} aria-hidden>
              <Image
                src={media[lead.image].src}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover transition-transform duration-[var(--dur-cine)] ease-[var(--ease-out-quint)] group-hover:scale-[1.035]"
              />
            </Link>
            <div className="col-span-12 flex flex-col justify-end lg:col-span-4">
              <ArticleMeta a={lead} t={t} locale={lang} />
              <h2 className="font-display mt-5 text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.02] text-basalt">
                <Link
                  href={href(lead.slug)}
                  className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-no-repeat bg-[position:0_100%] transition-[background-size] duration-[var(--dur-ui)] group-hover:bg-[length:100%_1px]"
                >
                  {lead.content[lang].title}
                </Link>
              </h2>
              <p className="mt-6 text-olive">{lead.content[lang].excerpt}</p>
            </div>
          </article>

          <ul className="mt-[12vh] space-y-[7vh]">
            {rest.map((a) => (
              <li key={a.slug}>
                <article className="group grid grid-cols-12 items-start gap-x-6 gap-y-5">
                  <Link
                    href={href(a.slug)}
                    className="relative col-span-12 block aspect-[4/3] overflow-hidden bg-sand sm:col-span-4 lg:col-span-3"
                    tabIndex={-1}
                    aria-hidden
                  >
                    <Image
                      src={media[a.image].src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
                      className="object-cover transition-transform duration-[var(--dur-cine)] ease-[var(--ease-out-quint)] group-hover:scale-[1.04]"
                    />
                  </Link>
                  <div className="col-span-12 sm:col-span-8 lg:col-span-6 lg:col-start-5">
                    <ArticleMeta a={a} t={t} locale={lang} />
                    <h2 className="font-display mt-4 text-[clamp(1.7rem,2.6vw,2.5rem)] leading-[1.05] text-basalt">
                      <Link
                        href={href(a.slug)}
                        className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-no-repeat bg-[position:0_100%] transition-[background-size] duration-[var(--dur-ui)] group-hover:bg-[length:100%_1px]"
                      >
                        {a.content[lang].title}
                      </Link>
                    </h2>
                    <p className="mt-4 max-w-[36rem] text-olive">{a.content[lang].excerpt}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <ConsultBand t={t} locale={lang} />
    </>
  );
}
