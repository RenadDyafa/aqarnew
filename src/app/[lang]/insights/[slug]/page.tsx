import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { articles, getArticle } from "@/content/insights";
import { media } from "@/content/media";
import { ConsultBand } from "@/components/sections/ConsultBand";
import { ArticleMeta } from "@/components/ui/ArticleMeta";
import { RevealImage } from "@/components/ui/RevealImage";

// Every article is prerendered below; an unknown slug renders on request only to 404.
export const instant = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/insights/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const a = getArticle(slug);
  if (!hasLocale(lang) || !a) return {};
  const c = a.content[lang];
  return {
    title: `${c.title} | ${getDictionary(lang).brand.name}`,
    description: c.excerpt,
    alternates: {
      languages: {
        en: `/en/insights/${slug}`,
        ar: `/ar/insights/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      publishedTime: a.date,
      title: c.title,
      description: c.excerpt,
      images: [`${media[a.image].src}?w=1200&h=630&fit=crop`],
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/[lang]/insights/[slug]">) {
  const { lang, slug } = await params;
  const a = getArticle(slug);
  if (!hasLocale(lang) || !a) notFound();
  const t = getDictionary(lang);
  const c = a.content[lang];
  const related = articles.filter((x) => x.slug !== slug).slice(0, 2);

  return (
    <>
      <main id="main" tabIndex={-1} className="relative z-10 min-h-svh bg-paper pb-[14vh] outline-none">
        <article>
          <header className="shell grid grid-cols-12 gap-x-6 pt-[clamp(7rem,18vh,11rem)]">
            <div className="col-span-12 lg:col-span-10 lg:col-start-2">
              <Link href={`/${lang}/insights`} className="text-sm text-olive hover:text-basalt">
                {t.insights.back}
              </Link>
              <h1 className="font-display mt-8 text-[clamp(2.6rem,6.4vw,6.2rem)] leading-[0.98] text-basalt">{c.title}</h1>
              <ArticleMeta a={a} t={t} locale={lang} className="mt-8" />
            </div>
          </header>

          <div className="shell mt-[7vh]">
            <RevealImage src={media[a.image].src} alt={a.alt[lang]} />
          </div>

          <div className="shell mt-[9vh] grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-10 md:col-start-2 lg:col-span-7 lg:col-start-3">
              <p className="lede text-[clamp(1.5rem,2.4vw,2.1rem)] leading-[1.3] text-basalt">{c.excerpt}</p>
              <div className="mt-12 space-y-6 text-[1.125rem] leading-[1.75] text-basalt/90">
                {c.body.map((b, i) =>
                  b.type === "h2" ? (
                    <h2 key={i} className="font-display pt-6 text-[clamp(1.6rem,2.2vw,2rem)] leading-[1.15] text-basalt">
                      {b.text}
                    </h2>
                  ) : b.type === "ul" ? (
                    <ul key={i} className="space-y-3 border-s border-bronze/50 ps-6">
                      {b.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i}>{b.text}</p>
                  ),
                )}
              </div>
            </div>
          </div>
        </article>

        <aside aria-labelledby="related-title" className="shell mt-[16vh]">
          <h2 id="related-title" className="font-display text-[clamp(1.4rem,2vw,2rem)] text-olive">
            {t.insights.related}
          </h2>
          <ul className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/${lang}/insights/${r.slug}`} className="group block">
                  <span className="relative block aspect-[16/10] overflow-hidden bg-sand">
                    <Image
                      src={media[r.image].src}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[var(--dur-cine)] ease-[var(--ease-out-quint)] group-hover:scale-[1.035]"
                    />
                  </span>
                  <ArticleMeta a={r} t={t} locale={lang} className="mt-6" />
                  <span className="font-display mt-3 block text-[clamp(1.6rem,2.4vw,2.3rem)] leading-[1.05] text-basalt">{r.content[lang].title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </main>
      <ConsultBand t={t} locale={lang} />
    </>
  );
}
