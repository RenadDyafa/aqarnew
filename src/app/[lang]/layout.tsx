import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { DM_Serif_Display, IBM_Plex_Sans, IBM_Plex_Sans_Arabic, Reem_Kufi } from "next/font/google";
import "../globals.css";
import { defaultLocale, dirOf, hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Nav } from "@/components/ui/Nav";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { Assistant } from "@/components/ui/Assistant";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Footer } from "@/components/sections/Footer";
import { Intro } from "@/components/ui/Intro";
import { INTRO_KEY } from "@/lib/intro";

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-serif", display: "swap" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex", display: "swap" });
const plexAr = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500"], variable: "--font-plex-ar", display: "swap" });
const kufi = Reem_Kufi({ subsets: ["arabic"], weight: "variable", variable: "--font-kufi", display: "swap" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { languages: { en: "/en", ar: "/ar" } },
    icons: { icon: "/aqar-mark.svg" },
  };
}

export const viewport: Viewport = { themeColor: "#f7f5f0" };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  // Unknown locales are rejected by the page (notFound); the root layout only needs a valid shell.
  const { lang: raw } = await params;
  const lang = hasLocale(raw) ? raw : defaultLocale;
  const t = getDictionary(lang);

  return (
    // suppressHydrationWarning: the intro-seen script below may add a class before React loads.
    <html lang={lang} dir={dirOf(lang)} suppressHydrationWarning className={`${serif.variable} ${plex.variable} ${plexAr.variable} ${kufi.variable}`}>
      <body>
        {/* Runs before hydration so a returning visitor never sees a flash of the opening screen. */}
        <Script id="intro-seen" strategy="beforeInteractive">
          {`try{if(sessionStorage.getItem("${INTRO_KEY}"))document.documentElement.classList.add("intro-seen")}catch(e){}`}
        </Script>
        <Intro t={t.intro} locale={lang} />
        <SmoothScroll>
          {/* Nav reads the pathname; Suspense keeps unknown article slugs prerenderable. */}
          <Suspense fallback={null}>
            <Nav t={t} locale={lang} />
          </Suspense>
          {children}
          <Footer t={t} locale={lang} />
          <CookieConsent t={t} locale={lang} />
          <WhatsAppButton t={t.whatsapp} />
          <Assistant t={t} locale={lang} />
        </SmoothScroll>
      </body>
    </html>
  );
}
