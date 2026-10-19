import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import { formatDate, readingLabel, readingMinutes, type Article } from "@/content/insights";

export function ArticleMeta({ a, locale, className = "" }: { a: Article; t?: Dictionary; locale: Locale; className?: string }) {
  return (
    <p className={`flex flex-wrap gap-x-5 gap-y-1 text-sm text-olive ${className}`}>
      <span>{a.content[locale].category}</span>
      <time dateTime={a.date}>{formatDate(a.date, locale)}</time>
      <span>{readingLabel(readingMinutes(a, locale), locale)}</span>
    </p>
  );
}
