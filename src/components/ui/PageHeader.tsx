import Link from "next/link";
import type { ReactNode } from "react";

/** Header for the editorial pages: breadcrumb, a large title, an optional intro. */
export function PageHeader({ crumbs, title, intro }: { crumbs: { href?: string; label: string }[]; title: ReactNode; intro?: string }) {
  return (
    <header className="shell pb-[8vh] pt-[clamp(7rem,18vh,11rem)]">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-olive">
          {crumbs.map((c, i) => (
            <li key={c.label} className="flex items-center gap-2">
              {c.href ? (
                <Link href={c.href} className="hover:text-basalt">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-basalt">
                  {c.label}
                </span>
              )}
              {i < crumbs.length - 1 && <span aria-hidden className="text-olive/60">/</span>}
            </li>
          ))}
        </ol>
      </nav>
      <h1 className="font-display mt-8 max-w-[18ch] text-[clamp(3rem,9vw,8.5rem)] leading-[0.95] text-basalt">{title}</h1>
      {intro && <p className="mt-8 max-w-[38rem] text-[1.15rem] leading-[1.65] text-olive">{intro}</p>}
    </header>
  );
}
