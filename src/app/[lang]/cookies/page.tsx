import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { ConsultBand } from "@/components/sections/ConsultBand";
import { PageHeader } from "@/components/ui/PageHeader";
import { CookieSettingsButton } from "@/components/ui/CookieConsent";

export async function generateMetadata({ params }: PageProps<"/[lang]/cookies">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return {
    title: getDictionary(lang).cookiePolicy.metaTitle,
    robots: { index: false },
  };
}

export default async function CookiesPage({ params }: PageProps<"/[lang]/cookies">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <main id="main" tabIndex={-1} className="relative z-10 min-h-svh bg-paper pb-[16vh] outline-none">
        <PageHeader crumbs={[{ href: `/${lang}`, label: t.nav.home }, { label: t.cookiePolicy.title }]} title={t.cookiePolicy.title} />
        <div className="shell grid grid-cols-12 gap-x-6">
          <div className="col-span-12 space-y-10 md:col-span-9 lg:col-span-7">
            {t.cookiePolicy.sections.map((s) => (
              <section key={s.h}>
                <h2 className="font-display text-[clamp(1.5rem,2.2vw,2rem)] text-basalt">{s.h}</h2>
                <p className="mt-3 text-[1.075rem] leading-[1.75] text-basalt/85">{s.p}</p>
              </section>
            ))}
            <p className="pt-4 text-basalt underline decoration-bronze underline-offset-4">
              <CookieSettingsButton label={t.cookies.settings} />
            </p>
          </div>
        </div>
      </main>
      <ConsultBand t={t} locale={lang} />
    </>
  );
}
