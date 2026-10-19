import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { hasLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { getCurrentUser } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
import { site } from "@/content/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/account">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).auth.metaAccount, robots: { index: false } };
}

export default async function AccountPage({ params, searchParams }: PageProps<"/[lang]/account">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <main id="main" tabIndex={-1} className="relative z-10 min-h-svh bg-paper pb-[16vh] pt-[clamp(7rem,18vh,11rem)] outline-none">
      {/* The account reads the session cookie, so it renders per request inside Suspense. */}
      <Suspense fallback={<div className="shell h-[40vh]" aria-busy />}>
        <Account t={t} locale={lang} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Account({ t, locale, searchParams }: { t: Dictionary; locale: Locale; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  const welcomeNew = (await searchParams).welcome === "1";
  const a = t.auth.account;
  const next = a.next[user.account_type];
  const since = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${user.created_at.replace(" ", "T")}Z`),
  );

  return (
    <div className="shell grid grid-cols-12 gap-x-6 gap-y-16">
      <header className="col-span-12">
        <p className="text-olive">{welcomeNew ? a.ready : a.title}</p>
        <h1 className="font-display mt-4 text-[clamp(2.8rem,7vw,6.4rem)] leading-[0.98] text-basalt">{a.welcome.replace("{name}", user.name.split(" ")[0])}</h1>
      </header>

      <section aria-labelledby="next-title" className="col-span-12 lg:col-span-7">
        <h2 id="next-title" className="text-sm text-olive">
          {a.nextTitle}
        </h2>
        <div className="mt-6 bg-basalt p-[clamp(1.75rem,4vw,3rem)] text-paper">
          <h3 className="font-display text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.05]">{next.title}</h3>
          <p className="mt-4 max-w-[34rem] text-sand">{next.text}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href={`/${locale}/contact`} className="inline-flex h-13 items-center bg-bronze px-7 text-basalt transition-colors duration-[var(--dur-micro)] hover:bg-sand">
              {next.cta}
            </Link>
            {site.customerService.display && (
              <p className="text-sm text-sand">
                {a.callUs}{" "}
                <a href={`tel:${site.customerService.tel}`} dir="ltr" className="text-paper underline decoration-bronze underline-offset-4">
                  {site.customerService.display}
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="details-title" className="col-span-12 lg:col-span-4 lg:col-start-9">
        <h2 id="details-title" className="text-sm text-olive">
          {a.details}
        </h2>
        <dl className="mt-6 divide-y divide-basalt/10 border-y border-basalt/10">
          {[
            [t.auth.name, user.name],
            [t.auth.email, user.email],
            ...(user.phone ? [[t.auth.phone.replace(/\s*\(.*\)/, ""), user.phone]] : []),
            [a.type, t.auth.types[user.account_type]],
            [a.memberSince, since],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 py-4">
              <dt className="text-sm text-olive">{k}</dt>
              <dd className="text-end text-basalt" dir={k === t.auth.email ? "ltr" : undefined}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
        <form action={signOut} className="mt-8">
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className="inline-flex h-11 items-center border border-basalt/30 px-5 text-basalt transition-colors duration-[var(--dur-micro)] hover:border-basalt">
            {a.signOut}
          </button>
        </form>
      </section>
    </div>
  );
}
