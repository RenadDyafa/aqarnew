import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { site } from "@/content/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactPanel } from "@/components/sections/ContactPanel";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return { title: t.contactPage.metaTitle, description: t.contactPage.lede, alternates: { languages: { en: "/en/contact", ar: "/ar/contact" } } };
}

type Channel = { label: string; value: string; href?: string; ltr?: boolean };

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const c = t.contactPage;

  // Only channels filled in src/content/site.ts are shown.
  const channels: Channel[] = [];
  if (site.phone.display) channels.push({ label: c.phone, value: site.phone.display, href: `tel:${site.phone.tel}`, ltr: true });
  if (site.customerService.display) channels.push({ label: c.customerService, value: site.customerService.display, href: `tel:${site.customerService.tel}`, ltr: true });
  if (site.email) channels.push({ label: c.email, value: site.email, href: `mailto:${site.email}`, ltr: true });
  if (site.whatsapp) channels.push({ label: c.whatsapp, value: `+${site.whatsapp}`, href: `https://wa.me/${site.whatsapp}`, ltr: true });
  if (site.address[lang]) channels.push({ label: c.address, value: site.address[lang] });

  return (
    <main id="main" tabIndex={-1} className="relative z-10 min-h-svh bg-paper pb-[16vh] outline-none">
      <PageHeader crumbs={[{ href: `/${lang}`, label: t.nav.home }, { label: c.title }]} title={c.heading} intro={c.lede} />

      <div className="shell grid grid-cols-12 gap-x-6 gap-y-20">
        <section aria-label={t.contact.form.title} className="col-span-12 lg:col-span-7">
          <p className="mb-12 max-w-[38rem] text-basalt/85">{c.intro}</p>
          <ContactPanel t={t} />
        </section>

        <aside className="col-span-12 lg:col-span-4 lg:col-start-9">
          {channels.length > 0 && (
            <section aria-labelledby="talk-title">
              <h2 id="talk-title" className="font-display text-[clamp(1.6rem,2.4vw,2.3rem)] text-basalt">
                {c.channelsTitle}
              </h2>
              <p className="mt-3 text-[0.95rem] text-olive">{c.channelsText}</p>
              <dl className="mt-8 divide-y divide-basalt/10 border-y border-basalt/10">
                {channels.map((ch) => (
                  <div key={ch.label} className="flex items-baseline justify-between gap-4 py-4">
                    <dt className="text-sm text-olive">{ch.label}</dt>
                    <dd className="text-end text-[1.1rem] text-basalt">
                      {ch.href ? (
                        <a href={ch.href} dir={ch.ltr ? "ltr" : undefined} className="tabular-nums hover:text-bronze-deep">
                          {ch.value}
                        </a>
                      ) : (
                        ch.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

        </aside>
      </div>
    </main>
  );
}
