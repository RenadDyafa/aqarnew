import type { MetadataRoute } from "next";
import { articles } from "@/content/insights";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aqardyafa.com";
const paths = ["", "/owners", "/corporate", "/insights", "/contact", ...articles.map((a) => `/insights/${a.slug}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    ["en", "ar"].map((lang) => ({
      url: `${SITE}/${lang}${path}`,
      alternates: { languages: { en: `${SITE}/en${path}`, ar: `${SITE}/ar${path}` } },
    })),
  );
}
